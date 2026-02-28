import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useDietStore, SavedDiet } from '../store/dietStore';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'SavedDiets'> };

export default function SavedDietsScreen({ navigation }: Props) {
  const { savedDiets, loadDiet, deleteSaved } = useDietStore();

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

  const renderItem = ({ item }: { item: SavedDiet }) => (
    <View style={styles.dietItem}>
      <TouchableOpacity style={styles.dietInfo} onPress={() => handleLoad(item)}>
        <Text style={styles.dietName}>{item.name}</Text>
        <Text style={styles.dietDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
        <View style={styles.dietStats}>
          <Text style={styles.statText}>NE: {item.ne}</Text>
          <Text style={styles.statText}>Lys: {item.lys}</Text>
          <Text style={styles.statText}>P: {item.p}</Text>
        </View>
      </TouchableOpacity>
      <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
        <Text style={styles.deleteButtonText}>🗑</Text>
      </TouchableOpacity>
    </View>
  );

  if (savedDiets.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No hay dietas guardadas</Text>
          <TouchableOpacity style={styles.createButton} onPress={() => navigation.navigate('CreateDiet')}>
            <Text style={styles.createButtonText}>Crear Primera Dieta</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listContent: { padding: 15 },
  dietItem: { backgroundColor: '#fff', borderRadius: 10, padding: 15, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 3 },
  dietInfo: { flex: 1 },
  dietName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  dietDate: { fontSize: 12, color: '#999', marginTop: 2 },
  dietStats: { flexDirection: 'row', marginTop: 8 },
  statText: { fontSize: 12, color: '#4CAF50', marginRight: 12, fontWeight: '600' },
  deleteButton: { padding: 10 },
  deleteButtonText: { fontSize: 20 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 30 },
  emptyText: { fontSize: 16, color: '#999', marginBottom: 20 },
  createButton: { backgroundColor: '#4CAF50', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10 },
  createButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
