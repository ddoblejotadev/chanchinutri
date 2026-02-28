import { DietItem, Ingredient, ANIMAL_TYPES, NutritionalRequirements } from '../store/dietStore';
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

export function validateDiet(diet: DietItem[], animalType: string): { valid: boolean; warnings: string[] } {
  const results = calculateDiet(diet);
  const requirements = ANIMAL_TYPES[animalType as keyof typeof ANIMAL_TYPES]?.requirements;
  
  if (!requirements) {
    return { valid: true, warnings: [] };
  }

  const warnings: string[] = [];

  // NE validation
  if (results.ne < requirements.ne.min) {
    warnings.push(`NE bajo: ${results.ne} < ${requirements.ne.min} kcal/kg`);
  } else if (results.ne > requirements.ne.max) {
    warnings.push(`NE alto: ${results.ne} > ${requirements.ne.max} kcal/kg`);
  }

  // Lys validation
  if (results.lys < requirements.lys.min) {
    warnings.push(`Lisina baja: ${results.lys} < ${requirements.lys.min} g/kg`);
  } else if (results.lys > requirements.lys.max) {
    warnings.push(`Lisina alta: ${results.lys} > ${requirements.lys.max} g/kg`);
  }

  // P validation
  if (results.p < requirements.p.min) {
    warnings.push(`Fósforo bajo: ${results.p} < ${requirements.p.min} g/kg`);
  } else if (results.p > requirements.p.max) {
    warnings.push(`Fósforo alto: ${results.p} > ${requirements.p.max} g/kg`);
  }

  return { valid: warnings.length === 0, warnings };
}

export function getComplianceStatus(diet: DietItem[], animalType: string): { ne: string; lys: string; p: string } {
  const results = calculateDiet(diet);
  const requirements = ANIMAL_TYPES[animalType as keyof typeof ANIMAL_TYPES]?.requirements;
  
  if (!requirements) {
    return { ne: 'gray', lys: 'gray', p: 'gray' };
  }

  const status = {
    ne: results.ne >= requirements.ne.min && results.ne <= requirements.ne.max ? 'green' : 
         results.ne < requirements.ne.min ? 'yellow' : 'red',
    lys: results.lys >= requirements.lys.min && results.lys <= requirements.lys.max ? 'green' : 
         results.lys < requirements.lys.min ? 'yellow' : 'red',
    p: results.p >= requirements.p.min && results.p <= requirements.p.max ? 'green' : 
       results.p < requirements.p.min ? 'yellow' : 'red',
  };

  return status;
}
