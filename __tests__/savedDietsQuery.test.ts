import { SavedDiet } from '../src/store/dietStore';
import { applySavedDietQuery, SavedDietQuery } from '../src/screens/savedDietsQuery';

function createDiet(
  id: string,
  name: string,
  animalType: string,
  createdAt: string,
): SavedDiet {
  return {
    id,
    name,
    items: [],
    ne: 0,
    lys: 0,
    met: 0,
    thr: 0,
    trp: 0,
    val: 0,
    ile: 0,
    p: 0,
    dm: 0,
    animalType,
    createdAt,
  };
}

const diets: SavedDiet[] = [
  createDiet('1', 'Lechon Base Premium', 'lechon', '2024-01-01T00:00:00.000Z'),
  createDiet('2', 'Crecimiento Balanceado', 'crecimiento', '2024-01-03T00:00:00.000Z'),
  createDiet('3', 'Cerda Gestacion', 'cerda', '2024-01-02T00:00:00.000Z'),
  createDiet('4', 'Lechon Starter', 'lechon', '2024-01-04T00:00:00.000Z'),
  createDiet('5', 'Reproductor Elite', 'reproductor', '2024-01-05T00:00:00.000Z'),
];

function defaultQuery(overrides: Partial<SavedDietQuery> = {}): SavedDietQuery {
  return {
    search: '',
    animalType: 'all',
    sortByDate: 'newest',
    page: 1,
    pageSize: 2,
    ...overrides,
  };
}

describe('applySavedDietQuery', () => {
  it('filtra por nombre con coincidencia parcial ignorando mayusculas y espacios', () => {
    const result = applySavedDietQuery(diets, defaultQuery({ search: '  LECHON  ', pageSize: 20 }));

    expect(result.totalItems).toBe(2);
    expect(result.items.map((diet) => diet.id)).toEqual(['4', '1']);
  });

  it('no excluye dietas cuando la busqueda esta vacia', () => {
    const result = applySavedDietQuery(diets, defaultQuery({ search: '   ', pageSize: 20 }));

    expect(result.totalItems).toBe(diets.length);
    expect(result.items.map((diet) => diet.id)).toEqual(['5', '4', '2', '3', '1']);
  });

  it('filtra por tipo animal seleccionado', () => {
    const onlyCerda = applySavedDietQuery(diets, defaultQuery({ animalType: 'cerda', pageSize: 20 }));

    expect(onlyCerda.items.map((diet) => diet.id)).toEqual(['3']);
  });

  it('restablece resultados al usar opcion all', () => {
    const allTypes = applySavedDietQuery(diets, defaultQuery({ animalType: 'all', pageSize: 20 }));

    expect(allTypes.totalItems).toBe(diets.length);
  });

  it('ordena por fecha en modo newest', () => {
    const newest = applySavedDietQuery(diets, defaultQuery({ sortByDate: 'newest', pageSize: 20 }));

    expect(newest.items.map((diet) => diet.id)).toEqual(['5', '4', '2', '3', '1']);
  });

  it('ordena por fecha en modo oldest', () => {
    const oldest = applySavedDietQuery(diets, defaultQuery({ sortByDate: 'oldest', pageSize: 20 }));

    expect(oldest.items.map((diet) => diet.id)).toEqual(['1', '3', '2', '4', '5']);
  });

  it('muestra el siguiente bloque al avanzar de pagina', () => {
    const page2 = applySavedDietQuery(diets, defaultQuery({ page: 2, pageSize: 2 }));

    expect(page2.totalItems).toBe(5);
    expect(page2.totalPages).toBe(3);
    expect(page2.currentPage).toBe(2);
    expect(page2.items.map((diet) => diet.id)).toEqual(['2', '3']);
  });

  it('ajusta paginas fuera de rango a los limites validos', () => {
    const belowRange = applySavedDietQuery(diets, defaultQuery({ page: 0, pageSize: 2 }));
    const outOfRange = applySavedDietQuery(diets, defaultQuery({ page: 99, pageSize: 2 }));

    expect(belowRange.currentPage).toBe(1);
    expect(belowRange.items.map((diet) => diet.id)).toEqual(['5', '4']);
    expect(outOfRange.currentPage).toBe(3);
    expect(outOfRange.items.map((diet) => diet.id)).toEqual(['1']);
  });
});
