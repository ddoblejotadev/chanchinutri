import { Ingredient } from '../store/dietStore';

export const ingredients: Ingredient[] = [
  { id: 'corn', name: 'Maíz', ne: 2475, lys: 2.3, met: 1.5, thr: 2.8, p: 2.5, dm: 88.5 },
  { id: 'soy', name: 'Harina de Soja', ne: 2160, lys: 24.5, met: 6.2, thr: 17.8, p: 6.0, dm: 89.0 },
  { id: 'wheat', name: 'Trigo', ne: 2290, lys: 2.9, met: 1.6, thr: 2.8, p: 3.0, dm: 89.0 },
  { id: 'barley', name: 'Cebada', ne: 2150, lys: 3.4, met: 1.5, thr: 3.2, p: 3.4, dm: 89.0 },
  { id: 'fish', name: 'Harina de Pescado', ne: 2650, lys: 45.0, met: 12.0, thr: 28.0, p: 25.0, dm: 92.0 },
  { id: 'full-fat-soy', name: 'Soja Full Fat', ne: 2550, lys: 22.0, met: 5.5, thr: 16.0, p: 5.5, dm: 90.0 },
  { id: 'wheat-bran', name: 'Salvado de Trigo', ne: 1650, lys: 4.5, met: 2.0, thr: 4.0, p: 11.0, dm: 89.0 },
  { id: 'oil', name: 'Aceite de Soja', ne: 3500, lys: 0, met: 0, thr: 0, p: 0, dm: 99.5 },
  { id: 'limestone', name: 'Piedra Caliza', ne: 0, lys: 0, met: 0, thr: 0, p: 0, dm: 100.0 },
  { id: 'salt', name: 'Sal (NaCl)', ne: 0, lys: 0, met: 0, thr: 0, p: 0, dm: 100.0 },
  { id: 'lysine', name: 'L-Lisina HCl', ne: 0, lys: 780, met: 0, thr: 0, p: 0, dm: 98.0 },
  { id: 'methionine', name: 'DL-Metionina', ne: 0, lys: 0, met: 980, thr: 0, p: 0, dm: 98.0 },
  { id: 'threonine', name: 'L-Treonina', ne: 0, lys: 0, met: 0, thr: 980, p: 0, dm: 98.0 },
  { id: 'phytase', name: 'Fitasa', ne: 0, lys: 0, met: 0, thr: 0, p: 0, dm: 95.0 },
];

export function getIngredientById(id: string): Ingredient | undefined {
  return ingredients.find(i => i.id === id);
}
