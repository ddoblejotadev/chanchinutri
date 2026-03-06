/**
 * Tests for the `precomputed` parameter in validateDiet and getComplianceStatus.
 *
 * Verifies that when a pre-computed DietResults is supplied, the functions
 * use the provided results instead of recalculating from the diet items.
 *
 * Strategy: We pass a `precomputed` DietResults whose values deliberately
 * differ from what calculateDiet(diet) would return for the same diet.
 * If the function produces output consistent with the precomputed values
 * (and inconsistent with the real calculation), that proves the precomputed
 * path is taken.
 */

import {
  calculateDiet,
  validateDiet,
  getComplianceStatus,
  DietResults,
} from '../src/engine/calculations';
import { DietItem } from '../src/store/dietStore';

// A 100% corn diet — real calculateDiet gives NE ~2475, lys ~2.3, etc.
const cornDiet: DietItem[] = [{ id: 'corn', name: 'Maiz', pct: 100 }];

// Precomputed values that are *all within* lechon range — the opposite of
// what corn-only would produce for most nutrients.
const withinRangePrecomputed: DietResults = {
  ne: 2500,
  lys: 14,
  met: 5,
  thr: 9,
  trp: 2.5,
  val: 7.0,
  ile: 6.0,
  p: 6,
  dm: 88,
};

describe('PERF-precomputed: validateDiet with precomputed param', () => {
  it('without precomputed: validates using internally-calculated results', () => {
    // Corn-only diet does NOT meet lechon requirements for several nutrients.
    const result = validateDiet(cornDiet, 'lechon');
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('with precomputed (all in-range): produces no nutrient warnings', () => {
    const result = validateDiet(cornDiet, 'lechon', withinRangePrecomputed);
    // If it recalculated internally, corn-only would fail many checks.
    // The fact it passes proves it used our precomputed values.
    expect(result.valid).toBe(true);
    expect(result.warnings.length).toBe(0);
  });

  it('uses precomputed NE for warning messages, not the real NE', () => {
    const lowNE: DietResults = { ...withinRangePrecomputed, ne: 1000 };
    const result = validateDiet(cornDiet, 'lechon', lowNE);
    // Real corn NE is 2475 — the warning must reference our faked 1000
    expect(result.warnings).toContain('NE bajo: 1000 < 2400 kcal/kg');
  });

  it('uses precomputed lys for warning messages', () => {
    const lowLys: DietResults = { ...withinRangePrecomputed, lys: 1 };
    const result = validateDiet(cornDiet, 'lechon', lowLys);
    expect(result.warnings).toContain('Lisina baja: 1 < 12 g/kg');
  });

  it('uses precomputed trp value for warning messages', () => {
    const highTrp: DietResults = { ...withinRangePrecomputed, trp: 99 };
    const result = validateDiet(cornDiet, 'lechon', highTrp);
    expect(result.warnings.some((w) => w.includes('Triptófano alto'))).toBe(true);
  });

  it('uses precomputed val and ile values for warning messages', () => {
    const highValIle: DietResults = { ...withinRangePrecomputed, val: 99, ile: 99 };
    const result = validateDiet(cornDiet, 'lechon', highValIle);
    expect(result.warnings.some((w) => w.includes('Valina alta'))).toBe(true);
    expect(result.warnings.some((w) => w.includes('Isoleucina alta'))).toBe(true);
  });

  it('still evaluates ingredient-inclusion limits even with precomputed', () => {
    // Salt at 1% exceeds its max inclusion limit (0.6%)
    const saltDiet: DietItem[] = [
      { id: 'salt', name: 'Sal (NaCl)', pct: 1 },
      { id: 'corn', name: 'Maiz', pct: 99 },
    ];
    const result = validateDiet(saltDiet, 'crecimiento', withinRangePrecomputed);
    // Inclusion warnings are independent of nutrient calculation
    expect(result.warningDetails.some((d) => d.ingredientId === 'salt')).toBe(true);
  });
});

describe('PERF-precomputed: getComplianceStatus with precomputed param', () => {
  it('without precomputed: status reflects real corn-only calculation', () => {
    const status = getComplianceStatus(cornDiet, 'lechon');
    // Corn-only has low lysine — should be yellow, not green
    expect(status.lys).toBe('yellow');
  });

  it('with precomputed (all in-range): returns all green', () => {
    const status = getComplianceStatus(cornDiet, 'lechon', withinRangePrecomputed);
    expect(status.ne).toBe('green');
    expect(status.lys).toBe('green');
    expect(status.p).toBe('green');
    expect(status.trp).toBe('green');
    expect(status.val).toBe('green');
    expect(status.ile).toBe('green');
  });

  it('reflects precomputed low values as yellow', () => {
    const low: DietResults = {
      ne: 1000,
      lys: 1,
      met: 0,
      thr: 0,
      trp: 0.1,
      val: 0.5,
      ile: 0.3,
      p: 0.1,
      dm: 50,
    };
    const status = getComplianceStatus(cornDiet, 'lechon', low);
    expect(status.ne).toBe('yellow');
    expect(status.lys).toBe('yellow');
    expect(status.trp).toBe('yellow');
    expect(status.val).toBe('yellow');
    expect(status.ile).toBe('yellow');
  });

  it('reflects precomputed high values as red', () => {
    const high: DietResults = {
      ne: 9999,
      lys: 999,
      met: 999,
      thr: 999,
      trp: 999,
      val: 999,
      ile: 999,
      p: 999,
      dm: 100,
    };
    const status = getComplianceStatus(cornDiet, 'lechon', high);
    expect(status.ne).toBe('red');
    expect(status.lys).toBe('red');
    expect(status.trp).toBe('red');
    expect(status.val).toBe('red');
    expect(status.ile).toBe('red');
  });

  it('returns gray for unknown animal type even with precomputed', () => {
    const status = getComplianceStatus(cornDiet, 'unknown', withinRangePrecomputed);
    expect(status.ne).toBe('gray');
    expect(status.lys).toBe('gray');
    expect(status.trp).toBe('gray');
    expect(status.val).toBe('gray');
    expect(status.ile).toBe('gray');
  });
});
