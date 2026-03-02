/**
 * Tests for EvaPig Calculation Engine
 */

import { calculateDiet, getTotalPercentage, validateDiet, getComplianceStatus, DietResults } from '../src/engine/calculations';
import { DietItem, Ingredient, NutritionalRequirements, SavedDiet, ANIMAL_TYPES } from '../src/store/dietStore';

describe('TRP-001: Ingredient interface has trp field', () => {
  it('should have trp field in Ingredient type', () => {
    const ingredient: Ingredient = {
      id: 'test',
      name: 'Test Ingredient',
      category: 'Test',
      ne: 2000,
      lys: 5,
      met: 2,
      thr: 3,
      p: 4,
      dm: 85,
      trp: 1.0,
    };
    expect(ingredient.trp).toBe(1.0);
  });
});

describe('TRP-002: NutritionalRequirements interface has trp field', () => {
  it('should have trp field in NutritionalRequirements type', () => {
    const requirements: NutritionalRequirements = {
      ne: { min: 2400, max: 2600 },
      lys: { min: 12, max: 16 },
      met: { min: 4, max: 6 },
      thr: { min: 8, max: 10 },
      p: { min: 5, max: 7 },
      trp: { min: 2.0, max: 3.0 },
    };
    expect(requirements.trp.min).toBe(2.0);
    expect(requirements.trp.max).toBe(3.0);
  });
});

describe('TRP-003: SavedDiet interface has trp field', () => {
  it('should have trp field in SavedDiet type', () => {
    const savedDiet: SavedDiet = {
      id: '1',
      name: 'Test Diet',
      items: [],
      ne: 2400,
      lys: 12,
      met: 4,
      thr: 8,
      p: 5,
      dm: 85,
      trp: 2.5,
      animalType: 'lechon',
      createdAt: '2024-01-01',
    };
    expect(savedDiet.trp).toBe(2.5);
  });
});

describe('TRP-004: ANIMAL_TYPES has trp requirements', () => {
  it('should have trp requirements for lechon', () => {
    expect(ANIMAL_TYPES.lechon.requirements.trp.min).toBe(2.0);
    expect(ANIMAL_TYPES.lechon.requirements.trp.max).toBe(3.0);
  });

  it('should have trp requirements for crecimiento', () => {
    expect(ANIMAL_TYPES.crecimiento.requirements.trp.min).toBe(1.5);
    expect(ANIMAL_TYPES.crecimiento.requirements.trp.max).toBe(2.5);
  });

  it('should have trp requirements for cerda', () => {
    expect(ANIMAL_TYPES.cerda.requirements.trp.min).toBe(1.2);
    expect(ANIMAL_TYPES.cerda.requirements.trp.max).toBe(2.0);
  });

  it('should have trp requirements for reproductor', () => {
    expect(ANIMAL_TYPES.reproductor.requirements.trp.min).toBe(1.8);
    expect(ANIMAL_TYPES.reproductor.requirements.trp.max).toBe(2.8);
  });
});

describe('TRP-008: validateDiet - Tryptophan warnings', () => {
  it('should warn when tryptophan is below minimum for lechon', () => {
    const diet: DietItem[] = [{ id: 'corn', name: 'Maíz', pct: 100 }];
    const result = validateDiet(diet, 'lechon');
    expect(result.warnings).toContain('Triptófano bajo: 0.6 < 2 g/kg');
  });

  it('should warn when tryptophan is above maximum for lechon', () => {
    const diet: DietItem[] = [
      { id: 'l-tryptophan', name: 'L-Triptófano', pct: 1 },
      { id: 'corn', name: 'Maíz', pct: 99 },
    ];
    const result = validateDiet(diet, 'lechon');
    expect(result.warnings.some(w => w.includes('alto'))).toBe(true);
  });

  it('should not warn when tryptophan is within range', () => {
    const diet: DietItem[] = [
      { id: 'soy-meal', name: 'Harina de Soja', pct: 40 },
      { id: 'corn', name: 'Maíz', pct: 60 },
    ];
    const result = validateDiet(diet, 'lechon');
    expect(result.warnings.some(w => w.includes('Triptófano'))).toBe(false);
  });
});

describe('TRP-009: getComplianceStatus - Tryptophan color codes', () => {
  it('should return yellow when below minimum', () => {
    const diet: DietItem[] = [{ id: 'corn', name: 'Maíz', pct: 100 }];
    const status = getComplianceStatus(diet, 'lechon');
    expect(status.trp).toBe('yellow');
  });

  it('should return red when above maximum', () => {
    const diet: DietItem[] = [
      { id: 'l-tryptophan', name: 'L-Triptófano', pct: 1 },
      { id: 'corn', name: 'Maíz', pct: 99 },
    ];
    const status = getComplianceStatus(diet, 'lechon');
    expect(status.trp).toBe('red');
  });

  it('should return green when within range', () => {
    const diet: DietItem[] = [
      { id: 'soy-meal', name: 'Harina de Soja', pct: 40 },
      { id: 'corn', name: 'Maíz', pct: 60 },
    ];
    const status = getComplianceStatus(diet, 'lechon');
    expect(status.trp).toBe('green');
  });

  it('should return gray for unknown animal type', () => {
    const diet: DietItem[] = [{ id: 'corn', name: 'Maíz', pct: 100 }];
    const status = getComplianceStatus(diet, 'unknown');
    expect(status.trp).toBe('gray');
  });
});

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
        { id: 'soy-meal', name: 'Harina de Soja', pct: 50 },
      ];
      const result = calculateDiet(diet);
      // (2475 * 50 + 2160 * 50) / 100 = 2317.5
      expect(result.ne).toBe(2317.5);
    });

    it('should calculate lysine correctly', () => {
      const diet: DietItem[] = [{ id: 'soy-meal', name: 'Harina de Soja', pct: 100 }];
      const result = calculateDiet(diet);
      expect(result.lys).toBe(24.5);
    });

    it('should calculate methionine correctly', () => {
      const diet: DietItem[] = [
        { id: 'corn', name: 'Maíz', pct: 50 },
        { id: 'dl-methionine', name: 'DL-Metionina', pct: 50 },
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
        { id: 'soy-meal', name: 'Harina de Soja', pct: 20 },
      ];
      const result = calculateDiet(diet);
      // (2.5 * 80 + 6.0 * 20) / 100 = 3.2
      expect(result.p).toBe(3.2);
    });

    it('should calculate dry matter correctly', () => {
      const diet: DietItem[] = [
        { id: 'corn', name: 'Maíz', pct: 50 },
        { id: 'soy-oil', name: 'Aceite de Soja', pct: 50 },
      ];
      const result = calculateDiet(diet);
      // (88.5 * 50 + 99.5 * 50) / 100 = 94
      expect(result.dm).toBe(94);
    });

    it('should handle amino acid supplements correctly', () => {
      const diet: DietItem[] = [
        { id: 'lysine-hcl', name: 'L-Lisina', pct: 0.5 },
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
          { id: 'soy-meal', name: 'Harina de Soja', pct: 25 },
          { id: 'wheat', name: 'Trigo', pct: 10 },
          { id: 'fish-meal', name: 'Harina de Pescado', pct: 5 },
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
