import { ingredients } from '../src/data/ingredients';
import { getIngredientById } from '../src/data/ingredients';
import { dietTemplates } from '../src/data/templates';
import { Ingredient } from '../src/store/dietStore';

describe('Phase 2 - Ingredient val/ile dataset coverage', () => {
  it('ensures all ingredients expose numeric val and ile values', () => {
    for (const ingredient of ingredients) {
      expect(typeof ingredient.val).toBe('number');
      expect(typeof ingredient.ile).toBe('number');
      expect(Number.isFinite(ingredient.val)).toBe(true);
      expect(Number.isFinite(ingredient.ile)).toBe(true);
      expect(ingredient.val).toBeGreaterThanOrEqual(0);
      expect(ingredient.ile).toBeGreaterThanOrEqual(0);
    }
  });

  it('keeps val/ile in the same magnitude as other amino acids for regular ingredients', () => {
    const regularIngredients = ingredients.filter(
      (ingredient) => ingredient.category !== 'Aminoácido' && ingredient.thr > 0,
    );

    for (const ingredient of regularIngredients) {
      expect(ingredient.val).toBeLessThanOrEqual(ingredient.thr * 2.5);
      expect(ingredient.ile).toBeLessThanOrEqual(ingredient.thr * 2.5);
    }
  });

  it('keeps dedicated valine/isoleucine supplements at expected concentration', () => {
    const lValine = ingredients.find((ingredient) => ingredient.id === 'l-valine');
    const lIsoleucine = ingredients.find((ingredient) => ingredient.id === 'l-isoleucine');

    expect(lValine?.val).toBe(980);
    expect(lValine?.ile).toBe(0);

    expect(lIsoleucine?.val).toBe(0);
    expect(lIsoleucine?.ile).toBe(980);
  });

  it('supports optional inclusion limits in ingredient contract', () => {
    const ingredientWithLimits: Ingredient = {
      id: 'test-limited',
      name: 'Test Limited',
      category: 'Test',
      ne: 0,
      lys: 0,
      met: 0,
      thr: 0,
      trp: 0,
      p: 0,
      dm: 100,
      val: 0,
      ile: 0,
      inclusionLimits: {
        minPct: 0.1,
        maxPct: 0.5,
      },
    };

    const ingredientWithoutLimits: Ingredient = {
      id: 'test-unlimited',
      name: 'Test Unlimited',
      category: 'Test',
      ne: 0,
      lys: 0,
      met: 0,
      thr: 0,
      trp: 0,
      p: 0,
      dm: 100,
      val: 0,
      ile: 0,
    };

    expect(ingredientWithLimits.inclusionLimits?.minPct).toBe(0.1);
    expect(ingredientWithoutLimits.inclusionLimits).toBeUndefined();
  });

  it('exposes MVP inclusion limits for selected additives and minerals', () => {
    expect(getIngredientById('salt')?.inclusionLimits).toEqual({ minPct: 0.2, maxPct: 0.6 });
    expect(getIngredientById('dicalcium-phosphate')?.inclusionLimits).toEqual({ minPct: 0.8, maxPct: 2.5 });
    expect(getIngredientById('lysine-hcl')?.inclusionLimits).toEqual({ minPct: 0.05, maxPct: 0.4 });
    expect(getIngredientById('phytase')?.inclusionLimits).toEqual({ minPct: 0.01, maxPct: 0.15 });
  });

  it('keeps templates backward compatible with DietItem shape', () => {
    for (const template of dietTemplates) {
      for (const item of template.items) {
        expect(Object.keys(item).sort()).toEqual(['id', 'name', 'pct']);
        expect(getIngredientById(item.id)).toBeDefined();
      }
    }
  });
});
