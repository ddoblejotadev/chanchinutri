/**
 * Tests for migrateDeviceData in src/store/authStore.ts
 *
 * Covers: successful migration, skipped when no device ID,
 * skipped when no user, and failure handling (fire-and-forget).
 */

import { useAuthStore } from '../src/store/authStore';
import { getCachedDeviceId } from '../src/lib/deviceId';
import { logger } from '../src/lib/logger';

jest.mock('../src/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
  },
}));

const mockLogger = logger as jest.Mocked<typeof logger>;

// ---------------------------------------------------------------------------
// Supabase chain mock: from(table).update(data).eq(col, val).is(col, val)
// ---------------------------------------------------------------------------

const mockIs = jest.fn();
const mockEq = jest.fn().mockReturnValue({ is: mockIs });
const mockUpdate = jest.fn().mockReturnValue({ eq: mockEq });
const mockFrom = jest.fn().mockReturnValue({ update: mockUpdate });

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      resetPasswordForEmail: jest.fn(),
    },
  },
  TABLES: { SAVED_DIETS: 'saved_diets', USER_PREFERENCES: 'user_preferences' },
}));

jest.mock('../src/lib/deviceId', () => ({
  getDeviceId: jest.fn().mockResolvedValue('device-abc-123'),
  getCachedDeviceId: jest.fn().mockReturnValue('device-abc-123'),
}));

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MOCK_USER_ID = 'user-xyz-456';
const MOCK_DEVICE_ID = 'device-abc-123';

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();

  // Default: migration chain returns success
  mockIs.mockResolvedValue({ error: null });

  // Reset auth store
  useAuthStore.setState({
    session: null,
    user: null,
    isLoading: false,
    isAuthenticated: false,
  });
});

// ---------------------------------------------------------------------------
// 1. Migration succeeds
// ---------------------------------------------------------------------------

describe('migrateDeviceData', () => {
  it('updates rows WHERE device_id=X AND user_id IS NULL with user_id=Y', async () => {
    // Set authenticated user
    useAuthStore.setState({
      user: { id: MOCK_USER_ID } as import('@supabase/supabase-js').User,
      isAuthenticated: true,
    });

    await useAuthStore.getState().migrateDeviceData();

    // Verify the Supabase chain
    expect(mockFrom).toHaveBeenCalledWith('saved_diets');
    expect(mockUpdate).toHaveBeenCalledWith({ user_id: MOCK_USER_ID });
    expect(mockEq).toHaveBeenCalledWith('device_id', MOCK_DEVICE_ID);
    expect(mockIs).toHaveBeenCalledWith('user_id', null);
  });

  // ---------------------------------------------------------------------------
  // 2. Skipped when no device ID
  // ---------------------------------------------------------------------------

  it('skips migration when getCachedDeviceId returns null', async () => {
    (getCachedDeviceId as jest.Mock).mockReturnValueOnce(null);

    // Set authenticated user
    useAuthStore.setState({
      user: { id: MOCK_USER_ID } as import('@supabase/supabase-js').User,
      isAuthenticated: true,
    });

    await useAuthStore.getState().migrateDeviceData();

    // No Supabase calls
    expect(mockFrom).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // 3. Skipped when no user
  // ---------------------------------------------------------------------------

  it('skips migration when no user is set', async () => {
    // user is null by default from beforeEach
    await useAuthStore.getState().migrateDeviceData();

    // No Supabase calls
    expect(mockFrom).not.toHaveBeenCalled();
  });

  // ---------------------------------------------------------------------------
  // 4. Failure does not throw (fire-and-forget)
  // ---------------------------------------------------------------------------

  it('does not throw when Supabase returns an error', async () => {
    mockLogger.error.mockImplementation(() => {});

    useAuthStore.setState({
      user: { id: MOCK_USER_ID } as import('@supabase/supabase-js').User,
      isAuthenticated: true,
    });

    mockIs.mockResolvedValue({ error: { message: 'Some DB error' } });

    // Should not throw
    await expect(useAuthStore.getState().migrateDeviceData()).resolves.toBeUndefined();

    // Error was logged
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error migrating device data:',
      expect.objectContaining({ message: 'Some DB error' }),
    );

    mockLogger.error.mockRestore();
  });

  it('does not throw when an exception is thrown', async () => {
    mockLogger.error.mockImplementation(() => {});

    useAuthStore.setState({
      user: { id: MOCK_USER_ID } as import('@supabase/supabase-js').User,
      isAuthenticated: true,
    });

    mockIs.mockRejectedValue(new Error('Network failure'));

    // Should not throw
    await expect(useAuthStore.getState().migrateDeviceData()).resolves.toBeUndefined();

    // Error was logged
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Error during device data migration:',
      expect.any(Error),
    );

    mockLogger.error.mockRestore();
  });
});
