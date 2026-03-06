/**
 * Tests for cloud sync functionality in dietStore.
 *
 * Covers: saveDiet dirty marking, syncToCloud batch upsert,
 * syncToCloud no-op when clean, syncToCloud error preserves dirty,
 * deleteSaved cloud delete, loadFromCloud device scoping,
 * and loadFromCloud Map merge (local wins).
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDietStore, _resetDebouncedSave } from '../src/store/dietStore';
import type { SavedDiet, DietItem } from '../src/store/dietStore';
import { getDeviceId } from '../src/lib/deviceId';
import { useAuthStore } from '../src/store/authStore';

// ---------------------------------------------------------------------------
// Task 3.1: Supabase mock setup
// ---------------------------------------------------------------------------

/** Chainable Supabase mock that lets tests control returned data & errors. */
let mockSupabaseResponse: { data: unknown; error: unknown };

const mockEq = jest.fn().mockImplementation(() => Promise.resolve(mockSupabaseResponse));
const mockOr = jest.fn().mockReturnThis();
const mockOrder = jest.fn().mockImplementation(() => Promise.resolve(mockSupabaseResponse));
const mockSelect = jest.fn().mockImplementation((cols?: string) => {
  // .select('*') used in loadFromCloud (terminal — returns promise via .or().order())
  // .select() used after .upsert() (terminal — returns promise directly)
  if (cols === '*') {
    return { or: mockOr, order: mockOrder };
  }
  return Promise.resolve(mockSupabaseResponse);
});
const mockUpsert = jest.fn().mockImplementation(() => {
  // upsert can either chain .select() or return directly
  // In our code: .upsert(rows, { onConflict: 'id' }) — no .select() after it
  return Promise.resolve(mockSupabaseResponse);
});
const mockDelete = jest.fn().mockReturnValue({ eq: mockEq });
const mockFrom = jest.fn().mockImplementation(() => ({
  upsert: mockUpsert,
  delete: () => ({ eq: mockEq }),
  select: mockSelect,
}));

jest.mock('../src/lib/supabase', () => ({
  supabase: {
    from: (...args: unknown[]) => mockFrom(...args),
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } }),
      signUp: jest.fn().mockResolvedValue({ data: {}, error: null }),
      signInWithPassword: jest.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: jest.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: jest.fn().mockResolvedValue({ error: null }),
    },
  },
  TABLES: { SAVED_DIETS: 'saved_diets', USER_PREFERENCES: 'user_preferences' },
}));

// Mock deviceId — provide a deterministic device ID
// NOTE: jest.mock is hoisted, so we cannot reference a const here — inline value.
jest.mock('../src/lib/deviceId', () => ({
  getDeviceId: jest.fn().mockResolvedValue('test-device-id-abc'),
  getCachedDeviceId: jest.fn().mockReturnValue('test-device-id-abc'),
}));

const MOCK_DEVICE_ID = 'test-device-id-abc';
const MOCK_USER_ID = 'test-user-id-123';

/** Set authStore to authenticated state so sync operations proceed. */
function setAuthenticatedUser() {
  useAuthStore.setState({
    user: { id: MOCK_USER_ID } as import('@supabase/supabase-js').User,
    session: {} as import('@supabase/supabase-js').Session,
    isAuthenticated: true,
    isLoading: false,
  });
}

/** Set authStore to unauthenticated state. */
function clearAuthenticatedUser() {
  useAuthStore.setState({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: false,
  });
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createSavedDiet(id: string, name: string, overrides: Partial<SavedDiet> = {}): SavedDiet {
  return {
    id,
    name,
    items: [{ id: 'corn', name: 'Maiz', pct: 60 }],
    ne: 2300,
    lys: 10,
    met: 4,
    thr: 7,
    trp: 2,
    val: 5,
    ile: 4,
    p: 5,
    dm: 88,
    animalType: 'crecimiento',
    createdAt: '2025-01-01T00:00:00.000Z',
    ...overrides,
  };
}

/** Reset Zustand store state to clean defaults. */
function resetStore(overrides: Partial<{ savedDiets: SavedDiet[]; dirtyIds: Set<string>; syncEnabled: boolean }> = {}) {
  useDietStore.setState({
    savedDiets: [],
    dirtyIds: new Set<string>(),
    isSyncing: false,
    lastSynced: null,
    syncEnabled: true,
    currentDiet: [],
    animalType: 'crecimiento',
    darkMode: false,
    ...overrides,
  });
}

// ---------------------------------------------------------------------------
// Setup / teardown
// ---------------------------------------------------------------------------

beforeEach(async () => {
  jest.clearAllMocks();
  _resetDebouncedSave();
  mockSupabaseResponse = { data: null, error: null };
  resetStore();
  setAuthenticatedUser();
  await AsyncStorage.clear();
});

// ---------------------------------------------------------------------------
// Task 3.3: saveDiet marks dirty
// ---------------------------------------------------------------------------

describe('saveDiet — dirty marking', () => {
  it('adds the new diet ID to dirtyIds', async () => {
    // Provide a current diet so saveDiet has something to save
    useDietStore.setState({
      currentDiet: [{ id: 'corn', name: 'Maiz', pct: 60 }],
    });

    await useDietStore.getState().saveDiet('Test Diet', {
      ne: 2300, lys: 10, met: 4, thr: 7, trp: 2, val: 5, ile: 4, p: 5, dm: 88,
    });

    const { savedDiets, dirtyIds } = useDietStore.getState();
    expect(savedDiets).toHaveLength(1);
    expect(dirtyIds.has(savedDiets[0].id)).toBe(true);
  });

  it('does NOT make any Supabase call', async () => {
    useDietStore.setState({
      currentDiet: [{ id: 'corn', name: 'Maiz', pct: 60 }],
    });

    await useDietStore.getState().saveDiet('Test Diet', {
      ne: 2300, lys: 10, met: 4, thr: 7, trp: 2, val: 5, ile: 4, p: 5, dm: 88,
    });

    expect(mockFrom).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Task 3.4: syncToCloud batch upsert — single call
// ---------------------------------------------------------------------------

describe('syncToCloud — batch upsert', () => {
  it('calls upsert ONCE with all dirty diets and device_id, then clears dirtyIds', async () => {
    const diets = [
      createSavedDiet('d1', 'Diet 1'),
      createSavedDiet('d2', 'Diet 2'),
      createSavedDiet('d3', 'Diet 3'),
    ];
    resetStore({
      savedDiets: diets,
      dirtyIds: new Set(['d1', 'd2', 'd3']),
    });
    mockSupabaseResponse = { data: null, error: null };

    await useDietStore.getState().syncToCloud();

    // Supabase .from() called exactly once
    expect(mockFrom).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith('saved_diets');

    // .upsert() called once with array of 3
    expect(mockUpsert).toHaveBeenCalledTimes(1);
    const upsertedRows = mockUpsert.mock.calls[0][0] as Array<{ id: string; device_id: string; user_id: string }>;
    expect(upsertedRows).toHaveLength(3);

    // Each row has device_id and user_id set
    for (const row of upsertedRows) {
      expect(row.device_id).toBe(MOCK_DEVICE_ID);
      expect(row.user_id).toBe(MOCK_USER_ID);
    }
    expect(upsertedRows.map((r) => r.id).sort()).toEqual(['d1', 'd2', 'd3']);

    // dirtyIds cleared
    expect(useDietStore.getState().dirtyIds.size).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Task 3.5: syncToCloud no-op when clean
// ---------------------------------------------------------------------------

describe('syncToCloud — no-op when clean', () => {
  it('does NOT call upsert when dirtyIds is empty and still updates lastSynced', async () => {
    resetStore({
      savedDiets: [createSavedDiet('d1', 'Diet 1')],
      dirtyIds: new Set(),
    });

    await useDietStore.getState().syncToCloud();

    expect(mockUpsert).not.toHaveBeenCalled();
    expect(useDietStore.getState().lastSynced).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Task 3.6: syncToCloud failure preserves dirty
// ---------------------------------------------------------------------------

describe('syncToCloud — failure preserves dirty', () => {
  it('preserves dirtyIds when Supabase returns an error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const diets = [createSavedDiet('d1', 'Diet 1')];
    resetStore({
      savedDiets: diets,
      dirtyIds: new Set(['d1']),
    });
    mockSupabaseResponse = { data: null, error: { message: 'Network error' } };

    await useDietStore.getState().syncToCloud();

    // dirtyIds should NOT be cleared
    const { dirtyIds } = useDietStore.getState();
    expect(dirtyIds.has('d1')).toBe(true);

    consoleSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// Task 3.7: deleteSaved cloud delete
// ---------------------------------------------------------------------------

describe('deleteSaved — cloud delete', () => {
  it('removes diet from local state, removes from dirtyIds, and calls Supabase delete when authenticated', async () => {
    const diets = [createSavedDiet('d1', 'Diet 1'), createSavedDiet('d2', 'Diet 2')];
    resetStore({
      savedDiets: diets,
      dirtyIds: new Set(['d1', 'd2']),
      syncEnabled: true,
    });
    // Mock the delete chain to return a resolved promise
    mockEq.mockResolvedValue({ error: null });

    useDietStore.getState().deleteSaved('d1');

    // Diet removed from local state
    const { savedDiets, dirtyIds } = useDietStore.getState();
    expect(savedDiets.find((d) => d.id === 'd1')).toBeUndefined();
    expect(savedDiets).toHaveLength(1);

    // Removed from dirtyIds
    expect(dirtyIds.has('d1')).toBe(false);
    // d2 still in dirtyIds
    expect(dirtyIds.has('d2')).toBe(true);

    // Supabase delete was called (fire-and-forget)
    expect(mockFrom).toHaveBeenCalledWith('saved_diets');
    // The .eq() chain was called with the diet id
    expect(mockEq).toHaveBeenCalledWith('id', 'd1');
  });
});

// ---------------------------------------------------------------------------
// Task 3.8: loadFromCloud device scoping
// ---------------------------------------------------------------------------

describe('loadFromCloud — device scoping', () => {
  it('queries with .or() user_id and device_id filter and merges results into local state', async () => {
    const cloudRows = [
      {
        id: 'cloud-1',
        name: 'Cloud Diet 1',
        items: JSON.stringify([{ id: 'corn', name: 'Maiz', pct: 50 }]),
        ne: 2200, lys: 9, met: 3, thr: 6, trp: 1.5, val: 4.5, ile: 3.8,
        p: 4, dm: 87,
        animal_type: 'crecimiento',
        created_at: '2025-01-02T00:00:00.000Z',
        device_id: MOCK_DEVICE_ID,
        user_id: MOCK_USER_ID,
      },
    ];
    mockSupabaseResponse = { data: cloudRows, error: null };
    mockOrder.mockResolvedValue({ data: cloudRows, error: null });
    resetStore({ savedDiets: [] });

    await useDietStore.getState().loadFromCloud();

    // Verify .from() was called
    expect(mockFrom).toHaveBeenCalledWith('saved_diets');

    // Verify .or() was called with user_id and device_id filter
    expect(mockOr).toHaveBeenCalledWith(
      expect.stringContaining(`user_id.eq.${MOCK_USER_ID}`),
    );
    expect(mockOr).toHaveBeenCalledWith(
      expect.stringContaining(`device_id.eq.${MOCK_DEVICE_ID}`),
    );

    // Verify data merged into store
    const { savedDiets } = useDietStore.getState();
    expect(savedDiets).toHaveLength(1);
    expect(savedDiets[0].id).toBe('cloud-1');
    expect(savedDiets[0].name).toBe('Cloud Diet 1');
  });
});

// ---------------------------------------------------------------------------
// Task 3.9: loadFromCloud Map merge — local wins
// ---------------------------------------------------------------------------

describe('loadFromCloud — Map merge (local wins)', () => {
  it('keeps local version of existing diet and adds new diet from cloud', async () => {
    // Local diet A (version 1)
    const localDietA = createSavedDiet('diet-a', 'Local Diet A', {
      ne: 2300,
      createdAt: '2025-01-01T00:00:00.000Z',
    });

    resetStore({ savedDiets: [localDietA] });

    // Cloud returns: diet A (different version) + diet B (new)
    const cloudRows = [
      {
        id: 'diet-a',
        name: 'Cloud Diet A Modified',
        items: JSON.stringify([{ id: 'soy', name: 'Soya', pct: 30 }]),
        ne: 2500, lys: 12, met: 5, thr: 8, trp: 2.5, val: 6, ile: 5,
        p: 6, dm: 90,
        animal_type: 'lechon',
        created_at: '2025-02-01T00:00:00.000Z',
        device_id: MOCK_DEVICE_ID,
      },
      {
        id: 'diet-b',
        name: 'Cloud Diet B',
        items: JSON.stringify([{ id: 'wheat', name: 'Trigo', pct: 40 }]),
        ne: 2100, lys: 8, met: 3, thr: 5, trp: 1.5, val: 4, ile: 3.5,
        p: 4, dm: 86,
        animal_type: 'cerda',
        created_at: '2025-01-15T00:00:00.000Z',
        device_id: MOCK_DEVICE_ID,
      },
    ];

    mockSupabaseResponse = { data: cloudRows, error: null };
    mockOrder.mockResolvedValue({ data: cloudRows, error: null });

    await useDietStore.getState().loadFromCloud();

    const { savedDiets } = useDietStore.getState();

    // Should have 2 diets total
    expect(savedDiets).toHaveLength(2);

    // Diet A: local version wins (name + ne unchanged)
    const dietA = savedDiets.find((d) => d.id === 'diet-a');
    expect(dietA).toBeDefined();
    expect(dietA!.name).toBe('Local Diet A'); // local wins
    expect(dietA!.ne).toBe(2300); // local value, not cloud's 2500

    // Diet B: added from cloud
    const dietB = savedDiets.find((d) => d.id === 'diet-b');
    expect(dietB).toBeDefined();
    expect(dietB!.name).toBe('Cloud Diet B');
    expect(dietB!.animalType).toBe('cerda');
    expect(dietB!.items).toEqual([{ id: 'wheat', name: 'Trigo', pct: 40 }]);
  });
});

// ---------------------------------------------------------------------------
// dirtyIds serialization round-trip (saveToStorage → loadFromStorage)
// ---------------------------------------------------------------------------

describe('dirtyIds — serialization round-trip', () => {
  it('saves dirtyIds as array and restores them as a Set via loadFromStorage', async () => {
    // 1. Set up store with known dirtyIds and some diets
    const diets = [
      createSavedDiet('id1', 'Diet 1'),
      createSavedDiet('id2', 'Diet 2'),
      createSavedDiet('id3', 'Diet 3'),
    ];
    resetStore({
      savedDiets: diets,
      dirtyIds: new Set(['id1', 'id2', 'id3']),
    });

    // 2. Trigger saveToStorage (writes to AsyncStorage)
    await useDietStore.getState().saveToStorage();

    // Verify the serialized JSON contains dirtyIds as an array
    const raw = await AsyncStorage.getItem('evapig-data');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw!);
    expect(parsed.dirtyIds).toEqual(expect.arrayContaining(['id1', 'id2', 'id3']));
    expect(parsed.dirtyIds).toHaveLength(3);

    // 3. Reset the store completely (dirtyIds becomes empty)
    resetStore();
    expect(useDietStore.getState().dirtyIds.size).toBe(0);

    // 4. Load from storage
    await useDietStore.getState().loadFromStorage();

    // 5. Verify dirtyIds is restored as a Set with the same values
    const { dirtyIds } = useDietStore.getState();
    expect(dirtyIds).toBeInstanceOf(Set);
    expect(dirtyIds.size).toBe(3);
    expect(dirtyIds.has('id1')).toBe(true);
    expect(dirtyIds.has('id2')).toBe(true);
    expect(dirtyIds.has('id3')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// dirtyIds deserialization handles missing/empty gracefully
// ---------------------------------------------------------------------------

describe('dirtyIds — deserialization handles missing data gracefully', () => {
  it('initializes dirtyIds as empty Set when field is missing from stored data', async () => {
    // Simulate old data format: no dirtyIds field at all
    await AsyncStorage.setItem('evapig-data', JSON.stringify({
      savedDiets: [createSavedDiet('old-1', 'Old Diet')],
      darkMode: false,
      // NOTE: no dirtyIds field — simulates data saved before dirty-tracking was added
    }));

    // Reset store and load
    resetStore();
    await useDietStore.getState().loadFromStorage();

    // dirtyIds should be an empty Set, not undefined or an error
    const { dirtyIds, savedDiets } = useDietStore.getState();
    expect(dirtyIds).toBeInstanceOf(Set);
    expect(dirtyIds.size).toBe(0);
    // Existing data should still load correctly
    expect(savedDiets).toHaveLength(1);
    expect(savedDiets[0].id).toBe('old-1');
  });
});

// ---------------------------------------------------------------------------
// loadFromStorage calls getDeviceId() at startup
// ---------------------------------------------------------------------------

describe('loadFromStorage — device ID initialization', () => {
  it('calls getDeviceId() to ensure device ID is cached for later use', async () => {
    // Clear the mock call count (already cleared by beforeEach, but be explicit)
    (getDeviceId as jest.Mock).mockClear();

    // Seed some valid data so loadFromStorage doesn't short-circuit
    await AsyncStorage.setItem('evapig-data', JSON.stringify({
      savedDiets: [],
      darkMode: false,
      dirtyIds: [],
    }));

    await useDietStore.getState().loadFromStorage();

    // Verify getDeviceId was called during loadFromStorage
    expect(getDeviceId).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// Auth-gated sync: unauthenticated users skip cloud operations
// ---------------------------------------------------------------------------

describe('syncToCloud — unauthenticated no-op', () => {
  it('skips upsert when no user is authenticated', async () => {
    clearAuthenticatedUser();

    const diets = [createSavedDiet('d1', 'Diet 1')];
    resetStore({
      savedDiets: diets,
      dirtyIds: new Set(['d1']),
    });

    await useDietStore.getState().syncToCloud();

    // No Supabase calls
    expect(mockFrom).not.toHaveBeenCalled();
    expect(mockUpsert).not.toHaveBeenCalled();

    // dirtyIds preserved (not cleared)
    expect(useDietStore.getState().dirtyIds.has('d1')).toBe(true);
  });
});

describe('loadFromCloud — unauthenticated no-op', () => {
  it('skips cloud load when no user is authenticated', async () => {
    clearAuthenticatedUser();
    resetStore({ savedDiets: [] });

    await useDietStore.getState().loadFromCloud();

    // No Supabase calls
    expect(mockFrom).not.toHaveBeenCalled();
  });
});

describe('deleteSaved — unauthenticated skips cloud delete', () => {
  it('removes diet locally but does NOT call Supabase delete when not authenticated', () => {
    clearAuthenticatedUser();

    const diets = [createSavedDiet('d1', 'Diet 1')];
    resetStore({
      savedDiets: diets,
      dirtyIds: new Set(['d1']),
      syncEnabled: true,
    });

    useDietStore.getState().deleteSaved('d1');

    // Diet removed locally
    expect(useDietStore.getState().savedDiets).toHaveLength(0);
    // No Supabase delete call
    expect(mockFrom).not.toHaveBeenCalled();
  });
});
