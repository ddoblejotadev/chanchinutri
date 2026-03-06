import fs from 'fs';
import path from 'path';
import type { DietItem } from '../src/store/dietStore';

/**
 * Rendering optimization regression tests.
 *
 * Task 6.3: chartData generation must not mutate the original currentDiet array.
 * Task 6.4: ingredient list in CreateDietScreen must use item.id as key (not index).
 */

describe('rendering optimization regression', () => {
  // --- Task 6.3: Sort immutability ---
  describe('chartData sort immutability', () => {
    it('DietResultScreen spreads currentDiet before sorting for chartData', () => {
      const source = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'screens', 'DietResultScreen.tsx'),
        'utf8',
      );

      // The chartData useMemo must use [...currentDiet].sort, NOT currentDiet.sort
      expect(source).toMatch(/\[\.\.\.currentDiet\]\s*\n?\s*\.sort/);
      expect(source).not.toMatch(/currentDiet\s*\n?\s*\.sort/);
    });

    it('sorting a copy does not mutate the original array', () => {
      const original: DietItem[] = [
        { id: 'corn', name: 'Maiz', pct: 60 },
        { id: 'soy-meal', name: 'Harina de Soja', pct: 25 },
        { id: 'wheat', name: 'Trigo', pct: 10 },
        { id: 'fish-meal', name: 'Harina de Pescado', pct: 5 },
      ];

      const snapshot = original.map((item) => ({ ...item }));

      // Simulate what DietResultScreen does: spread then sort
      const sorted = [...original].sort((a, b) => b.pct - a.pct);

      // Original must remain unchanged
      expect(original).toEqual(snapshot);
      // Sorted must be in descending pct order
      expect(sorted[0].pct).toBeGreaterThanOrEqual(sorted[sorted.length - 1].pct);
    });
  });

  // --- Task 6.4: key={item.id} in ingredient list ---
  describe('ingredient list key uses item.id', () => {
    it('CreateDietScreen uses key={item.id} for IngredientRow, not index', () => {
      const source = fs.readFileSync(
        path.join(__dirname, '..', 'src', 'screens', 'CreateDietScreen.tsx'),
        'utf8',
      );

      // Must find key={item.id} on IngredientRow
      expect(source).toMatch(/<IngredientRow[\s\S]*?key=\{item\.id\}/);
      // Must NOT find key={idx} or key={index} patterns in the ingredient mapping
      expect(source).not.toMatch(/key=\{idx\}/);
      expect(source).not.toMatch(/key=\{index\}/);
    });
  });
});
