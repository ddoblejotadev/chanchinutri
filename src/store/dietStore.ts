import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, TABLES } from '../lib/supabase';
import { setAllCustomPrices } from '../data/prices';
import { getDeviceId, getCachedDeviceId } from '../lib/deviceId';
import { useAuthStore } from './authStore';
import { logger } from '../lib/logger';

export interface InclusionLimits {
  minPct?: number;
  maxPct?: number;
}

export const INCLUSION_WARNING_SOURCE = {
  INGREDIENT_INCLUSION: 'ingredient-inclusion',
} as const;

export type InclusionWarningSource = (typeof INCLUSION_WARNING_SOURCE)[keyof typeof INCLUSION_WARNING_SOURCE];

export const INCLUSION_WARNING_REASON = {
  BELOW_MIN: 'below-min',
  ABOVE_MAX: 'above-max',
} as const;

export type InclusionWarningReason = (typeof INCLUSION_WARNING_REASON)[keyof typeof INCLUSION_WARNING_REASON];

export interface IngredientInclusionWarning {
  source: InclusionWarningSource;
  reason: InclusionWarningReason;
  ingredientId: string;
  ingredientName: string;
  actualPct: number;
  limitPct: number;
}

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  ne: number;
  lys: number;
  met: number;
  thr: number;
  trp: number;
  p: number;
  dm: number;
  val: number;
  ile: number;
  inclusionLimits?: InclusionLimits;
}

export interface DietItem {
  id: string;
  name: string;
  pct: number;
}

export interface SavedDiet {
  id: string;
  name: string;
  items: DietItem[];
  ne: number;
  lys: number;
  met: number;
  thr: number;
  trp: number;
  val: number;
  ile: number;
  p: number;
  dm: number;
  animalType: string;
  createdAt: string;
}

interface CloudDietRow {
  id: string;
  name: string;
  items: string | DietItem[];
  ne: number;
  lys: number;
  met: number;
  thr: number;
  trp?: number;
  val?: number;
  ile?: number;
  p: number;
  dm: number;
  animal_type: string;
  created_at: string;
  device_id: string | null;
  user_id: string | null;
}

export type AnimalType = 'lechon' | 'crecimiento' | 'cerda' | 'reproductor';

export interface NutritionalRequirements {
  ne: { min: number; max: number };
  lys: { min: number; max: number };
  met: { min: number; max: number };
  thr: { min: number; max: number };
  trp: { min: number; max: number };
  p: { min: number; max: number };
  val: { min: number; max: number };
  ile: { min: number; max: number };
}

export const ANIMAL_TYPES: Record<AnimalType, { label: string; requirements: NutritionalRequirements }> = {
  lechon: {
    label: 'Lechón (5-25 kg)',
    requirements: {
      ne: { min: 2400, max: 2600 },
      lys: { min: 12, max: 16 },
      met: { min: 4, max: 6 },
      thr: { min: 8, max: 10 },
      trp: { min: 2.0, max: 3.0 },
      val: { min: 6.0, max: 8.0 },
      ile: { min: 5.0, max: 7.0 },
      p: { min: 5, max: 7 },
    },
  },
  crecimiento: {
    label: 'Crecimiento (25-100 kg)',
    requirements: {
      ne: { min: 2200, max: 2500 },
      lys: { min: 9, max: 12 },
      met: { min: 3, max: 5 },
      thr: { min: 6, max: 8 },
      trp: { min: 1.5, max: 2.5 },
      val: { min: 4.5, max: 6.0 },
      ile: { min: 3.8, max: 5.0 },
      p: { min: 4, max: 6 },
    },
  },
  cerda: {
    label: 'Cerda gestante',
    requirements: {
      ne: { min: 2000, max: 2300 },
      lys: { min: 6, max: 8 },
      met: { min: 2, max: 4 },
      thr: { min: 4, max: 6 },
      trp: { min: 1.2, max: 2.0 },
      val: { min: 3.5, max: 5.0 },
      ile: { min: 3.0, max: 4.5 },
      p: { min: 3, max: 5 },
    },
  },
  reproductor: {
    label: 'Reproductor',
    requirements: {
      ne: { min: 2100, max: 2400 },
      lys: { min: 8, max: 10 },
      met: { min: 3, max: 4 },
      thr: { min: 5, max: 7 },
      trp: { min: 1.8, max: 2.8 },
      val: { min: 4.0, max: 5.5 },
      ile: { min: 3.5, max: 5.0 },
      p: { min: 3, max: 5 },
    },
  },
};

// --- Debounce utility for AsyncStorage writes ---
let _debounceTimer: ReturnType<typeof setTimeout> | null = null;
let _pendingSave: (() => Promise<void>) | null = null;

export function debouncedSave(saveFn: () => Promise<void>): void {
  _pendingSave = saveFn;
  if (_debounceTimer !== null) {
    clearTimeout(_debounceTimer);
  }
  _debounceTimer = setTimeout(() => {
    _debounceTimer = null;
    const fn = _pendingSave;
    _pendingSave = null;
    if (fn) {
      fn().catch((e) => logger.error('Error in debounced save:', e));
    }
  }, 300);
}

export function flushDebouncedSave(): void {
  if (_debounceTimer !== null) {
    clearTimeout(_debounceTimer);
    _debounceTimer = null;
  }
  if (_pendingSave) {
    const fn = _pendingSave;
    _pendingSave = null;
    fn().catch((e) => logger.error('Error flushing save:', e));
  }
}

/** Reset debounce state — test-only helper */
export function _resetDebouncedSave(): void {
  if (_debounceTimer !== null) {
    clearTimeout(_debounceTimer);
    _debounceTimer = null;
  }
  _pendingSave = null;
}

// Flush pending saves when app goes to background/inactive
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { AppState } = require('react-native') as typeof import('react-native');
  AppState.addEventListener('change', (nextAppState: string) => {
    if (nextAppState === 'background' || nextAppState === 'inactive') {
      flushDebouncedSave();
    }
  });
} catch (e) {
  // In test environments, react-native may not be available — skip listener
  logger.warn('Could not register AppState listener:', e);
}

interface DietState {
  animalType: AnimalType;
  currentDiet: DietItem[];
  savedDiets: SavedDiet[];
  darkMode: boolean;
  isSyncing: boolean;
  lastSynced: string | null;
  syncEnabled: boolean;
  dirtyIds: Set<string>;
  setAnimalType: (type: AnimalType) => void;
  addIngredient: (ingredient: Ingredient) => void;
  updatePercentage: (id: string, pct: number) => void;
  removeIngredient: (id: string) => void;
  clearDiet: () => void;
  loadDiet: (diet: SavedDiet) => void;
  saveDiet: (name: string, results: { ne: number; lys: number; met: number; thr: number; trp: number; val: number; ile: number; p: number; dm: number }) => Promise<void>;
  deleteSaved: (id: string) => void;
  toggleDarkMode: () => void;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
  setFullDiet: (items: DietItem[]) => void;
  syncToCloud: () => Promise<void>;
  loadFromCloud: () => Promise<void>;
  toggleSync: () => void;
  updatePrice: (id: string, price: number) => Promise<void>;
  resetPrices: () => Promise<void>;
}

export const useDietStore = create<DietState>()((set, get) => ({
  animalType: 'crecimiento',
  currentDiet: [],
  savedDiets: [],
  darkMode: false,
  isSyncing: false,
  lastSynced: null,
  syncEnabled: true, // Por defecto activado
  dirtyIds: new Set<string>(),

  setAnimalType: (type) => set({ animalType: type }),

  addIngredient: (ingredient) => {
    const { currentDiet } = get();
    if (currentDiet.find(d => d.id === ingredient.id)) return;
    set({ currentDiet: [...currentDiet, { id: ingredient.id, name: ingredient.name, pct: 0 }] });
    debouncedSave(() => get().saveToStorage());
  },

  updatePercentage: (id, pct) => {
    set({ currentDiet: get().currentDiet.map(d => d.id === id ? { ...d, pct } : d) });
    debouncedSave(() => get().saveToStorage());
  },

  removeIngredient: (id) => {
    set({ currentDiet: get().currentDiet.filter(d => d.id !== id) });
    debouncedSave(() => get().saveToStorage());
  },

  clearDiet: () => {
    set({ currentDiet: [] });
    debouncedSave(() => get().saveToStorage());
  },

  setFullDiet: (items) => {
    set({ currentDiet: items });
    debouncedSave(() => get().saveToStorage());
  },

  loadDiet: (diet) => {
    set({ 
      currentDiet: diet.items.map(d => ({ ...d })),
      animalType: diet.animalType as AnimalType 
    });
  },

  saveDiet: async (name, results) => {
    const { currentDiet, savedDiets, animalType } = get();
    const newDiet: SavedDiet = {
      id: Date.now().toString(),
      name,
      items: currentDiet.map(d => ({ ...d })),
      ...results,
      animalType,
      createdAt: new Date().toISOString(),
    };
    set({
      savedDiets: [...savedDiets, newDiet],
      dirtyIds: new Set([...get().dirtyIds, newDiet.id]),
    });
    get().saveToStorage();
  },

  deleteSaved: (id) => {
    set({ savedDiets: get().savedDiets.filter(d => d.id !== id) });

    // Remove from dirtyIds if present
    const { dirtyIds, syncEnabled } = get();
    if (dirtyIds.has(id)) {
      const next = new Set(dirtyIds);
      next.delete(id);
      set({ dirtyIds: next });
    }

    debouncedSave(() => get().saveToStorage());

    // Fire-and-forget cloud delete when sync is enabled AND user is authenticated
    const user = useAuthStore.getState().user;
    if (syncEnabled && user) {
      supabase
        .from(TABLES.SAVED_DIETS)
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) logger.error('Error deleting from cloud:', error);
        });
    }
  },

  toggleDarkMode: () => {
    set({ darkMode: !get().darkMode });
    debouncedSave(() => get().saveToStorage());
  },

  loadFromStorage: async () => {
    try {
      const data = await AsyncStorage.getItem('evapig-data');
      if (data) {
        const parsed = JSON.parse(data);
        set({
          savedDiets: parsed.savedDiets || [],
          darkMode: parsed.darkMode || false,
          dirtyIds: new Set<string>(parsed.dirtyIds || []),
        });
      }
      
      // Load custom prices
      const pricesData = await AsyncStorage.getItem('evapig-custom-prices');
      if (pricesData) {
        const prices = JSON.parse(pricesData);
        setAllCustomPrices(prices);
      }

      // Ensure device ID is generated and cached for later synchronous access.
      // Failure is non-fatal — sync now depends on auth, not device ID.
      try {
        await getDeviceId();
      } catch (e) {
        logger.warn('Could not initialize device ID (non-fatal):', e);
      }
    } catch (e) {
      logger.error('Error loading from storage:', e);
    }
  },

  saveToStorage: async () => {
    try {
      const { savedDiets, darkMode, dirtyIds } = get();
      await AsyncStorage.setItem('evapig-data', JSON.stringify({
        savedDiets,
        darkMode,
        dirtyIds: Array.from(dirtyIds),
      }));
    } catch (e) {
      logger.error('Error saving to storage:', e);
    }
  },

  toggleSync: () => {
    const { syncEnabled } = get();
    set({ syncEnabled: !syncEnabled });
    // If enabling sync, load from cloud
    if (!syncEnabled) {
      get().loadFromCloud();
    }
  },

  syncToCloud: async () => {
    const { isSyncing } = get();
    if (isSyncing) return;

    set({ isSyncing: true });
    try {
      // Require authenticated user for cloud sync
      const user = useAuthStore.getState().user;
      if (!user) {
        // Not authenticated — skip cloud sync
        return;
      }

      const { dirtyIds, savedDiets } = get();

      // Nothing to sync — just update timestamp
      if (dirtyIds.size === 0) {
        set({ lastSynced: new Date().toISOString() });
        return;
      }

      // Filter to only dirty diets and map to cloud row format
      const rows: CloudDietRow[] = savedDiets
        .filter((d) => dirtyIds.has(d.id))
        .map((d) => ({
          id: d.id,
          name: d.name,
          items: JSON.stringify(d.items),
          ne: d.ne,
          lys: d.lys,
          met: d.met,
          thr: d.thr,
          trp: d.trp,
          val: d.val,
          ile: d.ile,
          p: d.p,
          dm: d.dm,
          animal_type: d.animalType,
          created_at: d.createdAt,
          device_id: getCachedDeviceId(),
          user_id: user.id,
        }));

      if (rows.length === 0) {
        // dirtyIds referenced diets that no longer exist locally — clear them
        set({ dirtyIds: new Set<string>(), lastSynced: new Date().toISOString() });
        return;
      }

      const { error } = await supabase
        .from(TABLES.SAVED_DIETS)
        .upsert(rows, { onConflict: 'id' });

      if (error) {
        // Don't clear dirtyIds on error — preserve for retry
        logger.error('Error syncing to cloud:', error);
        return;
      }

      // Success — clear dirty set and update timestamp
      set({ dirtyIds: new Set<string>(), lastSynced: new Date().toISOString() });
      get().saveToStorage();
    } catch (error) {
      // Don't clear dirtyIds — preserve for retry
      logger.error('Error syncing to cloud:', error);
    } finally {
      set({ isSyncing: false });
    }
  },

  loadFromCloud: async () => {
    const { isSyncing } = get();
    if (isSyncing) return;
    
    set({ isSyncing: true });
    try {
      // Require authenticated user for cloud load
      const user = useAuthStore.getState().user;
      if (!user) {
        // Not authenticated — skip cloud load
        return;
      }

      const deviceId = getCachedDeviceId() || 'none';

      const { data, error } = await supabase
        .from(TABLES.SAVED_DIETS)
        .select('*')
        .or(`user_id.eq.${user.id},device_id.eq.${deviceId}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        logger.error('Error loading from cloud:', error);
        return;
      }
      
      if (data && data.length > 0) {
        const cloudRows = data as CloudDietRow[];

        // Map-based merge: build local lookup, then merge cloud data
        const { savedDiets } = get();
        const localMap = new Map<string, SavedDiet>(
          savedDiets.map((d) => [d.id, d]),
        );

        for (const row of cloudRows) {
          if (!localMap.has(row.id)) {
            // Convert CloudDietRow → SavedDiet
            localMap.set(row.id, {
              id: row.id,
              name: row.name,
              items: typeof row.items === 'string' ? JSON.parse(row.items) : row.items,
              ne: row.ne,
              lys: row.lys,
              met: row.met,
              thr: row.thr,
              trp: row.trp ?? 0,
              val: row.val ?? 0,
              ile: row.ile ?? 0,
              p: row.p,
              dm: row.dm,
              animalType: row.animal_type,
              createdAt: row.created_at,
            });
          }
          // If already in localMap, keep local version (local wins)
        }
        
        set({ savedDiets: Array.from(localMap.values()), lastSynced: new Date().toISOString() });
        get().saveToStorage();
      }
    } catch (error) {
      logger.error('Error loading from cloud:', error);
    } finally {
      set({ isSyncing: false });
    }
  },

  updatePrice: async (id: string, price: number) => {
    try {
      // Get current custom prices
      const pricesData = await AsyncStorage.getItem('evapig-custom-prices');
      const prices = pricesData ? JSON.parse(pricesData) : {};
      
      // Update price
      prices[id] = price;
      
      // Save to storage
      await AsyncStorage.setItem('evapig-custom-prices', JSON.stringify(prices));
      
      // Update in-memory prices
      setAllCustomPrices(prices);
    } catch (error) {
      logger.error('Error updating price:', error);
    }
  },

  resetPrices: async () => {
    try {
      await AsyncStorage.removeItem('evapig-custom-prices');
      setAllCustomPrices({});
    } catch (error) {
      logger.error('Error resetting prices:', error);
    }
  },
}));
