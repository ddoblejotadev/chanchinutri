import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const verifier = require('../scripts/verify-release-artifact.js');

type ZipEntry = {
  name: string;
  data?: Buffer;
};

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let j = 0; j < 8; j += 1) {
      const mask = -(crc & 1);
      crc = (crc >>> 1) ^ (0xedb88320 & mask);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function createStoredZip(entries: ZipEntry[]): Buffer {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let localOffset = 0;

  for (const entry of entries) {
    const nameBuffer = Buffer.from(entry.name, 'utf8');
    const data = entry.data ?? Buffer.alloc(0);
    const crc = crc32(data);

    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(nameBuffer.length, 26);
    localHeader.writeUInt16LE(0, 28);

    localParts.push(localHeader, nameBuffer, data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(nameBuffer.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(localOffset, 42);

    centralParts.push(centralHeader, nameBuffer);

    localOffset += localHeader.length + nameBuffer.length + data.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const centralOffset = localOffset;

  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(entries.length, 8);
  eocd.writeUInt16LE(entries.length, 10);
  eocd.writeUInt32LE(centralDirectory.length, 12);
  eocd.writeUInt32LE(centralOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, centralDirectory, eocd]);
}

describe('release artifact verifier', () => {
  test('fails when APK filename indicates debug build', () => {
    const result = verifier.verifyApkEntries('app-debug.apk', ['assets/index.android.bundle']);
    expect(result.passed).toBe(false);
    expect(result.reasons.join(' ')).toMatch(/debug/i);
  });

  test('fails when required runtime bundle is missing', () => {
    const result = verifier.verifyApkEntries('app-release.apk', ['AndroidManifest.xml']);
    expect(result.passed).toBe(false);
    expect(result.reasons.join(' ')).toMatch(/bundle/i);
  });

  test('passes when runtime bundle is present', () => {
    const result = verifier.verifyApkEntries('app-release.apk', ['assets/index.android.bundle']);
    expect(result.passed).toBe(true);
  });

  test('parses APK zip entries from disk', () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'apk-verify-'));
    const apkPath = path.join(tempDir, 'app-release.apk');
    const zipBuffer = createStoredZip([
      { name: 'AndroidManifest.xml', data: Buffer.from('manifest') },
      { name: 'assets/index.android.bundle', data: Buffer.from('bundle') },
    ]);

    fs.writeFileSync(apkPath, zipBuffer);

    const entries = verifier.listZipEntries(apkPath);
    expect(entries).toEqual(expect.arrayContaining(['AndroidManifest.xml', 'assets/index.android.bundle']));

    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});
