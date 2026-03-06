/**
 * Tests for src/lib/deviceId.ts
 *
 * Covers: UUID generation on first call, in-memory caching,
 * AsyncStorage persistence, and synchronous getCachedDeviceId access.
 */

const DEVICE_ID_KEY = '@evapig_device_id';

beforeEach(() => {
  jest.resetModules();
});

/** Require a fresh deviceId module and its AsyncStorage instance. */
function loadModules() {
  // After resetModules, require gives fresh instances that share the same
  // internal mock storage.
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const AsyncStorage = require('@react-native-async-storage/async-storage') as {
    getItem: jest.Mock;
    setItem: jest.Mock;
    clear: jest.Mock;
    __INTERNAL_MOCK_STORAGE__: Record<string, string>;
  };
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const deviceIdMod = require('../src/lib/deviceId') as typeof import('../src/lib/deviceId');

  // Clear storage for isolation
  AsyncStorage.__INTERNAL_MOCK_STORAGE__ = {};

  return { ...deviceIdMod, AsyncStorage };
}

describe('getDeviceId', () => {
  it('generates a UUID on first call when nothing is stored', async () => {
    const { getDeviceId } = loadModules();

    const id = await getDeviceId();

    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
    // Our expo-crypto mock returns "mock-uuid-N"
    expect(id).toMatch(/^mock-uuid-\d+$/);
  });

  it('returns the same value on subsequent calls (in-memory cache)', async () => {
    const { getDeviceId } = loadModules();

    const first = await getDeviceId();
    const second = await getDeviceId();

    expect(second).toBe(first);
  });

  it('persists the generated ID to AsyncStorage', async () => {
    const { getDeviceId, AsyncStorage } = loadModules();

    const id = await getDeviceId();
    const storedValue = await AsyncStorage.getItem(DEVICE_ID_KEY);

    expect(storedValue).toBe(id);
  });

  it('reads a previously stored ID from AsyncStorage instead of generating a new one', async () => {
    const { getDeviceId, AsyncStorage } = loadModules();

    // Pre-seed storage with a known value
    await AsyncStorage.setItem(DEVICE_ID_KEY, 'pre-existing-device-id');

    const id = await getDeviceId();

    expect(id).toBe('pre-existing-device-id');
  });
});

describe('getCachedDeviceId', () => {
  it('returns null before getDeviceId has been called', () => {
    const { getCachedDeviceId } = loadModules();

    expect(getCachedDeviceId()).toBeNull();
  });

  it('returns the device ID after getDeviceId has been called', async () => {
    const { getDeviceId, getCachedDeviceId } = loadModules();

    const id = await getDeviceId();
    const cached = getCachedDeviceId();

    expect(cached).toBe(id);
  });
});
