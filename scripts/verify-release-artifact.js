#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const EOCD_SIGNATURE = 0x06054b50;
const CENTRAL_FILE_HEADER_SIGNATURE = 0x02014b50;
const MAX_EOCD_SCAN = 65557;

const RUNTIME_ASSET_PATTERNS = [
  /(^|\/)assets\/index\.android\.bundle$/,
  /(^|\/)index\.android\.bundle$/,
  /(^|\/)assets\/index\.android\.bundle\.hbc$/,
  /(^|\/)assets\/index\.bundle$/,
  /(^|\/)index\.bundle$/,
];

function findEocdOffset(buffer) {
  const minOffset = Math.max(0, buffer.length - MAX_EOCD_SCAN);
  for (let offset = buffer.length - 22; offset >= minOffset; offset -= 1) {
    if (buffer.readUInt32LE(offset) === EOCD_SIGNATURE) {
      return offset;
    }
  }
  return -1;
}

function listZipEntries(filePath) {
  const buffer = fs.readFileSync(filePath);
  const eocdOffset = findEocdOffset(buffer);

  if (eocdOffset < 0) {
    throw new Error('EOCD signature not found (invalid ZIP/APK).');
  }

  const totalEntries = buffer.readUInt16LE(eocdOffset + 10);
  const centralDirectoryOffset = buffer.readUInt32LE(eocdOffset + 16);
  const entryNames = [];

  let cursor = centralDirectoryOffset;
  for (let index = 0; index < totalEntries; index += 1) {
    if (cursor + 46 > buffer.length) {
      throw new Error('Central directory appears truncated.');
    }

    const signature = buffer.readUInt32LE(cursor);
    if (signature !== CENTRAL_FILE_HEADER_SIGNATURE) {
      throw new Error('Invalid central directory file header signature.');
    }

    const fileNameLength = buffer.readUInt16LE(cursor + 28);
    const extraLength = buffer.readUInt16LE(cursor + 30);
    const commentLength = buffer.readUInt16LE(cursor + 32);
    const fileNameStart = cursor + 46;
    const fileNameEnd = fileNameStart + fileNameLength;

    if (fileNameEnd > buffer.length) {
      throw new Error('Invalid file name length in central directory entry.');
    }

    entryNames.push(buffer.toString('utf8', fileNameStart, fileNameEnd));

    cursor = fileNameEnd + extraLength + commentLength;
  }

  return entryNames;
}

function isDebugArtifactName(fileName) {
  return /(^|[-_.])debug([-.]|$)/i.test(fileName);
}

function hasRuntimeAsset(entryNames) {
  return entryNames.some((entryName) => RUNTIME_ASSET_PATTERNS.some((pattern) => pattern.test(entryName)));
}

function verifyApkEntries(apkPath, entryNames) {
  const reasons = [];
  const fileName = path.basename(apkPath);

  if (!fileName.toLowerCase().endsWith('.apk')) {
    reasons.push('Artifact must use .apk extension.');
  }

  if (isDebugArtifactName(fileName)) {
    reasons.push('Filename indicates a debug artifact; release channel only allows release APKs.');
  }

  if (!hasRuntimeAsset(entryNames)) {
    reasons.push(
      'Missing runtime startup bundle (expected assets/index.android.bundle or equivalent Expo/React Native bundle asset).',
    );
  }

  return {
    apkPath,
    passed: reasons.length === 0,
    reasons,
  };
}

function verifyApkFile(apkPath) {
  if (!fs.existsSync(apkPath)) {
    return {
      apkPath,
      passed: false,
      reasons: ['APK file does not exist.'],
    };
  }

  try {
    const entries = listZipEntries(apkPath);
    return verifyApkEntries(apkPath, entries);
  } catch (error) {
    return {
      apkPath,
      passed: false,
      reasons: [`Could not inspect APK contents: ${error.message}`],
    };
  }
}

function printResult(result) {
  const status = result.passed ? 'PASS' : 'FAIL';
  console.log(`${status} ${result.apkPath}`);
  if (!result.passed) {
    result.reasons.forEach((reason) => {
      console.log(`  - ${reason}`);
    });
  }
}

function runCli(apkPaths) {
  if (!apkPaths.length) {
    console.error('FAIL No APK paths provided. Usage: node scripts/verify-release-artifact.js <apk-path> [more paths]');
    return 1;
  }

  const results = apkPaths.map((apkPath) => verifyApkFile(apkPath));
  results.forEach(printResult);

  const failed = results.filter((result) => !result.passed);
  if (failed.length > 0) {
    console.error(`Release artifact verification: FAIL (${failed.length}/${results.length} artifacts failed)`);
    return 1;
  }

  console.log(`Release artifact verification: PASS (${results.length}/${results.length} artifacts passed)`);
  return 0;
}

if (require.main === module) {
  const exitCode = runCli(process.argv.slice(2));
  process.exit(exitCode);
}

module.exports = {
  hasRuntimeAsset,
  isDebugArtifactName,
  listZipEntries,
  runCli,
  verifyApkEntries,
  verifyApkFile,
};
