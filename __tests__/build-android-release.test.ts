jest.mock('node:fs', () => ({
  existsSync: jest.fn(),
}));

jest.mock('node:child_process', () => ({
  spawnSync: jest.fn(),
}));

import fs from 'node:fs';
import { spawnSync } from 'node:child_process';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const buildRelease = require('../scripts/build-android-release.js');

describe('build android release script', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('runs prebuild when android directory is missing', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (spawnSync as jest.Mock)
      .mockReturnValueOnce({ status: 0 })
      .mockReturnValueOnce({ status: 0 });

    const exitCode = buildRelease.runReleaseBuild();

    expect(exitCode).toBe(0);
    expect(spawnSync).toHaveBeenNthCalledWith(
      1,
      process.platform === 'win32' ? 'npx.cmd' : 'npx',
      ['expo', 'prebuild', '--platform', 'android', '--non-interactive', '--no-install'],
      expect.objectContaining({ stdio: 'inherit' }),
    );
    expect(spawnSync).toHaveBeenNthCalledWith(
      2,
      process.platform === 'win32' ? 'gradlew.bat' : './gradlew',
      ['app:assembleRelease'],
      expect.objectContaining({ stdio: 'inherit' }),
    );
  });

  test('skips prebuild when android directory already exists', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (spawnSync as jest.Mock).mockReturnValue({ status: 0 });

    const exitCode = buildRelease.runReleaseBuild();

    expect(exitCode).toBe(0);
    expect(spawnSync).toHaveBeenCalledTimes(1);
    expect(spawnSync).toHaveBeenCalledWith(
      process.platform === 'win32' ? 'gradlew.bat' : './gradlew',
      ['app:assembleRelease'],
      expect.objectContaining({ stdio: 'inherit' }),
    );
  });
});
