import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, TABLES } from '../lib/supabase';
import { setAllCustomPrices, getIngredientPrice } from '../data/prices';

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

interface DietState {
  animalType: AnimalType;
  currentDiet: DietItem[];
  savedDiets: SavedDiet[];
  darkMode: boolean;
  isSyncing: boolean;
  lastSynced: string | null;
  syncEnabled: boolean;
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

  setAnimalType: (type) => set({ animalType: type }),

  addIngredient: (ingredient) => {
    const { currentDiet } = get();
    if (currentDiet.find(d => d.id === ingredient.id)) return;
    set({ currentDiet: [...currentDiet, { id: ingredient.id, name: ingredient.name, pct: 0 }] });
    get().saveToStorage();
  },

  updatePercentage: (id, pct) => {
    set({ currentDiet: get().currentDiet.map(d => d.id === id ? { ...d, pct } : d) });
    get().saveToStorage();
  },

  removeIngredient: (id) => {
    set({ currentDiet: get().currentDiet.filter(d => d.id !== id) });
    get().saveToStorage();
  },

  clearDiet: () => {
    set({ currentDiet: [] });
    get().saveToStorage();
  },

  setFullDiet: (items) => {
    set({ currentDiet: items });
    get().saveToStorage();
  },

  loadDiet: (diet) => {
    set({ 
      currentDiet: diet.items.map(d => ({ ...d })),
      animalType: diet.animalType as AnimalType 
    });
  },

  saveDiet: async (name, results) => {
    const { currentDiet, savedDiets, animalType, syncEnabled } = get();
    const newDiet: SavedDiet = {
      id: Date.now().toString(),
      name,
      items: currentDiet.map(d => ({ ...d })),
      ...results,
      animalType,
      createdAt: new Date().toISOString(),
    };
    set({ savedDiets: [...savedDiets, newDiet] });
    get().saveToStorage();
    
    // Sync to cloud if enabled
    if (syncEnabled) {
      try {
        await supabase.from(TABLES.SAVED_DIETS).upsert({
          id: newDiet.id,
          name: newDiet.name,
          items: JSON.stringify(newDiet.items),
          ne: newDiet.ne,
          lys: newDiet.lys,
          met: newDiet.met,
          thr: newDiet.thr,
          trp: newDiet.trp,
          val: newDiet.val,
          ile: newDiet.ile,
          p: newDiet.p,
          dm: newDiet.dm,
          animal_type: newDiet.animalType,
          created_at: newDiet.createdAt,
        });
      } catch (error) {
        console.error('Error syncing to cloud:', error);
      }
    }
  },

  deleteSaved: (id) => {
    set({ savedDiets: get().savedDiets.filter(d => d.id !== id) });
    get().saveToStorage();
  },

  toggleDarkMode: () => {
    set({ darkMode: !get().darkMode });
    get().saveToStorage();
  },

  loadFromStorage: async () => {
    try {
      const data = await AsyncStorage.getItem('evapig-data');
      if (data) {
        const parsed = JSON.parse(data);
        set({
          savedDiets: parsed.savedDiets || [],
          darkMode: parsed.darkMode || false,
        });
      }
      
      // Load custom prices
      const pricesData = await AsyncStorage.getItem('evapig-custom-prices');
      if (pricesData) {
        const prices = JSON.parse(pricesData);
        setAllCustomPrices(prices);
      }
    } catch (e) {
      console.error('Error loading from storage:', e);
    }
  },

  saveToStorage: async () => {
    try {
      const { savedDiets, darkMode } = get();
      await AsyncStorage.setItem('evapig-data', JSON.stringify({ savedDiets, darkMode }));
    } catch (e) {
      console.error('Error saving to storage:', e);
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
    const { savedDiets, isSyncing } = get();
    if (isSyncing) return;
    
    set({ isSyncing: true });
    try {
      // Upload all saved diets to cloud
      for (const diet of savedDiets) {
        await supabase.from(TABLES.SAVED_DIETS).upsert({
          id: diet.id,
          name: diet.name,
          items: JSON.stringify(diet.items),
          ne: diet.ne,
          lys: diet.lys,
          met: diet.met,
          thr: diet.thr,
          trp: diet.trp,
          val: diet.val,
          ile: diet.ile,
          p: diet.p,
          dm: diet.dm,
          animal_type: diet.animalType,
          created_at: diet.createdAt,
        });
      }
      set({ lastSynced: new Date().toISOString() });
    } catch (error) {
      console.error('Error syncing to cloud:', error);
    } finally {
      set({ isSyncing: false });
    }
  },

  loadFromCloud: async () => {
    const { isSyncing } = get();
    if (isSyncing) return;
    
    set({ isSyncing: true });
    try {
      const { data, error } = await supabase
        .from(TABLES.SAVED_DIETS)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const cloudDiets: SavedDiet[] = data.map((d: any) => ({
          id: d.id,
          name: d.name,
          items: typeof d.items === 'string' ? JSON.parse(d.items) : d.items,
          ne: d.ne,
          lys: d.lys,
          met: d.met,
          thr: d.thr,
          trp: d.trp || 0,
          val: d.val || 0,
          ile: d.ile || 0,
          p: d.p,
          dm: d.dm,
          animalType: d.animal_type,
          createdAt: d.created_at,
        }));
        
        // Merge with local (cloud wins for duplicates)
        const { savedDiets } = get();
        const merged = [...savedDiets];
        
        for (const cloudDiet of cloudDiets) {
          const exists = merged.find(d => d.id === cloudDiet.id);
          if (!exists) {
            merged.push(cloudDiet);
          }
        }
        
        set({ savedDiets: merged, lastSynced: new Date().toISOString() });
        get().saveToStorage();
      }
    } catch (error) {
      console.error('Error loading from cloud:', error);
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
      console.error('Error updating price:', error);
    }
  },

  resetPrices: async () => {
    try {
      await AsyncStorage.removeItem('evapig-custom-prices');
      setAllCustomPrices({});
    } catch (error) {
      console.error('Error resetting prices:', error);
    }
  },
}));
