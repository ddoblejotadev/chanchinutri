#!/usr/bin/env node

const { execSync, spawnSync } = require('node:child_process');

const QUALITY_PATH_PATTERNS = [
  /^src\//,
  /^__tests__\//,
  /^scripts\//,
  /^android\//,
  /^ios\//,
  /^package(-lock)?\.json$/,
  /^app\.json$/,
  /^tsconfig\.json$/,
  /^babel\.config\.(js|cjs|mjs)$/,
  /^metro\.config\.(js|cjs|mjs)$/,
  /^jest\.config\.(js|cjs|mjs|ts)$/,
];

function normalizePath(filePath) {
  return filePath.replace(/\\/g, '/').trim();
}

function shouldRunQualityBase(stagedFiles) {
  if (!Array.isArray(stagedFiles) || stagedFiles.length === 0) {
    return false;
  }

  return stagedFiles.some((filePath) => {
    const normalized = normalizePath(filePath);
    return QUALITY_PATH_PATTERNS.some((pattern) => pattern.test(normalized));
  });
}

function getStagedFiles() {
  const output = execSync('git diff --cached --name-only --diff-filter=ACMR', {
    encoding: 'utf8',
  });

  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function runCommand(command, args) {
  const result = spawnSync(command, args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  return typeof result.status === 'number' ? result.status : 1;
}

function isStrictModeEnabled(value = process.env.GGA_STRICT) {
  return String(value ?? '').trim() === '1';
}

function isGgaAvailable() {
  const command = process.platform === 'win32' ? 'cmd' : 'gga';
  const args = process.platform === 'win32' ? ['/c', 'gga', '--version'] : ['--version'];

  const result = spawnSync(command, args, {
    stdio: 'ignore',
    shell: process.platform === 'win32',
  });

  return result.status === 0;
}

function runGga() {
  if (!isGgaAvailable()) {
    console.log('`gga` no esta instalado localmente. Se omite chequeo GGA (opcional).');
    return 0;
  }

  const command = process.platform === 'win32' ? 'cmd' : 'gga';
  const args = process.platform === 'win32' ? ['/c', 'gga', 'run'] : ['run'];
  const status = runCommand(command, args);

  if (status !== 0) {
    if (isStrictModeEnabled()) {
      console.error('GGA fallo y GGA_STRICT=1. Se bloquea el commit.');
      return status;
    }

    console.warn('GGA fallo, pero no bloquea el commit (modo local opcional).');
    return 0;
  }

  return 0;
}

function runGate(stagedFiles = getStagedFiles()) {
  if (shouldRunQualityBase(stagedFiles)) {
    const qualityStatus = runCommand('npm', ['run', 'quality:base']);
    if (qualityStatus !== 0) {
      return qualityStatus;
    }
  } else {
    console.log('No code-impacting files staged. Skipping quality:base.');
  }

  return runGga();
}

if (require.main === module) {
  process.exit(runGate());
}

module.exports = {
  getStagedFiles,
  isStrictModeEnabled,
  runGate,
  shouldRunQualityBase,
};
