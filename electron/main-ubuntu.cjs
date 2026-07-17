/**
 * Ubuntu/Linux optimized Electron main process for Jarvis Assistant
 * Integrates Google APIs and system optimizations for Linux
 */

const { app, BrowserWindow, ipcMain, nativeImage, screen } = require('electron');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');
const path = require('node:path');
const fs = require('node:fs/promises');
const crypto = require('node:crypto');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Import Google API client and Linux utilities
const googleAPI = require('./google-api-client.cjs');
const linuxUtils = require('./linux-system-utils.cjs');

const execFileAsync = promisify(execFile);
const dataDir = path.join(process.cwd(), 'data');
const dbPath = path.join(dataDir, 'jarvis-db.json');

let currentMode = 'display';
let mainWindow = null;
let normalWindowBounds = null;
let dbWriteQueue = Promise.resolve();
let googleSetupStatus = null;

// Jarvis Assistant Instructions
const JARVIS_INSTRUCTIONS = `# Jarvis Personal AI Assistant

You are Jarvis, an intelligent personal AI assistant running on a Linux/Ubuntu system with Google Cloud integration.

## Personality and Characteristics
- Professional, helpful, and efficient
- Accurate and detail-oriented
- Respect user privacy and security
- Provide clear, concise responses
- Multi-lingual support via Google APIs

## Capabilities
- Real-time voice conversation (Google Speech-to-Text/Text-to-Speech)
- Generative AI responses (Google Gemini)
- Web search and research
- Note-taking and task management
- System information and diagnostics
- File management assistance

## Important Notes
- All data is processed securely
- Respect system resources
- Request confirmation for sensitive operations
- Provide helpful system recommendations`;

const toolSpecs = [
  {
    type: 'function',
    name: 'set_mode',
    description: 'Switch Jarvis between display mode and system control mode.',
    parameters: {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['display', 'system'] },
      },
      required: ['mode'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'google_speech_to_text',
    description: 'Convert audio to text using Google Speech-to-Text API.',
    parameters: {
      type: 'object',
      properties: {
        audioBuffer: { type: 'string', description: 'Base64 encoded audio data' },
        languageCode: { type: 'string', default: 'en-US' },
      },
      required: ['audioBuffer'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'google_text_to_speech',
    description: 'Convert text to speech using Google Text-to-Speech API.',
    parameters: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        voice: { type: 'string', default: 'en-US-Neural2-C' },
      },
      required: ['text'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'google_generative_ai',
    description: 'Generate intelligent responses using Google Gemini AI.',
    parameters: {
      type: 'object',
      properties: {
        prompt: { type: 'string' },
        stream: { type: 'boolean', default: false },
      },
      required: ['prompt'],
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'system_diagnostics',
    description: 'Get Linux system diagnostics and performance information.',
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'check_dependencies',
    description: 'Check if required system dependencies are installed.',
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'system_info',
    description: 'Get detailed system information.',
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
  {
    type: 'function',
    name: 'google_setup_status',
    description: 'Check Google API configuration and authentication status.',
    parameters: {
      type: 'object',
      properties: {},
      additionalProperties: false,
    },
  },
];

// Database operations
async function ensureData() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, JSON.stringify(defaultDb(), null, 2));
  }
}

function defaultDb() {
  return {
    notes: [],
    records: [],
    settings: {
      theme: 'dark',
      googleApisEnabled: process.env.GOOGLE_GENERATIVE_AI_ENABLED === 'true',
    },
  };
}

async function readDb() {
  await ensureData();
  const raw = await fs.readFile(dbPath, 'utf8');
  return JSON.parse(raw);
}

async function writeDb(db) {
  await ensureData();
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
}

async function updateDb(mutator) {
  const operation = dbWriteQueue.then(async () => {
    const db = await readDb();
    await mutator(db);
    await writeDb(db);
    return db;
  });
  dbWriteQueue = operation.catch(() => {});
  return operation;
}

// Window management optimized for Linux
async function createWindow() {
  await ensureData();
  
  // Get system info for window sizing
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;
  
  const win = new BrowserWindow({
    width: Math.min(1200, Math.round(width * 0.9)),
    height: Math.min(800, Math.round(height * 0.9)),
    minWidth: 420,
    minHeight: 520,
    title: 'Jarvis - Personal AI Assistant',
    icon: nativeImage.createEmpty(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow = win;

  // Request microphone permission
  win.webContents.session.setPermissionRequestHandler((_webContents, permission, callback) => {
    callback(permission === 'media');
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  if (devUrl) {
    await win.loadURL(devUrl);
  } else {
    await win.loadFile(path.join(process.cwd(), 'dist', 'index.html'));
  }
}

// IPC Handlers
ipcMain.handle('tools:list', () => toolSpecs);

ipcMain.handle('realtime:create-token', async () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is missing in .env.local');
  }

  const db = await readDb();
  const googleStatus = await googleAPI.validateGoogleSetup();

  const response = await fetch('https://api.openai.com/v1/realtime/client_secrets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Safety-Identifier': crypto.createHash('sha256').update('jarvis-linux').digest('hex'),
    },
    body: JSON.stringify({
      session: {
        type: 'realtime',
        model: 'gpt-realtime-2',
        instructions: JARVIS_INSTRUCTIONS,
        output_modalities: ['audio'],
        reasoning: { effort: 'low' },
        tool_choice: 'auto',
        tools: toolSpecs,
        audio: {
          input: {
            turn_detection: {
              type: 'semantic_vad',
              eagerness: 'medium',
              create_response: true,
              interrupt_response: true,
            },
          },
          output: {
            voice: 'alloy',
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Realtime token request failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  const value = data.value || data.client_secret?.value;
  if (!value) {
    throw new Error('Realtime token response did not include a client secret value.');
  }
  return { value, expiresAt: data.expires_at || data.client_secret?.expires_at || null };
});

ipcMain.handle('tools:execute', async (_event, toolCall) => {
  const name = String(toolCall?.name || '');
  const args = toolCall?.arguments || {};

  try {
    if (name === 'set_mode') {
      currentMode = args.mode === 'system' ? 'system' : 'display';
      return { ok: true, mode: currentMode };
    }

    if (name === 'google_setup_status') {
      if (!googleSetupStatus) {
        googleSetupStatus = await googleAPI.validateGoogleSetup();
      }
      return { ok: true, status: googleSetupStatus };
    }

    if (name === 'system_diagnostics') {
      const diagnostics = await linuxUtils.getSystemDiagnostics();
      return { ok: true, diagnostics };
    }

    if (name === 'check_dependencies') {
      const deps = await linuxUtils.checkSystemDependencies();
      return { ok: true, dependencies: deps };
    }

    if (name === 'system_info') {
      const distro = await linuxUtils.getLinuxDistroInfo();
      const audio = await linuxUtils.checkAudioDevices();
      return { ok: true, distro, audio };
    }

    if (name === 'google_generative_ai') {
      if (!process.env.GOOGLE_GENERATIVE_AI_ENABLED) {
        return { ok: false, error: 'Google Generative AI not enabled' };
      }

      try {
        const response = await googleAPI.generateAIResponse(args.prompt);
        return { ok: true, response };
      } catch (error) {
        return { ok: false, error: error.message };
      }
    }

    if (name === 'google_speech_to_text') {
      if (!process.env.GOOGLE_SPEECH_TO_TEXT_ENABLED) {
        return { ok: false, error: 'Speech-to-Text not enabled' };
      }

      try {
        const audioBuffer = Buffer.from(args.audioBuffer, 'base64');
        const text = await googleAPI.speechToText(audioBuffer, args.languageCode);
        return { ok: true, text };
      } catch (error) {
        return { ok: false, error: error.message };
      }
    }

    if (name === 'google_text_to_speech') {
      if (!process.env.GOOGLE_TEXT_TO_SPEECH_ENABLED) {
        return { ok: false, error: 'Text-to-Speech not enabled' };
      }

      try {
        const audioBuffer = await googleAPI.textToSpeech(args.text, args.voice);
        return { ok: true, audio: audioBuffer.toString('base64') };
      } catch (error) {
        return { ok: false, error: error.message };
      }
    }

    return { ok: false, error: `Unknown tool: ${name}` };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    void createWindow();
  }
});
