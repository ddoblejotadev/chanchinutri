import { Ingredient } from '../store/dietStore';

export interface IngredientPrice {
  id: string;
  pricePerKg: number; // CLP per kg (pesos chilenos)
  currency: string;
}

// Precios por defecto en CLP (pesos chilenos por kg)
// Basados en valores aproximados de mercado chileno
export const defaultPrices: IngredientPrice[] = [
  { id: 'corn', pricePerKg: 260, currency: 'CLP' },
  { id: 'wheat', pricePerKg: 290, currency: 'CLP' },
  { id: 'barley', pricePerKg: 280, currency: 'CLP' },
  { id: 'oats', pricePerKg: 320, currency: 'CLP' },
  { id: 'millet', pricePerKg: 300, currency: 'CLP' },
  { id: 'sorghum', pricePerKg: 270, currency: 'CLP' },
  { id: 'rice', pricePerKg: 380, currency: 'CLP' },
  { id: 'soy-meal', pricePerKg: 520, currency: 'CLP' },
  { id: 'soy-full-fat', pricePerKg: 570, currency: 'CLP' },
  { id: 'sunflower-meal', pricePerKg: 400, currency: 'CLP' },
  { id: 'rapeseed-meal', pricePerKg: 430, currency: 'CLP' },
  { id: 'cotton-meal', pricePerKg: 360, currency: 'CLP' },
  { id: 'wheat-bran', pricePerKg: 170, currency: 'CLP' },
  { id: 'wheat-mid', pricePerKg: 200, currency: 'CLP' },
  { id: 'rice-bran', pricePerKg: 180, currency: 'CLP' },
  { id: 'corn-gluten', pricePerKg: 450, currency: 'CLP' },
  { id: 'distillers', pricePerKg: 240, currency: 'CLP' },
  { id: 'fish-meal', pricePerKg: 1700, currency: 'CLP' },
  { id: 'poultry-meal', pricePerKg: 1100, currency: 'CLP' },
  { id: 'meat-meal', pricePerKg: 850, currency: 'CLP' },
  { id: 'blood-meal', pricePerKg: 1400, currency: 'CLP' },
  { id: 'feather-meal', pricePerKg: 550, currency: 'CLP' },
  { id: 'whey', pricePerKg: 750, currency: 'CLP' },
  { id: 'lactose', pricePerKg: 1100, currency: 'CLP' },
  { id: 'skim-milk', pricePerKg: 850, currency: 'CLP' },
  { id: 'soy-oil', pricePerKg: 1000, currency: 'CLP' },
  { id: 'animal-fat', pricePerKg: 800, currency: 'CLP' },
  { id: 'palm-oil', pricePerKg: 700, currency: 'CLP' },
  { id: 'limestone', pricePerKg: 80, currency: 'CLP' },
  { id: 'dicalcium-phosphate', pricePerKg: 600, currency: 'CLP' },
  { id: 'mono-dicalcium', pricePerKg: 550, currency: 'CLP' },
  { id: 'salt', pricePerKg: 100, currency: 'CLP' },
  { id: 'lysine-hcl', pricePerKg: 3300, currency: 'CLP' },
  { id: 'dl-methionine', pricePerKg: 4000, currency: 'CLP' },
  { id: 'l-threonine', pricePerKg: 3600, currency: 'CLP' },
  { id: 'l-tryptophan', pricePerKg: 8000, currency: 'CLP' },
  { id: 'l-valine', pricePerKg: 5200, currency: 'CLP' },
  { id: 'l-isoleucine', pricePerKg: 5700, currency: 'CLP' },
  { id: 'phytase', pricePerKg: 11000, currency: 'CLP' },
  { id: 'protease', pricePerKg: 7500, currency: 'CLP' },
  { id: 'amylase', pricePerKg: 8500, currency: 'CLP' },
  { id: 'vitamin-premix', pricePerKg: 14000, currency: 'CLP' },
  { id: 'trace-minerals', pricePerKg: 9500, currency: 'CLP' },
];

const defaultPriceMap = new Map<string, number>(
  defaultPrices.map(p => [p.id, p.pricePerKg])
);

// Custom prices that can be set by user
let customPrices: Record<string, number> = {};

export function setCustomPrice(id: string, price: number) {
  customPrices[id] = price;
}

export function getCustomPrices(): Record<string, number> {
  return { ...customPrices };
}

export function setAllCustomPrices(prices: Record<string, number>) {
  customPrices = { ...prices };
}

export function getIngredientPrice(id: string): number {
  // First check custom price
  if (customPrices[id] !== undefined) {
    return customPrices[id];
  }
  // Then fall back to default (O(1) Map lookup)
  return defaultPriceMap.get(id) ?? 0;
}

export function calculateDietCost(diet: Array<{id: string, pct: number}>): number {
  let cost = 0;
  diet.forEach(item => {
    const price = getIngredientPrice(item.id);
    cost += price * item.pct / 100;
  });
  return Math.round(cost * 100) / 100; // Cost per kg of complete feed
}

export function calculateCostPerTonne(diet: Array<{id: string, pct: number}>): number {
  const costPerKg = calculateDietCost(diet);
  return Math.round(costPerKg * 1000); // Cost per tonne
}
