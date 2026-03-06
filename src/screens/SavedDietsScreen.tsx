import React, { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, TextInput } from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp, useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../navigation/AppNavigation';
import { useDietStore, SavedDiet, ANIMAL_TYPES, type AnimalType } from '../store/dietStore';
import { useShallow } from 'zustand/react/shallow';
import { exportDietToPDF } from '../utils/pdfExport';
import {
  applySavedDietQuery,
  SAVED_DIET_SORT_BY_DATE,
  type SavedDietAnimalTypeFilter,
  type SavedDietSortByDate,
} from './savedDietsQuery';

type SavedDietsNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = { navigation: SavedDietsNavigationProp };

const PAGE_SIZE = 6;
const ANIMAL_FILTER_OPTIONS: SavedDietAnimalTypeFilter[] = ['all', 'lechon', 'crecimiento', 'cerda', 'reproductor'];

export default function SavedDietsScreen({ navigation }: Props) {
  const { savedDiets, loadDiet, deleteSaved, darkMode, loadFromStorage } = useDietStore(useShallow((s) => ({ savedDiets: s.savedDiets, loadDiet: s.loadDiet, deleteSaved: s.deleteSaved, darkMode: s.darkMode, loadFromStorage: s.loadFromStorage })));
  const tabBarHeight = useBottomTabBarHeight();
  const [search, setSearch] = React.useState('');
  const [selectedAnimalType, setSelectedAnimalType] = React.useState<SavedDietAnimalTypeFilter>('all');
  const [sortByDate, setSortByDate] = React.useState<SavedDietSortByDate>(SAVED_DIET_SORT_BY_DATE.NEWEST);
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    loadFromStorage();
  }, []);

  const colors = useMemo(() => darkMode ? {
    bg: '#121212', card: '#1E1E1E', text: '#FFF', textSecondary: '#AAA', accent: '#4CAF50', error: '#f44336'
  } : {
    bg: '#f5f5f5', card: '#FFF', text: '#333', textSecondary: '#666', accent: '#4CAF50', error: '#f44336'
  }, [darkMode]);

  const handleLoad = useCallback((diet: SavedDiet) => {
    loadDiet(diet);
    navigation.navigate('CreateDiet');
  }, [loadDiet, navigation]);

  const handleDelete = useCallback((id: string) => {
    Alert.alert('Confirmar', '¿Eliminar esta dieta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteSaved(id) },
    ]);
  }, [deleteSaved]);

  const handleExportPDF = useCallback(async (diet: SavedDiet) => {
    try {
      await exportDietToPDF(diet);
    } catch (error) {
      Alert.alert('Error', 'No se pudo exportar el PDF');
    }
  }, []);

  const queryResult = useMemo(() => applySavedDietQuery(savedDiets, {
    search,
    animalType: selectedAnimalType,
    sortByDate,
    page,
    pageSize: PAGE_SIZE,
  }), [savedDiets, search, selectedAnimalType, sortByDate, page]);

  React.useEffect(() => {
    if (queryResult.currentPage < page) {
      setPage(queryResult.currentPage);
    }
  }, [page, queryResult.currentPage]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleAnimalTypeChange = (type: SavedDietAnimalTypeFilter) => {
    setSelectedAnimalType(type);
    setPage(1);
  };

  const handleSortChange = (value: SavedDietSortByDate) => {
    setSortByDate(value);
    setPage(1);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSelectedAnimalType('all');
    setSortByDate(SAVED_DIET_SORT_BY_DATE.NEWEST);
    setPage(1);
  };

  const canGoPrevious = queryResult.currentPage > 1;
  const canGoNext = queryResult.currentPage < queryResult.totalPages;
  const hasActiveFilters =
    search.trim().length > 0 ||
    selectedAnimalType !== 'all' ||
    sortByDate !== SAVED_DIET_SORT_BY_DATE.NEWEST;

  const renderItem = useCallback(({ item }: { item: SavedDiet }) => (
    <View style={[styles.dietItem, { backgroundColor: colors.card }]}>
      <TouchableOpacity style={styles.dietInfo} onPress={() => handleLoad(item)}>
        <Text style={[styles.dietName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.dietAnimal, { color: colors.accent }]}>{ANIMAL_TYPES[item.animalType as keyof typeof ANIMAL_TYPES]?.label || item.animalType}</Text>
        <Text style={[styles.dietDate, { color: colors.textSecondary }]}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        <View style={styles.dietStats}>
          <Text style={[styles.statText, { color: colors.accent }]}>NE: {item.ne}</Text>
          <Text style={[styles.statText, { color: colors.accent }]}>Lys: {item.lys}</Text>
          <Text style={[styles.statText, { color: colors.accent }]}>P: {item.p}</Text>
        </View>
      </TouchableOpacity>
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleExportPDF(item)}>
          <Text style={styles.exportIcon}>📄</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(item.id)}>
          <Text style={[styles.deleteIcon, { color: colors.error }]}>🗑</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [colors, handleLoad, handleDelete, handleExportPDF]);

  if (savedDiets.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No hay dietas guardadas</Text>
          <TouchableOpacity style={[styles.createButton, { backgroundColor: colors.accent }]} onPress={() => navigation.navigate('CreateDiet')}>
            <Text style={styles.createButtonText}>Crear Primera Dieta</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.filtersContainer, { backgroundColor: colors.card }]}>
        <TextInput
          value={search}
          onChangeText={handleSearchChange}
          placeholder="Buscar por nombre"
          placeholderTextColor={colors.textSecondary}
          style={[styles.searchInput, { color: colors.text, backgroundColor: colors.bg, borderColor: colors.textSecondary }]}
        />

        <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Tipo de animal</Text>
        <View style={styles.filterRow}>
          {ANIMAL_FILTER_OPTIONS.map((option) => {
            const isActive = selectedAnimalType === option;
            const optionLabel = option === 'all'
              ? 'Todos'
              : ANIMAL_TYPES[option as AnimalType].label;

            return (
              <TouchableOpacity
                key={option}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isActive ? colors.accent : colors.bg,
                    borderColor: colors.accent,
                  },
                ]}
                onPress={() => handleAnimalTypeChange(option)}
              >
                <Text style={[styles.filterChipText, { color: isActive ? '#FFF' : colors.text }]}>{optionLabel}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.filterLabel, { color: colors.textSecondary }]}>Orden por fecha</Text>
        <View style={styles.sortRow}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              {
                backgroundColor: sortByDate === SAVED_DIET_SORT_BY_DATE.NEWEST ? colors.accent : colors.bg,
                borderColor: colors.accent,
              },
            ]}
            onPress={() => handleSortChange(SAVED_DIET_SORT_BY_DATE.NEWEST)}
          >
            <Text style={[styles.sortButtonText, { color: sortByDate === SAVED_DIET_SORT_BY_DATE.NEWEST ? '#FFF' : colors.text }]}>Mas reciente</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              {
                backgroundColor: sortByDate === SAVED_DIET_SORT_BY_DATE.OLDEST ? colors.accent : colors.bg,
                borderColor: colors.accent,
              },
            ]}
            onPress={() => handleSortChange(SAVED_DIET_SORT_BY_DATE.OLDEST)}
          >
            <Text style={[styles.sortButtonText, { color: sortByDate === SAVED_DIET_SORT_BY_DATE.OLDEST ? '#FFF' : colors.text }]}>Mas antigua</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={queryResult.items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        initialNumToRender={6}
        maxToRenderPerBatch={4}
        windowSize={5}
        contentContainerStyle={[styles.listContent, { paddingBottom: tabBarHeight + 24 }]}
        ListEmptyComponent={
          <View style={styles.emptyFiltersContainer}>
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No se encontraron dietas con los filtros actuales</Text>
            {hasActiveFilters && (
              <TouchableOpacity style={[styles.clearFiltersButton, { borderColor: colors.accent }]} onPress={handleClearFilters}>
                <Text style={[styles.clearFiltersButtonText, { color: colors.accent }]}>Limpiar filtros</Text>
              </TouchableOpacity>
            )}
          </View>
        }
        ListFooterComponent={queryResult.totalItems > 0 ? (
          <View style={styles.paginationContainer}>
            <TouchableOpacity
              style={[
                styles.paginationButton,
                {
                  backgroundColor: canGoPrevious ? colors.accent : colors.card,
                  borderColor: colors.accent,
                },
              ]}
              onPress={() => canGoPrevious && setPage((prevPage) => prevPage - 1)}
              disabled={!canGoPrevious}
            >
              <Text style={[styles.paginationButtonText, { color: canGoPrevious ? '#FFF' : colors.textSecondary }]}>Anterior</Text>
            </TouchableOpacity>

            <Text style={[styles.paginationText, { color: colors.textSecondary }]}>Pagina {queryResult.currentPage} de {queryResult.totalPages}</Text>

            <TouchableOpacity
              style={[
                styles.paginationButton,
                {
                  backgroundColor: canGoNext ? colors.accent : colors.card,
                  borderColor: colors.accent,
                },
              ]}
              onPress={() => canGoNext && setPage((prevPage) => prevPage + 1)}
              disabled={!canGoNext}
            >
              <Text style={[styles.paginationButtonText, { color: canGoNext ? '#FFF' : colors.textSecondary }]}>Siguiente</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filtersContainer: { paddingHorizontal: 15, paddingTop: 15, paddingBottom: 8 },
  searchInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12 },
  filterLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  filterChip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  filterChipText: { fontSize: 12, fontWeight: '600' },
  sortRow: { flexDirection: 'row', gap: 8 },
  sortButton: { flex: 1, borderWidth: 1, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  sortButtonText: { fontSize: 12, fontWeight: '600' },
  listContent: { padding: 15 },
  dietItem: { borderRadius: 10, padding: 15, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  dietInfo: { flex: 1 },
  dietName: { fontSize: 18, fontWeight: 'bold' },
  dietAnimal: { fontSize: 12, fontWeight: '600', marginTop: 2 },
  dietDate: { fontSize: 12, marginTop: 2 },
  dietStats: { flexDirection: 'row', marginTop: 8, gap: 12 },
  statText: { fontSize: 12, fontWeight: '600' },
  actionButtons: { flexDirection: 'row', gap: 8 },
  actionBtn: { padding: 8 },
  exportIcon: { fontSize: 18 },
  deleteIcon: { fontSize: 18 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyFiltersContainer: { paddingVertical: 40, alignItems: 'center', gap: 8 },
  emptyText: { fontSize: 16, marginBottom: 20 },
  createButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  clearFiltersButton: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8 },
  clearFiltersButtonText: { fontSize: 14, fontWeight: '600' },
  paginationContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  paginationButton: { borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8, minWidth: 84, alignItems: 'center' },
  paginationButtonText: { fontSize: 12, fontWeight: '600' },
  paginationText: { fontSize: 12, fontWeight: '600' },
});
