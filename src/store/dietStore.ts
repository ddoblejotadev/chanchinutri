import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Ingredient {
  id: string;
  name: string;
  category: string;
  ne: number;
  lys: number;
  met: number;
  thr: number;
  p: number;
  dm: number;
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
  p: { min: number; max: number };
}

export const ANIMAL_TYPES: Record<AnimalType, { label: string; requirements: NutritionalRequirements }> = {
  lechon: {
    label: 'Lechón (5-25 kg)',
    requirements: {
      ne: { min: 2400, max: 2600 },
      lys: { min: 12, max: 16 },
      met: { min: 4, max: 6 },
      thr: { min: 8, max: 10 },
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
      p: { min: 3, max: 5 },
    },
  },
};

interface DietState {
  animalType: AnimalType;
  currentDiet: DietItem[];
  savedDiets: SavedDiet[];
  darkMode: boolean;
  setAnimalType: (type: AnimalType) => void;
  addIngredient: (ingredient: Ingredient) => void;
  updatePercentage: (id: string, pct: number) => void;
  removeIngredient: (id: string) => void;
  clearDiet: () => void;
  loadDiet: (diet: SavedDiet) => void;
  saveDiet: (name: string, results: { ne: number; lys: number; met: number; thr: number; p: number; dm: number }) => void;
  deleteSaved: (id: string) => void;
  toggleDarkMode: () => void;
  loadFromStorage: () => Promise<void>;
  saveToStorage: () => Promise<void>;
}

export const useDietStore = create<DietState>()((set, get) => ({
  animalType: 'crecimiento',
  currentDiet: [],
  savedDiets: [],
  darkMode: false,

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

  loadDiet: (diet) => {
    set({ 
      currentDiet: diet.items.map(d => ({ ...d })),
      animalType: diet.animalType as AnimalType 
    });
  },

  saveDiet: (name, results) => {
    const { currentDiet, savedDiets, animalType } = get();
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
}));
