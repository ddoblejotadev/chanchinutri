// eslint-disable-next-line @typescript-eslint/no-var-requires
const preCommitGate = require('../scripts/pre-commit-gate.js');

describe('pre-commit gate file detection', () => {
  test('runs quality for app source changes', () => {
    expect(preCommitGate.shouldRunQualityBase(['src/screens/HomeScreen.tsx'])).toBe(true);
  });

  test('runs quality for project config changes', () => {
    expect(preCommitGate.shouldRunQualityBase(['package.json'])).toBe(true);
  });

  test('normalizes windows style paths', () => {
    expect(preCommitGate.shouldRunQualityBase(['src\\store\\dietStore.ts'])).toBe(true);
  });

  test('skips quality for docs-only changes', () => {
    expect(preCommitGate.shouldRunQualityBase(['README.md', 'docs/notes.md'])).toBe(false);
  });

  test('skips quality when nothing is staged', () => {
    expect(preCommitGate.shouldRunQualityBase([])).toBe(false);
  });
});

describe('pre-commit gate strict mode parser', () => {
  test('enables strict mode only for GGA_STRICT=1', () => {
    expect(preCommitGate.isStrictModeEnabled('1')).toBe(true);
  });

  test('keeps strict mode disabled for other values', () => {
    expect(preCommitGate.isStrictModeEnabled(undefined)).toBe(false);
    expect(preCommitGate.isStrictModeEnabled('')).toBe(false);
    expect(preCommitGate.isStrictModeEnabled('0')).toBe(false);
    expect(preCommitGate.isStrictModeEnabled('true')).toBe(false);
    expect(preCommitGate.isStrictModeEnabled('yes')).toBe(false);
  });
});
