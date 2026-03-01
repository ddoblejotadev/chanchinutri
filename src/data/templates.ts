import { DietItem, AnimalType } from '../store/dietStore';

export interface DietTemplate {
  id: string;
  name: string;
  animalType: AnimalType;
  description: string;
  items: DietItem[];
}

export const dietTemplates: DietTemplate[] = [
  {
    id: 'lechon-1',
    name: 'Lechón Inicial 5-15kg',
    animalType: 'lechon',
    description: 'Dieta alta en lisina para crecimiento óptimo',
    items: [
      { id: 'corn', name: 'Maíz', pct: 35 },
      { id: 'soy-meal', name: 'Harina de Soja', pct: 30 },
      { id: 'whey', name: 'Suero de Leche', pct: 15 },
      { id: 'fish-meal', name: 'Harina de Pescado', pct: 8 },
      { id: 'soy-oil', name: 'Aceite de Soja', pct: 5 },
      { id: 'dicalcium-phosphate', name: 'Fosfato Dicálcico', pct: 2 },
      { id: 'limestone', name: 'Piedra Caliza', pct: 1 },
      { id: 'salt', name: 'Sal', pct: 0.5 },
      { id: 'lysine-hcl', name: 'L-Lisina', pct: 0.3 },
      { id: 'dl-methionine', name: 'DL-Metionina', pct: 0.15 },
      { id: 'vitamin-premix', name: 'Premix Vitamínico', pct: 0.25 },
      { id: 'trace-minerals', name: 'Microminerales', pct: 0.2 },
      { id: 'phytase', name: 'Fitasa', pct: 0.1 },
    ],
  },
  {
    id: 'lechon-2',
    name: 'Lechón Crecimiento 15-25kg',
    animalType: 'lechon',
    description: 'Transición a dieta sólida',
    items: [
      { id: 'corn', name: 'Maíz', pct: 45 },
      { id: 'soy-meal', name: 'Harina de Soja', pct: 28 },
      { id: 'wheat', name: 'Trigo', pct: 10 },
      { id: 'fish-meal', name: 'Harina de Pescado', pct: 5 },
      { id: 'soy-full-fat', name: 'Soja Full Fat', pct: 5 },
      { id: 'dicalcium-phosphate', name: 'Fosfato Dicálcico', pct: 1.5 },
      { id: 'limestone', name: 'Piedra Caliza', pct: 1 },
      { id: 'salt', name: 'Sal', pct: 0.5 },
      { id: 'lysine-hcl', name: 'L-Lisina', pct: 0.2 },
      { id: 'vitamin-premix', name: 'Premix Vitamínico', pct: 0.2 },
      { id: 'phytase', name: 'Fitasa', pct: 0.1 },
    ],
  },
  {
    id: 'crecimiento-1',
    name: 'Crecimiento 25-50kg',
    animalType: 'crecimiento',
    description: 'Fase de crecimiento eficiente',
    items: [
      { id: 'corn', name: 'Maíz', pct: 55 },
      { id: 'soy-meal', name: 'Harina de Soja', pct: 22 },
      { id: 'wheat', name: 'Trigo', pct: 10 },
      { id: 'barley', name: 'Cebada', pct: 5 },
      { id: 'wheat-bran', name: 'Salvado de Trigo', pct: 3 },
      { id: 'dicalcium-phosphate', name: 'Fosfato Dicálcico', pct: 1.2 },
      { id: 'limestone', name: 'Piedra Caliza', pct: 0.8 },
      { id: 'salt', name: 'Sal', pct: 0.5 },
      { id: 'lysine-hcl', name: 'L-Lisina', pct: 0.15 },
      { id: 'vitamin-premix', name: 'Premix Vitamínico', pct: 0.15 },
      { id: 'phytase', name: 'Fitasa', pct: 0.1 },
    ],
  },
  {
    id: 'crecimiento-2',
    name: 'Crecimiento 50-100kg',
    animalType: 'crecimiento',
    description: 'Fase de finalización',
    items: [
      { id: 'corn', name: 'Maíz', pct: 60 },
      { id: 'soy-meal', name: 'Harina de Soja', pct: 18 },
      { id: 'wheat', name: 'Trigo', pct: 10 },
      { id: 'barley', name: 'Cebada', pct: 5 },
      { id: 'wheat-bran', name: 'Salvado de Trigo', pct: 3 },
      { id: 'dicalcium-phosphate', name: 'Fosfato Dicálcico', pct: 1 },
      { id: 'limestone', name: 'Piedra Caliza', pct: 0.8 },
      { id: 'salt', name: 'Sal', pct: 0.5 },
      { id: 'vitamin-premix', name: 'Premix Vitamínico', pct: 0.12 },
      { id: 'phytase', name: 'Fitasa', pct: 0.08 },
    ],
  },
  {
    id: 'cerda-gestante',
    name: 'Cerda Gestante',
    animalType: 'cerda',
    description: 'Dieta para cerdas en gestación',
    items: [
      { id: 'corn', name: 'Maíz', pct: 45 },
      { id: 'wheat', name: 'Trigo', pct: 20 },
      { id: 'barley', name: 'Cebada', pct: 15 },
      { id: 'soy-meal', name: 'Harina de Soja', pct: 10 },
      { id: 'wheat-bran', name: 'Salvado de Trigo', pct: 5 },
      { id: 'dicalcium-phosphate', name: 'Fosfato Dicálcico', pct: 1.5 },
      { id: 'limestone', name: 'Piedra Caliza', pct: 1.2 },
      { id: 'salt', name: 'Sal', pct: 0.6 },
      { id: 'vitamin-premix', name: 'Premix Vitamínico', pct: 0.2 },
      { id: 'trace-minerals', name: 'Microminerales', pct: 0.15 },
      { id: 'phytase', name: 'Fitasa', pct: 0.15 },
    ],
  },
  {
    id: 'reproductor',
    name: 'Reproductor',
    animalType: 'reproductor',
    description: 'Dieta para verracos reproductores',
    items: [
      { id: 'corn', name: 'Maíz', pct: 50 },
      { id: 'wheat', name: 'Trigo', pct: 15 },
      { id: 'barley', name: 'Cebada', pct: 12 },
      { id: 'soy-meal', name: 'Harina de Soja', pct: 15 },
      { id: 'fish-meal', name: 'Harina de Pescado', pct: 3 },
      { id: 'wheat-bran', name: 'Salvado de Trigo', pct: 2 },
      { id: 'dicalcium-phosphate', name: 'Fosfato Dicálcico', pct: 1.2 },
      { id: 'limestone', name: 'Piedra Caliza', pct: 0.8 },
      { id: 'salt', name: 'Sal', pct: 0.5 },
      { id: 'soy-oil', name: 'Aceite de Soja', pct: 0.8 },
      { id: 'lysine-hcl', name: 'L-Lisina', pct: 0.1 },
      { id: 'dl-methionine', name: 'DL-Metionina', pct: 0.05 },
      { id: 'vitamin-premix', name: 'Premix Vitamínico', pct: 0.2 },
      { id: 'trace-minerals', name: 'Microminerales', pct: 0.15 },
      { id: 'phytase', name: 'Fitasa', pct: 0.1 },
    ],
  },
];

export function getTemplatesByAnimalType(animalType: AnimalType): DietTemplate[] {
  return dietTemplates.filter(t => t.animalType === animalType);
}

export function getTemplateById(id: string): DietTemplate | undefined {
  return dietTemplates.find(t => t.id === id);
}
