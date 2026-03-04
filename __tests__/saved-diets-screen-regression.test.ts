import React from 'react';
import SavedDietsScreen from '../src/screens/SavedDietsScreen';
import { SAVED_DIET_SORT_BY_DATE } from '../src/screens/savedDietsQuery';
import type { SavedDiet } from '../src/store/dietStore';
import { useDietStore } from '../src/store/dietStore';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { exportDietToPDF } from '../src/utils/pdfExport';
import { Alert } from 'react-native';

jest.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  StyleSheet: { create: <T,>(styles: T): T => styles },
  FlatList: 'FlatList',
  TouchableOpacity: 'TouchableOpacity',
  TextInput: 'TextInput',
  Alert: { alert: jest.fn() },
}));

jest.mock('../src/store/dietStore', () => ({
  useDietStore: jest.fn(),
  ANIMAL_TYPES: {
    lechon: { label: 'Lechon' },
    crecimiento: { label: 'Crecimiento' },
    cerda: { label: 'Cerda' },
    reproductor: { label: 'Reproductor' },
  },
}));

jest.mock('../src/utils/pdfExport', () => ({
  exportDietToPDF: jest.fn(),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  useBottomTabBarHeight: jest.fn(),
}));

type ReactElementNode = React.ReactElement<any, any>;

function createDiet(id: string, name: string, animalType: string, createdAt: string): SavedDiet {
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

function getTextContent(node: React.ReactNode): string {
  if (typeof node === 'string' || typeof node === 'number') {
    return String(node);
  }

  if (!node) {
    return '';
  }

  if (Array.isArray(node)) {
    return node.map((child) => getTextContent(child)).join('');
  }

  const element = node as ReactElementNode;
  return getTextContent(element.props?.children);
}

function collectElements(node: React.ReactNode, type: string, results: ReactElementNode[] = []): ReactElementNode[] {
  if (!node || typeof node === 'string' || typeof node === 'number') {
    return results;
  }

  if (Array.isArray(node)) {
    node.forEach((child) => collectElements(child, type, results));
    return results;
  }

  const element = node as ReactElementNode;
  if (element.type === type) {
    results.push(element);
  }

  collectElements(element.props?.children, type, results);
  return results;
}

function findTouchableByLabel(root: React.ReactNode, label: string): ReactElementNode {
  const touchables = collectElements(root, 'TouchableOpacity');
  const match = touchables.find((touchable) => getTextContent(touchable.props.children).includes(label));

  if (!match) {
    throw new Error(`Touchable with label "${label}" not found`);
  }

  return match;
}

describe('saved diets screen regression', () => {
  const useDietStoreMock = useDietStore as unknown as jest.Mock;
  const useBottomTabBarHeightMock = useBottomTabBarHeight as unknown as jest.Mock;
  const exportDietToPDFMock = exportDietToPDF as jest.Mock;
  const alertMock = Alert.alert as jest.Mock;
  const navigateMock = jest.fn();
  const loadDietMock = jest.fn();
  const deleteSavedMock = jest.fn();
  const loadFromStorageMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useBottomTabBarHeightMock.mockReturnValue(64);

    useDietStoreMock.mockReturnValue({
      savedDiets: [],
      loadDiet: loadDietMock,
      deleteSaved: deleteSavedMock,
      darkMode: false,
      loadFromStorage: loadFromStorageMock,
    });

    jest.spyOn(React, 'useEffect').mockImplementation((effect: React.EffectCallback) => {
      effect();
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('muestra estado vacio global con CTA para crear dieta', () => {
    const setSearch = jest.fn();
    const setAnimalType = jest.fn();
    const setSortByDate = jest.fn();
    const setPage = jest.fn();

    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => ['', setSearch])
      .mockImplementationOnce(() => ['all', setAnimalType])
      .mockImplementationOnce(() => [SAVED_DIET_SORT_BY_DATE.NEWEST, setSortByDate])
      .mockImplementationOnce(() => [1, setPage]);

    const tree = SavedDietsScreen({ navigation: { navigate: navigateMock } as never });

    expect(getTextContent(tree)).toContain('No hay dietas guardadas');

    const createButton = findTouchableByLabel(tree, 'Crear Primera Dieta');
    (createButton.props as { onPress: () => void }).onPress();

    expect(navigateMock).toHaveBeenCalledWith('CreateDiet');
  });

  it('muestra sin coincidencias y limpia filtros en runtime', () => {
    useDietStoreMock.mockReturnValue({
      savedDiets: [
        createDiet('1', 'Lechon Base', 'lechon', '2024-01-01T00:00:00.000Z'),
        createDiet('2', 'Cerda Lactancia', 'cerda', '2024-01-02T00:00:00.000Z'),
      ],
      loadDiet: loadDietMock,
      deleteSaved: deleteSavedMock,
      darkMode: false,
      loadFromStorage: loadFromStorageMock,
    });

    const setSearch = jest.fn();
    const setAnimalType = jest.fn();
    const setSortByDate = jest.fn();
    const setPage = jest.fn();

    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => ['zzz', setSearch])
      .mockImplementationOnce(() => ['all', setAnimalType])
      .mockImplementationOnce(() => [SAVED_DIET_SORT_BY_DATE.NEWEST, setSortByDate])
      .mockImplementationOnce(() => [2, setPage]);

    const tree = SavedDietsScreen({ navigation: { navigate: navigateMock } as never });
    const flatList = collectElements(tree, 'FlatList')[0];
    const emptyComponent = (flatList.props as { ListEmptyComponent: React.ReactNode }).ListEmptyComponent;

    expect(getTextContent(emptyComponent)).toContain('No se encontraron dietas con los filtros actuales');

    const clearFiltersButton = findTouchableByLabel(emptyComponent, 'Limpiar filtros');
    (clearFiltersButton.props as { onPress: () => void }).onPress();

    expect(setSearch).toHaveBeenCalledWith('');
    expect(setAnimalType).toHaveBeenCalledWith('all');
    expect(setSortByDate).toHaveBeenCalledWith(SAVED_DIET_SORT_BY_DATE.NEWEST);
    expect(setPage).toHaveBeenCalledWith(1);
  });

  it('preserva acciones de cargar, exportar y eliminar en lista filtrada', async () => {
    const filteredDiet = createDiet('1', 'Lechon Base', 'lechon', '2024-01-01T00:00:00.000Z');

    useDietStoreMock.mockReturnValue({
      savedDiets: [
        filteredDiet,
        createDiet('2', 'Cerda Lactancia', 'cerda', '2024-01-02T00:00:00.000Z'),
      ],
      loadDiet: loadDietMock,
      deleteSaved: deleteSavedMock,
      darkMode: false,
      loadFromStorage: loadFromStorageMock,
    });

    const setSearch = jest.fn();
    const setAnimalType = jest.fn();
    const setSortByDate = jest.fn();
    const setPage = jest.fn();

    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => ['Lechon', setSearch])
      .mockImplementationOnce(() => ['all', setAnimalType])
      .mockImplementationOnce(() => [SAVED_DIET_SORT_BY_DATE.NEWEST, setSortByDate])
      .mockImplementationOnce(() => [1, setPage]);

    const tree = SavedDietsScreen({ navigation: { navigate: navigateMock } as never });
    const flatList = collectElements(tree, 'FlatList')[0];
    const renderItem = (flatList.props as { renderItem: ({ item }: { item: SavedDiet }) => React.ReactNode }).renderItem;
    const itemTree = renderItem({ item: filteredDiet });
    const touchables = collectElements(itemTree, 'TouchableOpacity');

    (touchables[0].props as { onPress: () => void }).onPress();
    expect(loadDietMock).toHaveBeenCalledWith(filteredDiet);
    expect(navigateMock).toHaveBeenCalledWith('CreateDiet');

    await (touchables[1].props as { onPress: () => Promise<void> }).onPress();
    expect(exportDietToPDFMock).toHaveBeenCalledWith(filteredDiet);

    (touchables[2].props as { onPress: () => void }).onPress();
    const [, , buttons] = alertMock.mock.calls[0] as [string, string, Array<{ onPress?: () => void }>];
    buttons[1].onPress?.();
    expect(deleteSavedMock).toHaveBeenCalledWith(filteredDiet.id);
  });

  it('reinicia pagina a 1 cuando cambia busqueda, tipo u orden', () => {
    useDietStoreMock.mockReturnValue({
      savedDiets: [
        createDiet('1', 'Lechon Base', 'lechon', '2024-01-01T00:00:00.000Z'),
        createDiet('2', 'Cerda Lactancia', 'cerda', '2024-01-02T00:00:00.000Z'),
      ],
      loadDiet: loadDietMock,
      deleteSaved: deleteSavedMock,
      darkMode: false,
      loadFromStorage: loadFromStorageMock,
    });

    const setSearch = jest.fn();
    const setAnimalType = jest.fn();
    const setSortByDate = jest.fn();
    const setPage = jest.fn();

    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => ['', setSearch])
      .mockImplementationOnce(() => ['all', setAnimalType])
      .mockImplementationOnce(() => [SAVED_DIET_SORT_BY_DATE.NEWEST, setSortByDate])
      .mockImplementationOnce(() => [2, setPage]);

    const tree = SavedDietsScreen({ navigation: { navigate: navigateMock } as never });

    const textInput = collectElements(tree, 'TextInput')[0];
    (textInput.props as { onChangeText: (value: string) => void }).onChangeText('lechon');

    const cerdaFilter = findTouchableByLabel(tree, 'Cerda');
    (cerdaFilter.props as { onPress: () => void }).onPress();

    const oldestSort = findTouchableByLabel(tree, 'Mas antigua');
    (oldestSort.props as { onPress: () => void }).onPress();

    expect(setPage).toHaveBeenCalledWith(1);
    expect(setSearch).toHaveBeenCalledWith('lechon');
    expect(setAnimalType).toHaveBeenCalledWith('cerda');
    expect(setSortByDate).toHaveBeenCalledWith(SAVED_DIET_SORT_BY_DATE.OLDEST);
  });

  it('ajusta pagina actual cuando queda fuera de rango tras recalculo', () => {
    useDietStoreMock.mockReturnValue({
      savedDiets: [createDiet('1', 'Lechon Base', 'lechon', '2024-01-01T00:00:00.000Z')],
      loadDiet: loadDietMock,
      deleteSaved: deleteSavedMock,
      darkMode: false,
      loadFromStorage: loadFromStorageMock,
    });

    const setSearch = jest.fn();
    const setAnimalType = jest.fn();
    const setSortByDate = jest.fn();
    const setPage = jest.fn();

    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => ['', setSearch])
      .mockImplementationOnce(() => ['all', setAnimalType])
      .mockImplementationOnce(() => [SAVED_DIET_SORT_BY_DATE.NEWEST, setSortByDate])
      .mockImplementationOnce(() => [3, setPage]);

    SavedDietsScreen({ navigation: { navigate: navigateMock } as never });

    expect(setPage).toHaveBeenCalledWith(1);
  });

  it('agrega espacio inferior para evitar contenido tapado por tab bar', () => {
    useDietStoreMock.mockReturnValue({
      savedDiets: [createDiet('1', 'Lechon Base', 'lechon', '2024-01-01T00:00:00.000Z')],
      loadDiet: loadDietMock,
      deleteSaved: deleteSavedMock,
      darkMode: false,
      loadFromStorage: loadFromStorageMock,
    });

    const setSearch = jest.fn();
    const setAnimalType = jest.fn();
    const setSortByDate = jest.fn();
    const setPage = jest.fn();

    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => ['', setSearch])
      .mockImplementationOnce(() => ['all', setAnimalType])
      .mockImplementationOnce(() => [SAVED_DIET_SORT_BY_DATE.NEWEST, setSortByDate])
      .mockImplementationOnce(() => [1, setPage]);

    const tree = SavedDietsScreen({ navigation: { navigate: navigateMock } as never });
    const flatList = collectElements(tree, 'FlatList')[0];
    const contentContainerStyle = (flatList.props as { contentContainerStyle: Record<string, number> | Array<Record<string, number>> }).contentContainerStyle;
    const normalizedStyles = Array.isArray(contentContainerStyle) ? contentContainerStyle : [contentContainerStyle];

    expect(normalizedStyles).toContainEqual(expect.objectContaining({ paddingBottom: 88 }));
  });

  it('mantiene pagina en limites al intentar navegar fuera de rango', () => {
    useDietStoreMock.mockReturnValue({
      savedDiets: [
        createDiet('1', 'Lechon 1', 'lechon', '2024-01-01T00:00:00.000Z'),
        createDiet('2', 'Lechon 2', 'lechon', '2024-01-02T00:00:00.000Z'),
      ],
      loadDiet: loadDietMock,
      deleteSaved: deleteSavedMock,
      darkMode: false,
      loadFromStorage: loadFromStorageMock,
    });

    const setSearch = jest.fn();
    const setAnimalType = jest.fn();
    const setSortByDate = jest.fn();
    const setPage = jest.fn();

    jest
      .spyOn(React, 'useState')
      .mockImplementationOnce(() => ['', setSearch])
      .mockImplementationOnce(() => ['all', setAnimalType])
      .mockImplementationOnce(() => [SAVED_DIET_SORT_BY_DATE.NEWEST, setSortByDate])
      .mockImplementationOnce(() => [1, setPage]);

    const tree = SavedDietsScreen({ navigation: { navigate: navigateMock } as never });
    const flatList = collectElements(tree, 'FlatList')[0];
    const footer = (flatList.props as { ListFooterComponent: React.ReactNode }).ListFooterComponent;

    const previous = findTouchableByLabel(footer, 'Anterior');
    const next = findTouchableByLabel(footer, 'Siguiente');

    (previous.props as { onPress: () => void }).onPress();
    (next.props as { onPress: () => void }).onPress();

    expect(setPage).not.toHaveBeenCalled();
  });
});
