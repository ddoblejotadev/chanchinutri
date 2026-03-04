import type { AnimalType, SavedDiet } from '../store/dietStore';

export const SAVED_DIET_SORT_BY_DATE = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
} as const;

export type SavedDietSortByDate = (typeof SAVED_DIET_SORT_BY_DATE)[keyof typeof SAVED_DIET_SORT_BY_DATE];

export type SavedDietAnimalTypeFilter = AnimalType | 'all';

export interface SavedDietQuery {
  search: string;
  animalType: SavedDietAnimalTypeFilter;
  sortByDate: SavedDietSortByDate;
  page: number;
  pageSize: number;
}

export interface SavedDietQueryResult {
  items: SavedDiet[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

function toTimestamp(dateValue: string): number {
  const timestamp = new Date(dateValue).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function applySavedDietQuery(savedDiets: SavedDiet[], query: SavedDietQuery): SavedDietQueryResult {
  const normalizedSearch = query.search.trim().toLowerCase();

  const filtered = savedDiets.filter((diet) => {
    const nameMatch = normalizedSearch.length === 0 || diet.name.toLowerCase().includes(normalizedSearch);
    const animalMatch = query.animalType === 'all' || diet.animalType === query.animalType;
    return nameMatch && animalMatch;
  });

  const sorted = [...filtered].sort((a, b) => {
    const aDate = toTimestamp(a.createdAt);
    const bDate = toTimestamp(b.createdAt);

    if (query.sortByDate === SAVED_DIET_SORT_BY_DATE.OLDEST) {
      return aDate - bDate;
    }

    return bDate - aDate;
  });

  const pageSize = Math.max(1, Math.floor(query.pageSize));
  const totalItems = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const currentPage = clamp(Math.floor(query.page), 1, totalPages);
  const start = (currentPage - 1) * pageSize;
  const items = sorted.slice(start, start + pageSize);

  return {
    items,
    totalItems,
    totalPages,
    currentPage,
  };
}
