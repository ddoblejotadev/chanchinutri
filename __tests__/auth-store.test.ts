/**
 * Tests for src/store/authStore.ts
 *
 * Covers: initAuth session restore & loading state, signUp success/failure,
 * signIn success/failure, signOut, and resetPassword.
 */

import { useAuthStore } from '../src/store/authStore';

// ---------------------------------------------------------------------------
// Supabase auth mock — individual jest.fn() references for assertions
// ---------------------------------------------------------------------------

const mockGetSession = jest.fn();
const mockSignUp = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSignOut = jest.fn();
const mockResetPasswordForEmail = jest.fn();
const mockOnAuthStateChange = jest.fn();

// Chain mock for migrateDeviceData (from().update().eq().is())
const mockIs = jest.fn().mockResolvedValue({ error: null });
const mockMigrateEq = jest.fn().mockReturnValue({ is: mockIs });
const mockUpdate = jest.fn().mockReturnValue({ eq: mockMigrateEq });
const mockFrom = jest.fn().mockReturnValue({ update: mockUpdate });

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    auth: {
      getSession: (...args: unknown[]) => mockGetSession(...args),
      signUp: (...args: unknown[]) => mockSignUp(...args),
      signInWithPassword: (...args: unknown[]) => mockSignInWithPassword(...args),
      signOut: (...args: unknown[]) => mockSignOut(...args),
      resetPasswordForEmail: (...args: unknown[]) => mockResetPasswordForEmail(...args),
      onAuthStateChange: (...args: unknown[]) => mockOnAuthStateChange(...args),
    },
  },
  TABLES: { SAVED_DIETS: 'saved_diets', USER_PREFERENCES: 'user_preferences' },
}));

jest.mock('../src/lib/deviceId', () => ({
  getDeviceId: jest.fn().mockResolvedValue('test-device-id'),
  getCachedDeviceId: jest.fn().mockReturnValue('test-device-id'),
}));

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MOCK_USER = { id: 'user-123', email: 'test@example.com' };
const MOCK_SESSION = { user: MOCK_USER, access_token: 'tok', refresh_token: 'rtok' };

/** Reset store to clean defaults before each test. */
function resetAuthStore() {
  useAuthStore.setState({
    session: null,
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(() => {
  jest.clearAllMocks();
  resetAuthStore();

  // Default: onAuthStateChange does nothing, returns unsubscribe stub
  mockOnAuthStateChange.mockReturnValue({
    data: { subscription: { unsubscribe: jest.fn() } },
  });
});

// ---------------------------------------------------------------------------
// 1. initAuth — sets isLoading true then false
// ---------------------------------------------------------------------------

describe('initAuth', () => {
  it('sets isLoading true then false', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    // isLoading starts true by default
    expect(useAuthStore.getState().isLoading).toBe(true);

    await useAuthStore.getState().initAuth();

    expect(useAuthStore.getState().isLoading).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 2. initAuth — restores existing session
  // ---------------------------------------------------------------------------

  it('restores existing session from getSession', async () => {
    mockGetSession.mockResolvedValue({
      data: { session: MOCK_SESSION },
      error: null,
    });

    await useAuthStore.getState().initAuth();

    const state = useAuthStore.getState();
    expect(state.session).toBe(MOCK_SESSION);
    expect(state.user).toBe(MOCK_USER);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
  });

  // ---------------------------------------------------------------------------
  // 3. initAuth — no existing session
  // ---------------------------------------------------------------------------

  it('leaves user/session null when getSession returns null', async () => {
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });

    await useAuthStore.getState().initAuth();

    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. signUp — success
// ---------------------------------------------------------------------------

describe('signUp', () => {
  it('returns no error on success and calls supabase.auth.signUp', async () => {
    mockSignUp.mockResolvedValue({ data: { user: MOCK_USER }, error: null });

    // Set user so migrateDeviceData has a user to work with
    useAuthStore.setState({ user: MOCK_USER as import('@supabase/supabase-js').User });

    const result = await useAuthStore.getState().signUp('test@example.com', 'password123');

    expect(result.error).toBeNull();
    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  // ---------------------------------------------------------------------------
  // 5. signUp — failure returns error in Spanish
  // ---------------------------------------------------------------------------

  it('returns mapped Spanish error on failure', async () => {
    mockSignUp.mockResolvedValue({
      data: {},
      error: { message: 'User already registered' },
    });

    const result = await useAuthStore.getState().signUp('test@example.com', 'password123');

    expect(result.error).toBe('Este email ya está registrado');
  });

  it('maps short password error to Spanish', async () => {
    mockSignUp.mockResolvedValue({
      data: {},
      error: { message: 'Password should be at least 6 characters' },
    });

    const result = await useAuthStore.getState().signUp('test@example.com', '123');

    expect(result.error).toBe('La contraseña debe tener al menos 6 caracteres');
  });
});

// ---------------------------------------------------------------------------
// 6. signIn — success
// ---------------------------------------------------------------------------

describe('signIn', () => {
  it('returns no error on success and calls supabase.auth.signInWithPassword', async () => {
    mockSignInWithPassword.mockResolvedValue({ data: { user: MOCK_USER }, error: null });

    // Set user so migrateDeviceData has a user to work with
    useAuthStore.setState({ user: MOCK_USER as import('@supabase/supabase-js').User });

    const result = await useAuthStore.getState().signIn('test@example.com', 'password123');

    expect(result.error).toBeNull();
    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    });
  });

  // ---------------------------------------------------------------------------
  // 7. signIn — failure returns error in Spanish
  // ---------------------------------------------------------------------------

  it('returns mapped Spanish error on failure', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {},
      error: { message: 'Invalid login credentials' },
    });

    const result = await useAuthStore.getState().signIn('test@example.com', 'wrong');

    expect(result.error).toBe('Email o contraseña incorrectos');
  });

  it('maps rate limit error to Spanish', async () => {
    mockSignInWithPassword.mockResolvedValue({
      data: {},
      error: { message: 'For security purposes, you can only request this once every 60 seconds' },
    });

    const result = await useAuthStore.getState().signIn('test@example.com', 'pass');

    expect(result.error).toBe('Demasiados intentos. Esperá unos minutos.');
  });
});

// ---------------------------------------------------------------------------
// 8. signOut — clears session and user
// ---------------------------------------------------------------------------

describe('signOut', () => {
  it('clears session, user, and isAuthenticated', async () => {
    // Start authenticated
    useAuthStore.setState({
      session: MOCK_SESSION as import('@supabase/supabase-js').Session,
      user: MOCK_USER as import('@supabase/supabase-js').User,
      isAuthenticated: true,
    });
    mockSignOut.mockResolvedValue({ error: null });

    await useAuthStore.getState().signOut();

    const state = useAuthStore.getState();
    expect(state.session).toBeNull();
    expect(state.user).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(mockSignOut).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// 9. resetPassword — calls resetPasswordForEmail
// ---------------------------------------------------------------------------

describe('resetPassword', () => {
  it('calls resetPasswordForEmail and returns no error on success', async () => {
    mockResetPasswordForEmail.mockResolvedValue({ error: null });

    const result = await useAuthStore.getState().resetPassword('test@example.com');

    expect(result.error).toBeNull();
    expect(mockResetPasswordForEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('returns no error even for unknown email (security best practice)', async () => {
    // Supabase may return an error for unknown email, but our code
    // treats most non-rate-limit errors as success for security
    mockResetPasswordForEmail.mockResolvedValue({
      error: { message: 'User not found' },
    });

    const result = await useAuthStore.getState().resetPassword('unknown@example.com');

    expect(result.error).toBeNull();
  });

  it('returns rate limit error in Spanish', async () => {
    mockResetPasswordForEmail.mockResolvedValue({
      error: { message: 'For security purposes, you can only request this once every 60 seconds' },
    });

    const result = await useAuthStore.getState().resetPassword('test@example.com');

    expect(result.error).toBe('Demasiados intentos. Esperá unos minutos.');
  });
});
