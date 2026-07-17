const speech = require('@google-cloud/speech');
const textToSpeech = require('@google-cloud/text-to-speech');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const path = require('path');
const fs = require('fs/promises');

// Initialize Google Cloud clients
const speechClient = new speech.SpeechClient();
const ttsClient = new textToSpeech.TextToSpeechClient();

let genAI = null;

/**
 * Initialize Google Generative AI client
 * @returns {Promise<void>}
 */
async function initializeGenAI() {
  const apiKey = process.env.GOOGLE_API_KEY || process.env.GOOGLE_CLOUD_API_KEY;
  
  if (!apiKey) {
    throw new Error('GOOGLE_API_KEY is missing. Configure it in .env.local');
  }
  
  genAI = new GoogleGenerativeAI(apiKey);
}

/**
 * Convert speech audio to text using Google Speech-to-Text API
 * @param {Buffer} audioBuffer - Audio data buffer
 * @param {string} languageCode - Language code (e.g., 'en-US')
 * @returns {Promise<string>} Transcribed text
 */
async function speechToText(audioBuffer, languageCode = 'en-US') {
  if (!speechClient) {
    throw new Error('Google Speech-to-Text client not initialized');
  }

  const audio = {
    content: audioBuffer.toString('base64'),
  };

  const config = {
    encoding: 'LINEAR16',
    sampleRateHertz: 16000,
    languageCode,
    enableAutomaticPunctuation: true,
    model: 'latest_long',
  };

  const request = { audio, config };

  try {
    const [response] = await speechClient.recognize(request);
    const transcription = response.results
      .map(result => result.alternatives[0].transcript)
      .join(' ');
    return transcription;
  } catch (error) {
    console.error('Speech-to-Text error:', error);
    throw new Error(`Speech recognition failed: ${error.message}`);
  }
}

/**
 * Convert text to speech using Google Text-to-Speech API
 * @param {string} text - Text to synthesize
 * @param {string} voiceName - Voice name (e.g., 'en-US-Neural2-C')
 * @returns {Promise<Buffer>} Audio buffer
 */
async function textToSpeech(text, voiceName = process.env.ASSISTANT_VOICE || 'en-US-Neural2-C') {
  if (!ttsClient) {
    throw new Error('Google Text-to-Speech client not initialized');
  }

  const request = {
    input: { text },
    voice: {
      languageCode: 'en-US',
      name: voiceName,
    },
    audioConfig: {
      audioEncoding: 'LINEAR16',
      sampleRateHertz: 16000,
      pitch: 0.0,
      speakingRate: 1.0,
    },
  };

  try {
    const [response] = await ttsClient.synthesizeSpeech(request);
    return Buffer.from(response.audioContent, 'base64');
  } catch (error) {
    console.error('Text-to-Speech error:', error);
    throw new Error(`Text synthesis failed: ${error.message}`);
  }
}

/**
 * Generate response using Google Generative AI (Gemini)
 * @param {string} prompt - User prompt
 * @param {Array} conversationHistory - Previous messages for context
 * @returns {Promise<string>} Generated response
 */
async function generateAIResponse(prompt, conversationHistory = []) {
  if (!genAI) {
    await initializeGenAI();
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: process.env.GOOGLE_GENERATIVE_AI_MODEL || 'gemini-1.5-pro'
    });

    // Build message history for context
    const messages = [
      ...conversationHistory,
      { role: 'user', parts: [{ text: prompt }] }
    ];

    const chat = model.startChat({
      history: conversationHistory.slice(0, -1), // Exclude the last user message
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response.text();
    
    return response;
  } catch (error) {
    console.error('Generative AI error:', error);
    throw new Error(`AI response generation failed: ${error.message}`);
  }
}

/**
 * Stream text generation for real-time responses
 * @param {string} prompt - User prompt
 * @param {Function} onChunk - Callback for each chunk of text
 * @returns {Promise<void>}
 */
async function streamAIResponse(prompt, onChunk) {
  if (!genAI) {
    await initializeGenAI();
  }

  try {
    const model = genAI.getGenerativeModel({ 
      model: process.env.GOOGLE_GENERATIVE_AI_MODEL || 'gemini-1.5-pro'
    });

    const stream = await model.generateContentStream(prompt);

    for await (const chunk of stream.stream) {
      const text = chunk.text();
      if (text && onChunk) {
        onChunk(text);
      }
    }
  } catch (error) {
    console.error('Stream generation error:', error);
    throw new Error(`Streaming failed: ${error.message}`);
  }
}

/**
 * Check if Google APIs are properly configured
 * @returns {Promise<Object>} Status object with configuration details
 */
async function validateGoogleSetup() {
  const status = {
    speechToTextEnabled: process.env.GOOGLE_SPEECH_TO_TEXT_ENABLED === 'true',
    textToSpeechEnabled: process.env.GOOGLE_TEXT_TO_SPEECH_ENABLED === 'true',
    generativeAIEnabled: process.env.GOOGLE_GENERATIVE_AI_ENABLED === 'true',
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'not configured',
    hasServiceAccount: !!process.env.GOOGLE_APPLICATION_CREDENTIALS,
    hasApiKey: !!(process.env.GOOGLE_API_KEY || process.env.GOOGLE_CLOUD_API_KEY),
  };

  // Verify credentials file exists if specified
  if (status.hasServiceAccount) {
    try {
      const credPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
      await fs.access(credPath);
      status.credentialsValid = true;
    } catch {
      status.credentialsValid = false;
      status.warning = 'Service account credentials file not found';
    }
  }

  return status;
}

module.exports = {
  initializeGenAI,
  speechToText,
  textToSpeech,
  generateAIResponse,
  streamAIResponse,
  validateGoogleSetup,
};
