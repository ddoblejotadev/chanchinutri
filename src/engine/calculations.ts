import {
  ANIMAL_TYPES,
  DietItem,
  INCLUSION_WARNING_REASON,
  INCLUSION_WARNING_SOURCE,
  IngredientInclusionWarning,
} from '../store/dietStore';
import { getIngredientById } from '../data/ingredients';

export interface DietResults {
  ne: number;
  lys: number;
  met: number;
  thr: number;
  trp: number;
  val: number;
  ile: number;
  p: number;
  dm: number;
}

type ComplianceColor = 'green' | 'yellow' | 'red' | 'gray';
type ComplianceStatus = {
  ne: ComplianceColor;
  lys: ComplianceColor;
  p: ComplianceColor;
  trp: ComplianceColor;
  val: ComplianceColor;
  ile: ComplianceColor;
};

export interface DietValidationResult {
  valid: boolean;
  warnings: string[];
  warningDetails: IngredientInclusionWarning[];
}

function formatPct(value: number): number {
  return Math.round(value * 100) / 100;
}

function buildInclusionWarningDetail(
  item: DietItem,
  ingredientName: string,
  reason: IngredientInclusionWarning['reason'],
  limitPct: number,
): IngredientInclusionWarning {
  return {
    source: INCLUSION_WARNING_SOURCE.INGREDIENT_INCLUSION,
    reason,
    ingredientId: item.id,
    ingredientName,
    actualPct: formatPct(item.pct),
    limitPct: formatPct(limitPct),
  };
}

function formatAllowedRange(minPct?: number, maxPct?: number): string {
  if (typeof minPct === 'number' && typeof maxPct === 'number') {
    return `${formatPct(minPct)}-${formatPct(maxPct)}%`;
  }
  if (typeof minPct === 'number') {
    return `>= ${formatPct(minPct)}%`;
  }
  if (typeof maxPct === 'number') {
    return `<= ${formatPct(maxPct)}%`;
  }
  return 'sin limite';
}

function buildInclusionWarningMessage(
  detail: IngredientInclusionWarning,
  minPct?: number,
  maxPct?: number,
): string {
  if (detail.reason === INCLUSION_WARNING_REASON.BELOW_MIN) {
    return `Inclusion baja en ${detail.ingredientName}: ${detail.actualPct}% < ${detail.limitPct}% (rango ${formatAllowedRange(minPct, maxPct)})`;
  }

  return `Inclusion alta en ${detail.ingredientName}: ${detail.actualPct}% > ${detail.limitPct}% (rango ${formatAllowedRange(minPct, maxPct)})`;
}

function validateIngredientInclusion(
  diet: DietItem[],
  warnings: string[],
  warningDetails: IngredientInclusionWarning[],
): void {
  for (const item of diet) {
    const ingredient = getIngredientById(item.id);
    if (!ingredient?.inclusionLimits) {
      continue;
    }

    const { minPct, maxPct } = ingredient.inclusionLimits;
    let detail: IngredientInclusionWarning | null = null;

    if (typeof minPct === 'number' && item.pct < minPct) {
      detail = buildInclusionWarningDetail(item, ingredient.name, INCLUSION_WARNING_REASON.BELOW_MIN, minPct);
    } else if (typeof maxPct === 'number' && item.pct > maxPct) {
      detail = buildInclusionWarningDetail(item, ingredient.name, INCLUSION_WARNING_REASON.ABOVE_MAX, maxPct);
    }

    if (detail) {
      warningDetails.push(detail);
      warnings.push(buildInclusionWarningMessage(detail, minPct, maxPct));
    }
  }
}

export function calculateDiet(diet: DietItem[]): DietResults {
  let ne = 0, lys = 0, met = 0, thr = 0, trp = 0, val = 0, ile = 0, p = 0, dm = 0;

  diet.forEach(item => {
    const ing = getIngredientById(item.id);
    if (ing) {
      ne += ing.ne * item.pct / 100;
      lys += ing.lys * item.pct / 100;
      met += ing.met * item.pct / 100;
      thr += ing.thr * item.pct / 100;
      trp += ing.trp * item.pct / 100;
      val += ing.val * item.pct / 100;
      ile += ing.ile * item.pct / 100;
      p += ing.p * item.pct / 100;
      dm += ing.dm * item.pct / 100;
    }
  });

  return {
    ne: Math.round(ne * 10) / 10,
    lys: Math.round(lys * 100) / 100,
    met: Math.round(met * 100) / 100,
    thr: Math.round(thr * 100) / 100,
    trp: Math.round(trp * 100) / 100,
    val: Math.round(val * 100) / 100,
    ile: Math.round(ile * 100) / 100,
    p: Math.round(p * 100) / 100,
    dm: Math.round(dm * 10) / 10,
  };
}

export function getTotalPercentage(diet: DietItem[]): number {
  return diet.reduce((sum, item) => sum + item.pct, 0);
}

export function validateDiet(diet: DietItem[], animalType: string): DietValidationResult {
  const results = calculateDiet(diet);
  const requirements = ANIMAL_TYPES[animalType as keyof typeof ANIMAL_TYPES]?.requirements;
  const warnings: string[] = [];
  const warningDetails: IngredientInclusionWarning[] = [];

  validateIngredientInclusion(diet, warnings, warningDetails);

  if (!requirements) {
    return { valid: warnings.length === 0, warnings, warningDetails };
  }

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

  // Trp validation
  if (results.trp < requirements.trp.min) {
    warnings.push(`Triptófano bajo: ${results.trp} < ${requirements.trp.min} g/kg`);
  } else if (results.trp > requirements.trp.max) {
    warnings.push(`Triptófano alto: ${results.trp} > ${requirements.trp.max} g/kg`);
  }

  // Val validation
  if (results.val < requirements.val.min) {
    warnings.push(`Valina baja: ${results.val} < ${requirements.val.min} g/kg`);
  } else if (results.val > requirements.val.max) {
    warnings.push(`Valina alta: ${results.val} > ${requirements.val.max} g/kg`);
  }

  // Ile validation
  if (results.ile < requirements.ile.min) {
    warnings.push(`Isoleucina baja: ${results.ile} < ${requirements.ile.min} g/kg`);
  } else if (results.ile > requirements.ile.max) {
    warnings.push(`Isoleucina alta: ${results.ile} > ${requirements.ile.max} g/kg`);
  }

  return { valid: warnings.length === 0, warnings, warningDetails };
}

export function getComplianceStatus(
  diet: DietItem[],
  animalType: string
): ComplianceStatus {
  const results = calculateDiet(diet);
  const requirements = ANIMAL_TYPES[animalType as keyof typeof ANIMAL_TYPES]?.requirements;
  
  if (!requirements) {
    return { ne: 'gray', lys: 'gray', p: 'gray', trp: 'gray', val: 'gray', ile: 'gray' };
  }

  const status: ComplianceStatus = {
    ne: results.ne >= requirements.ne.min && results.ne <= requirements.ne.max ? 'green' : 
         results.ne < requirements.ne.min ? 'yellow' : 'red',
    lys: results.lys >= requirements.lys.min && results.lys <= requirements.lys.max ? 'green' : 
         results.lys < requirements.lys.min ? 'yellow' : 'red',
    p: results.p >= requirements.p.min && results.p <= requirements.p.max ? 'green' : 
       results.p < requirements.p.min ? 'yellow' : 'red',
    trp: results.trp >= requirements.trp.min && results.trp <= requirements.trp.max ? 'green' : 
         results.trp < requirements.trp.min ? 'yellow' : 'red',
    val: results.val >= requirements.val.min && results.val <= requirements.val.max ? 'green' :
         results.val < requirements.val.min ? 'yellow' : 'red',
    ile: results.ile >= requirements.ile.min && results.ile <= requirements.ile.max ? 'green' :
         results.ile < requirements.ile.min ? 'yellow' : 'red',
  };

  return status;
}
