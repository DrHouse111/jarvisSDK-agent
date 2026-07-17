const { execFile } = require('child_process');
const { promisify } = require('util');
const os = require('os');
const path = require('path');
const fs = require('fs/promises');

const execFileAsync = promisify(execFile);

/**
 * Linux/Ubuntu specific system utilities for Jarvis assistant
 */

/**
 * Check if running on Linux
 * @returns {boolean}
 */
function isLinux() {
  return os.platform() === 'linux';
}

/**
 * Get Linux distribution info
 * @returns {Promise<Object>}
 */
async function getLinuxDistroInfo() {
  try {
    // Try /etc/os-release first (most modern approach)
    const osRelease = await fs.readFile('/etc/os-release', 'utf8');
    const info = {};
    osRelease.split('\n').forEach(line => {
      const [key, value] = line.split('=');
      if (key) {
        info[key.toLowerCase()] = value ? value.replace(/"/g, '') : '';
      }
    });
    return info;
  } catch {
    // Fallback methods
    try {
      const { stdout } = await execFileAsync('lsb_release', ['-a']);
      return { description: stdout };
    } catch {
      return { name: 'Unknown Linux' };
    }
  }
}

/**
 * Check system audio devices
 * @returns {Promise<Object>}
 */
async function checkAudioDevices() {
  try {
    const { stdout: pactl } = await execFileAsync('pactl', ['list', 'short']);
    const devices = {
      sinks: [],
      sources: [],
    };

    pactl.split('\n').forEach(line => {
      if (line.includes('RUNNING')) {
        if (line.startsWith('SINK')) {
          devices.sinks.push(line);
        } else if (line.startsWith('SOURCE')) {
          devices.sources.push(line);
        }
      }
    });

    return {
      available: true,
      sinkCount: devices.sinks.length,
      sourceCount: devices.sources.length,
      details: devices,
    };
  } catch (error) {
    return {
      available: false,
      error: 'PulseAudio not available. Install with: sudo apt install pulseaudio',
      details: error.message,
    };
  }
}

/**
 * Optimize system performance for Jarvis
 * @returns {Promise<Object>}
 */
async function optimizeSystemPerformance() {
  const optimizations = {};

  // Check and suggest virtual memory optimization
  try {
    const { stdout } = await execFileAsync('cat', ['/proc/meminfo']);
    const memInfo = {};
    stdout.split('\n').forEach(line => {
      const [key, value] = line.split(':');
      if (key) {
        memInfo[key.trim()] = parseInt(value);
      }
    });

    const totalMem = memInfo['MemTotal'];
    const availMem = memInfo['MemAvailable'];
    const usagePercent = ((totalMem - availMem) / totalMem) * 100;

    optimizations.memory = {
      total: `${Math.round(totalMem / 1024 / 1024)} GB`,
      available: `${Math.round(availMem / 1024 / 1024)} GB`,
      usagePercent: Math.round(usagePercent),
      status: usagePercent > 80 ? 'warning' : 'ok',
    };
  } catch (error) {
    optimizations.memory = { error: 'Could not read memory info' };
  }

  // CPU info
  try {
    const { stdout } = await execFileAsync('grep', ['-c', '^processor', '/proc/cpuinfo']);
    optimizations.cpu = {
      cores: parseInt(stdout.trim()),
    };
  } catch (error) {
    optimizations.cpu = { error: 'Could not read CPU info' };
  }

  return optimizations;
}

/**
 * Set up audio permissions for current user
 * @returns {Promise<Object>}
 */
async function setupAudioPermissions() {
  const results = {};

  try {
    // Check if user is in audio group
    const { stdout } = await execFileAsync('groups');
    const hasAudioGroup = stdout.includes('audio');

    results.audioGroup = hasAudioGroup
      ? 'User has audio group permissions'
      : 'User missing audio group. Run: sudo usermod -aG audio $USER';

    return results;
  } catch (error) {
    return { error: 'Could not check audio permissions' };
  }
}

/**
 * Check required system dependencies
 * @returns {Promise<Object>}
 */
async function checkSystemDependencies() {
  const dependencies = {
    pulseaudio: false,
    alsa: false,
    sox: false,
    ffmpeg: false,
  };

  const commands = {
    pulseaudio: 'pactl',
    alsa: 'amixer',
    sox: 'sox',
    ffmpeg: 'ffmpeg',
  };

  for (const [dep, cmd] of Object.entries(commands)) {
    try {
      await execFileAsync('which', [cmd]);
      dependencies[dep] = true;
    } catch {
      dependencies[dep] = false;
    }
  }

  return {
    installed: dependencies,
    missingInstallCommand: 'sudo apt install ' + 
      Object.entries(dependencies)
        .filter(([_, installed]) => !installed)
        .map(([dep]) => {
          const pkgMap = {
            pulseaudio: 'pulseaudio',
            alsa: 'alsa-utils',
            sox: 'sox',
            ffmpeg: 'ffmpeg',
          };
          return pkgMap[dep];
        })
        .join(' '),
  };
}

/**
 * Get system information for diagnostics
 * @returns {Promise<Object>}
 */
async function getSystemDiagnostics() {
  const diagnostics = {
    platform: os.platform(),
    arch: os.arch(),
    uptime: Math.round(os.uptime() / 3600) + ' hours',
    loadAverage: os.loadavg(),
    userInfo: os.userInfo(),
  };

  if (isLinux()) {
    diagnostics.distro = await getLinuxDistroInfo();
    diagnostics.audio = await checkAudioDevices();
    diagnostics.performance = await optimizeSystemPerformance();
    diagnostics.dependencies = await checkSystemDependencies();
    diagnostics.audioPermissions = await setupAudioPermissions();
  }

  return diagnostics;
}

module.exports = {
  isLinux,
  getLinuxDistroInfo,
  checkAudioDevices,
  optimizeSystemPerformance,
  setupAudioPermissions,
  checkSystemDependencies,
  getSystemDiagnostics,
};
