import { create } from 'zustand';

export interface Ingredient {
  id: string;
  name: string;
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
  createdAt: string;
}

interface DietState {
  currentDiet: DietItem[];
  savedDiets: SavedDiet[];
  addIngredient: (ingredient: Ingredient) => void;
  updatePercentage: (id: string, pct: number) => void;
  removeIngredient: (id: string) => void;
  clearDiet: () => void;
  loadDiet: (diet: SavedDiet) => void;
  saveDiet: (name: string, results: { ne: number; lys: number; met: number; thr: number; p: number; dm: number }) => void;
  deleteSaved: (id: string) => void;
}

export const useDietStore = create<DietState>((set, get) => ({
  currentDiet: [],
  savedDiets: [],

  addIngredient: (ingredient) => {
    const { currentDiet } = get();
    if (currentDiet.find(d => d.id === ingredient.id)) return;
    set({ currentDiet: [...currentDiet, { id: ingredient.id, name: ingredient.name, pct: 0 }] });
  },

  updatePercentage: (id, pct) => {
    set({ currentDiet: get().currentDiet.map(d => d.id === id ? { ...d, pct } : d) });
  },

  removeIngredient: (id) => {
    set({ currentDiet: get().currentDiet.filter(d => d.id !== id) });
  },

  clearDiet: () => set({ currentDiet: [] }),

  loadDiet: (diet) => set({ currentDiet: diet.items.map(d => ({ ...d })) }),

  saveDiet: (name, results) => {
    const newDiet: SavedDiet = {
      id: Date.now().toString(),
      name,
      items: get().currentDiet.map(d => ({ ...d })),
      ...results,
      createdAt: new Date().toISOString(),
    };
    set({ savedDiets: [...get().savedDiets, newDiet] });
  },

  deleteSaved: (id) => {
    set({ savedDiets: get().savedDiets.filter(d => d.id !== id) });
  },
}));
