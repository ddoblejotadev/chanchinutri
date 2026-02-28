import { DietItem, Ingredient } from '../store/dietStore';
import { getIngredientById } from '../data/ingredients';

export interface DietResults {
  ne: number;
  lys: number;
  met: number;
  thr: number;
  p: number;
  dm: number;
}

export function calculateDiet(diet: DietItem[]): DietResults {
  let ne = 0, lys = 0, met = 0, thr = 0, p = 0, dm = 0;

  diet.forEach(item => {
    const ing = getIngredientById(item.id);
    if (ing) {
      ne += ing.ne * item.pct / 100;
      lys += ing.lys * item.pct / 100;
      met += ing.met * item.pct / 100;
      thr += ing.thr * item.pct / 100;
      p += ing.p * item.pct / 100;
      dm += ing.dm * item.pct / 100;
    }
  });

  return {
    ne: Math.round(ne * 10) / 10,
    lys: Math.round(lys * 100) / 100,
    met: Math.round(met * 100) / 100,
    thr: Math.round(thr * 100) / 100,
    p: Math.round(p * 100) / 100,
    dm: Math.round(dm * 10) / 10,
  };
}

export function getTotalPercentage(diet: DietItem[]): number {
  return diet.reduce((sum, item) => sum + item.pct, 0);
}
