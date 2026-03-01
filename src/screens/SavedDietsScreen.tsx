import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../navigation/AppNavigation';
import { useDietStore, SavedDiet, ANIMAL_TYPES } from '../store/dietStore';
import { exportDietToPDF } from '../utils/pdfExport';

type SavedDietsNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = { navigation: SavedDietsNavigationProp };

export default function SavedDietsScreen({ navigation }: Props) {
  const { savedDiets, loadDiet, deleteSaved, darkMode, loadFromStorage } = useDietStore();

  React.useEffect(() => {
    loadFromStorage();
  }, []);

  const colors = darkMode ? {
    bg: '#121212', card: '#1E1E1E', text: '#FFF', textSecondary: '#AAA', accent: '#4CAF50', error: '#f44336'
  } : {
    bg: '#f5f5f5', card: '#FFF', text: '#333', textSecondary: '#666', accent: '#4CAF50', error: '#f44336'
  };

  const handleLoad = (diet: SavedDiet) => {
    loadDiet(diet);
    navigation.navigate('CreateDiet');
  };

  const handleDelete = (id: string) => {
    Alert.alert('Confirmar', '¿Eliminar esta dieta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteSaved(id) },
    ]);
  };

  const handleExportPDF = async (diet: SavedDiet) => {
    try {
      await exportDietToPDF(diet);
    } catch (error) {
      Alert.alert('Error', 'No se pudo exportar el PDF');
    }
  };

  const renderItem = ({ item }: { item: SavedDiet }) => (
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
  );

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
      <FlatList
        data={savedDiets}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  emptyText: { fontSize: 16, marginBottom: 20 },
  createButton: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
