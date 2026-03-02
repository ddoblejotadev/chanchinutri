#!/usr/bin/env node

const fs = require('node:fs');
const { spawnSync } = require('node:child_process');
const path = require('node:path');

const rootDir = path.resolve(__dirname, '..');
const androidDir = path.join(rootDir, 'android');
const gradleExecutable = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
const npxExecutable = process.platform === 'win32' ? 'npx.cmd' : 'npx';

function runCommand(command, args, cwd) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (typeof result.status === 'number') {
    return result.status;
  }

  return 1;
}

function ensureAndroidProjectExists() {
  if (fs.existsSync(androidDir)) {
    return 0;
  }

  return runCommand(
    npxExecutable,
    ['expo', 'prebuild', '--platform', 'android', '--non-interactive', '--no-install'],
    rootDir,
  );
}

function runReleaseBuild() {
  const prebuildStatus = ensureAndroidProjectExists();
  if (prebuildStatus !== 0) {
    return prebuildStatus;
  }

  return runCommand(gradleExecutable, ['app:assembleRelease'], androidDir);
}

if (require.main === module) {
  process.exit(runReleaseBuild());
}

module.exports = {
  runReleaseBuild,
};
