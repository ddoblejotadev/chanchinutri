import { Ingredient } from '../store/dietStore';

export const ingredients: Ingredient[] = [
  // Cereales
  { id: 'corn', name: 'Maíz', category: 'Cereal', ne: 2475, lys: 2.3, met: 1.5, thr: 2.8, trp: 0.6, p: 2.5, dm: 88.5 },
  { id: 'wheat', name: 'Trigo', category: 'Cereal', ne: 2290, lys: 2.9, met: 1.6, thr: 2.8, trp: 1.1, p: 3.0, dm: 89.0 },
  { id: 'barley', name: 'Cebada', category: 'Cereal', ne: 2150, lys: 3.4, met: 1.5, thr: 3.2, trp: 1.2, p: 3.4, dm: 89.0 },
  { id: 'oats', name: 'Avena', category: 'Cereal', ne: 2050, lys: 3.5, met: 1.4, thr: 3.0, trp: 1.3, p: 3.2, dm: 89.0 },
  { id: 'millet', name: 'Mijo', category: 'Cereal', ne: 2200, lys: 2.8, met: 1.5, thr: 2.5, trp: 1.0, p: 2.8, dm: 89.0 },
  { id: 'sorghum', name: 'Sorgo', category: 'Cereal', ne: 2250, lys: 2.2, met: 1.3, thr: 2.5, trp: 0.8, p: 2.7, dm: 88.0 },
  { id: 'rice', name: 'Arroz', category: 'Cereal', ne: 2300, lys: 2.5, met: 1.4, thr: 2.6, trp: 0.9, p: 2.5, dm: 88.0 },
  
  // Oleaginosas
  { id: 'soy-meal', name: 'Harina de Soja (44%)', category: 'Oleaginosa', ne: 2160, lys: 24.5, met: 6.2, thr: 17.8, trp: 6.0, p: 6.0, dm: 89.0 },
  { id: 'soy-full-fat', name: 'Soja Full Fat', category: 'Oleaginosa', ne: 2550, lys: 22.0, met: 5.5, thr: 16.0, trp: 5.5, p: 5.5, dm: 90.0 },
  { id: 'sunflower-meal', name: 'Harina de Girasol', category: 'Oleaginosa', ne: 1750, lys: 11.0, met: 6.5, thr: 10.5, trp: 3.5, p: 9.0, dm: 89.0 },
  { id: 'rapeseed-meal', name: 'Harina de Colza', category: 'Oleaginosa', ne: 1650, lys: 12.0, met: 5.0, thr: 9.0, trp: 3.8, p: 8.5, dm: 88.0 },
  { id: 'cotton-meal', name: 'Harina de Algodón', category: 'Oleaginosa', ne: 1550, lys: 10.0, met: 4.5, thr: 8.0, trp: 3.0, p: 7.5, dm: 90.0 },
  
  // Subproductos
  { id: 'wheat-bran', name: 'Salvado de Trigo', category: 'Subproducto', ne: 1650, lys: 4.5, met: 2.0, thr: 4.0, trp: 1.5, p: 11.0, dm: 89.0 },
  { id: 'wheat-mid', name: 'Trigo Midlings', category: 'Subproducto', ne: 1900, lys: 5.0, met: 2.2, thr: 4.5, trp: 1.6, p: 7.0, dm: 88.0 },
  { id: 'rice-bran', name: 'Salvado de Arroz', category: 'Subproducto', ne: 1500, lys: 5.5, met: 2.0, thr: 4.2, trp: 1.4, p: 10.0, dm: 89.0 },
  { id: 'corn-gluten', name: 'Gluten de Maíz', category: 'Subproducto', ne: 2400, lys: 8.0, met: 3.5, thr: 7.0, trp: 2.0, p: 4.0, dm: 90.0 },
  { id: 'distillers', name: 'Granos de Destilería', category: 'Subproducto', ne: 2050, lys: 6.5, met: 3.0, thr: 5.5, trp: 2.2, p: 6.5, dm: 88.0 },
  
  // Proteicos animales
  { id: 'fish-meal', name: 'Harina de Pescado', category: 'Animal', ne: 2650, lys: 45.0, met: 12.0, thr: 28.0, trp: 9.5, p: 25.0, dm: 92.0 },
  { id: 'poultry-meal', name: 'Harina de Pollo', category: 'Animal', ne: 2450, lys: 35.0, met: 9.0, thr: 22.0, trp: 8.0, p: 20.0, dm: 93.0 },
  { id: 'meat-meal', name: 'Harina de Carne', category: 'Animal', ne: 2200, lys: 30.0, met: 8.0, thr: 18.0, trp: 6.5, p: 22.0, dm: 93.0 },
  { id: 'blood-meal', name: 'Harina de Sangre', category: 'Animal', ne: 2500, lys: 70.0, met: 5.0, thr: 30.0, trp: 10.0, p: 4.0, dm: 89.0 },
  { id: 'feather-meal', name: 'Harina de Plumas', category: 'Animal', ne: 1500, lys: 8.0, met: 4.0, thr: 4.5, trp: 3.0, p: 6.0, dm: 90.0 },
  
  // Lácteos
  { id: 'whey', name: 'Suero de Leche', category: 'Lácteo', ne: 2100, lys: 9.0, met: 3.0, thr: 6.5, trp: 2.0, p: 6.0, dm: 95.0 },
  { id: 'lactose', name: 'Lactosa', category: 'Lácteo', ne: 2500, lys: 0, met: 0, thr: 0, trp: 0, p: 0, dm: 96.0 },
  { id: 'skim-milk', name: 'Leche Descremada', category: 'Lácteo', ne: 1800, lys: 25.0, met: 8.0, thr: 15.0, trp: 4.5, p: 10.0, dm: 95.0 },
  
  // Grasas
  { id: 'soy-oil', name: 'Aceite de Soja', category: 'Grasa', ne: 3500, lys: 0, met: 0, thr: 0, trp: 0, p: 0, dm: 99.5 },
  { id: 'animal-fat', name: 'Grasa Animal', category: 'Grasa', ne: 3400, lys: 0, met: 0, thr: 0, trp: 0, p: 0, dm: 99.0 },
  { id: 'palm-oil', name: 'Aceite de Palma', category: 'Grasa', ne: 3300, lys: 0, met: 0, thr: 0, trp: 0, p: 0, dm: 99.5 },
  
  // Minerales
  { id: 'limestone', name: 'Piedra Caliza', category: 'Mineral', ne: 0, lys: 0, met: 0, thr: 0, trp: 0, p: 0, dm: 100.0 },
  { id: 'dicalcium-phosphate', name: 'Fosfato Dicálcico', category: 'Mineral', ne: 0, lys: 0, met: 0, thr: 0, trp: 0, p: 180.0, dm: 95.0 },
  { id: 'mono-dicalcium', name: 'Fosfato Mono-Dicálcico', category: 'Mineral', ne: 0, lys: 0, met: 0, thr: 0, trp: 0, p: 170.0, dm: 95.0 },
  { id: 'salt', name: 'Sal (NaCl)', category: 'Mineral', ne: 0, lys: 0, met: 0, thr: 0, trp: 0, p: 0, dm: 100.0 },
  
  // Aminoácidos
  { id: 'lysine-hcl', name: 'L-Lisina HCl', category: 'Aminoácido', ne: 0, lys: 780, met: 0, thr: 0, trp: 0, p: 0, dm: 98.0 },
  { id: 'dl-methionine', name: 'DL-Metionina', category: 'Aminoácido', ne: 0, lys: 0, met: 980, thr: 0, trp: 0, p: 0, dm: 98.0 },
  { id: 'l-threonine', name: 'L-Treonina', category: 'Aminoácido', ne: 0, lys: 0, met: 0, thr: 980, trp: 0, p: 0, dm: 98.0 },
  { id: 'l-tryptophan', name: 'L-Triptófano', category: 'Aminoácido', ne: 0, lys: 0, met: 0, thr: 0, trp: 980, p: 0, dm: 98.0 },
  { id: 'l-valine', name: 'L-Valina', category: 'Aminoácido', ne: 0, lys: 0, met: 0, thr: 0, trp: 0, p: 0, dm: 98.0 },
  { id: 'l-isoleucine', name: 'L-Isoleucina', category: 'Aminoácido', ne: 0, lys: 0, met: 0, thr: 0, trp: 0, p: 0, dm: 98.0 },
  
  // Enzimas
  { id: 'phytase', name: 'Fitasa', category: 'Enzima', ne: 0, lys: 0, met: 0, thr: 0, trp: 0, p: 0, dm: 95.0 },
  { id: 'protease', name: 'Proteasa', category: 'Enzima', ne: 0, lys: 0, met: 0, thr: 0, trp: 0, p: 0, dm: 95.0 },
  { id: 'amylase', name: 'Amilasa', category: 'Enzima', ne: 0, lys: 0, met: 0, thr: 0, trp: 0, p: 0, dm: 95.0 },
  
  // Vitaminas
  { id: 'vitamin-premix', name: 'Premix Vitamínico', category: 'Vitamina', ne: 0, lys: 0, met: 0, thr: 0, trp: 0, p: 0, dm: 95.0 },
  { id: 'trace-minerals', name: 'Microminerales', category: 'Vitamina', ne: 0, lys: 0, met: 0, thr: 0, trp: 0, p: 0, dm: 95.0 },
];

export const CATEGORIES = ['Cereal', 'Oleaginosa', 'Subproducto', 'Animal', 'Lácteo', 'Grasa', 'Mineral', 'Aminoácido', 'Enzima', 'Vitamina'];

export function getIngredientById(id: string): Ingredient | undefined {
  return ingredients.find(i => i.id === id);
}

export function getIngredientsByCategory(category: string): Ingredient[] {
  return ingredients.filter(i => i.category === category);
}

export function searchIngredients(query: string): Ingredient[] {
  const lowerQuery = query.toLowerCase();
  return ingredients.filter(i => 
    i.name.toLowerCase().includes(lowerQuery) || 
    i.category.toLowerCase().includes(lowerQuery)
  );
}
