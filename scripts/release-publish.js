#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

function readPackageVersion() {
  const packageJsonPath = path.resolve(__dirname, '..', 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return packageJson.version;
}

function run() {
  const [tagArg, notesArg] = process.argv.slice(2);
  const tag = tagArg || `v${readPackageVersion()}`;
  const notesFile = notesArg || `docs/releases/${tag}-notes.md`;
  const notesPath = path.resolve(process.cwd(), notesFile);

  if (!fs.existsSync(notesPath)) {
    console.error(`ERROR Notes file not found: ${notesFile}`);
    console.error('Usage: npm run release:publish -- <tag> <notes-file>');
    process.exit(1);
  }

  const result = spawnSync('gh', ['release', 'edit', tag, '--notes-file', notesFile], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  if (typeof result.status !== 'number') {
    console.error('ERROR Failed to execute gh command.');
    process.exit(1);
  }

  process.exit(result.status);
}

run();
