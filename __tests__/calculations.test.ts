/**
 * Tests for EvaPig Calculation Engine
 */

import { calculateDiet, getTotalPercentage, DietResults } from '../src/engine/calculations';
import { DietItem } from '../src/store/dietStore';

describe('EvaPig Calculation Engine', () => {
  
  describe('getTotalPercentage', () => {
    it('should return 0 for empty diet', () => {
      const diet: DietItem[] = [];
      expect(getTotalPercentage(diet)).toBe(0);
    });

    it('should calculate total percentage correctly', () => {
      const diet: DietItem[] = [
        { id: 'corn', name: 'Maíz', pct: 50 },
        { id: 'soy', name: 'Soja', pct: 30 },
        { id: 'wheat', name: 'Trigo', pct: 20 },
      ];
      expect(getTotalPercentage(diet)).toBe(100);
    });

    it('should handle decimal percentages', () => {
      const diet: DietItem[] = [
        { id: 'corn', name: 'Maíz', pct: 33.3 },
        { id: 'soy', name: 'Soja', pct: 33.3 },
        { id: 'wheat', name: 'Trigo', pct: 33.4 },
      ];
      expect(getTotalPercentage(diet)).toBe(100);
    });
  });

  describe('calculateDiet', () => {
    it('should calculate NE correctly for single ingredient', () => {
      const diet: DietItem[] = [{ id: 'corn', name: 'Maíz', pct: 100 }];
      const result = calculateDiet(diet);
      expect(result.ne).toBe(2475);
    });

    it('should calculate weighted average for multiple ingredients', () => {
      const diet: DietItem[] = [
        { id: 'corn', name: 'Maíz', pct: 50 },
        { id: 'soy', name: 'Soja', pct: 50 },
      ];
      const result = calculateDiet(diet);
      // (2475 * 50 + 2160 * 50) / 100 = 2317.5
      expect(result.ne).toBe(2317.5);
    });

    it('should calculate lysine correctly', () => {
      const diet: DietItem[] = [{ id: 'soy', name: 'Soja', pct: 100 }];
      const result = calculateDiet(diet);
      expect(result.lys).toBe(24.5);
    });

    it('should calculate methionine correctly', () => {
      const diet: DietItem[] = [
        { id: 'corn', name: 'Maíz', pct: 50 },
        { id: 'methionine', name: 'Metionina', pct: 50 },
      ];
      const result = calculateDiet(diet);
      // (1.5 * 50 + 980 * 50) / 100 = 490.75
      expect(result.met).toBe(490.75);
    });

    it('should return zeros for empty diet', () => {
      const diet: DietItem[] = [];
      const result = calculateDiet(diet);
      expect(result.ne).toBe(0);
      expect(result.lys).toBe(0);
      expect(result.met).toBe(0);
      expect(result.thr).toBe(0);
      expect(result.p).toBe(0);
      expect(result.dm).toBe(0);
    });

    it('should calculate phosphorus correctly', () => {
      const diet: DietItem[] = [
        { id: 'corn', name: 'Maíz', pct: 80 },
        { id: 'soy', name: 'Soja', pct: 20 },
      ];
      const result = calculateDiet(diet);
      // (2.5 * 80 + 6.0 * 20) / 100 = 3.2
      expect(result.p).toBe(3.2);
    });

    it('should calculate dry matter correctly', () => {
      const diet: DietItem[] = [
        { id: 'corn', name: 'Maíz', pct: 50 },
        { id: 'oil', name: 'Aceite', pct: 50 },
      ];
      const result = calculateDiet(diet);
      // (88.5 * 50 + 99.5 * 50) / 100 = 94
      expect(result.dm).toBe(94);
    });

    it('should handle amino acid supplements correctly', () => {
      const diet: DietItem[] = [
        { id: 'lysine', name: 'Lisina', pct: 0.5 },
        { id: 'corn', name: 'Maíz', pct: 99.5 },
      ];
      const result = calculateDiet(diet);
      // (780 * 0.5 + 2.3 * 99.5) / 100 = 6.1885 -> 6.19
      expect(result.lys).toBe(6.19);
    });

    describe('real-world diet example', () => {
      it('should calculate a typical pig grower diet', () => {
        const diet: DietItem[] = [
          { id: 'corn', name: 'Maíz', pct: 60 },
          { id: 'soy', name: 'Soja', pct: 25 },
          { id: 'wheat', name: 'Trigo', pct: 10 },
          { id: 'fish', name: 'Pescado', pct: 5 },
        ];
        
        const result = calculateDiet(diet);
        
        // NE: (2475*60 + 2160*25 + 2290*10 + 2650*5) / 100 = 2386.5
        expect(result.ne).toBe(2386.5);
        
        // Lys: (2.3*60 + 24.5*25 + 2.9*10 + 45*5) / 100 = 10.05
        expect(result.lys).toBe(10.05);
        
        // P: (2.5*60 + 6*25 + 3*10 + 25*5) / 100 = 4.55
        expect(result.p).toBe(4.55);
      });
    });
  });
});
