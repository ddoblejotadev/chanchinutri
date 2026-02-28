import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, FlatList } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useDietStore } from '../store/dietStore';
import { ingredients } from '../data/ingredients';
import { calculateDiet, getTotalPercentage } from '../engine/calculations';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'CreateDiet'> };

export default function CreateDietScreen({ navigation }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  
  const { currentDiet, addIngredient, updatePercentage, removeIngredient, clearDiet } = useDietStore();
  
  const totalPct = getTotalPercentage(currentDiet);
  const filteredIngredients = ingredients.filter(i => i.name.toLowerCase().includes(search.toLowerCase()));

  const handleCalculate = () => {
    if (currentDiet.length === 0) {
      alert('Agregá al menos un ingrediente');
      return;
    }
    if (Math.abs(totalPct - 100) > 0.1) {
      alert(`La dieta suma ${totalPct.toFixed(1)}%. Debe sumar 100%.`);
      return;
    }
    navigation.navigate('DietResult');
  };

  const handleClear = () => {
    if (currentDiet.length === 0) return;
    if (confirm('¿Borrar la dieta actual?')) {
      clearDiet();
    }
  };

  return (
    <View style={styles.container}>
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Ingrediente</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar..."
              value={search}
              onChangeText={setSearch}
            />
            <FlatList
              data={filteredIngredients}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.ingredientOption}
                  onPress={() => { addIngredient(item); setShowModal(false); setSearch(''); }}
                >
                  <Text style={styles.ingredientOptionText}>{item.name}</Text>
                  <Text style={styles.ingredientOptionNe}>NE: {item.ne}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => { setShowModal(false); setSearch(''); }}>
              <Text style={styles.closeModalBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <View style={styles.statsBar}>
        <Text style={styles.statsBarText}>Total: {totalPct.toFixed(1)}%</Text>
        <Text style={styles.statsBarText}>Ingredientes: {currentDiet.length}</Text>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Ingredientes</Text>
        {currentDiet.length === 0 ? (
          <Text style={styles.emptyText}>Tocá "+ Agregar" para comenzar</Text>
        ) : (
          currentDiet.map((item, idx) => (
            <View key={idx} style={styles.dietItem}>
              <Text style={styles.dietItemName}>{item.name}</Text>
              <TextInput
                style={styles.pctInput}
                value={item.pct.toString()}
                keyboardType="numeric"
                onChangeText={(text) => updatePercentage(item.id, parseInt(text) || 0)}
              />
              <Text style={styles.pctSign}>%</Text>
              <TouchableOpacity onPress={() => removeIngredient(item.id)}>
                <Text style={styles.removeBtn}>✕</Text>
              </TouchableOpacity>
            </View>
          ))
        )}

        <TouchableOpacity style={styles.addMainBtn} onPress={() => setShowModal(true)}>
          <Text style={styles.addMainBtnText}>+ Agregar Ingrediente</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.calcBtn} onPress={handleCalculate}>
          <Text style={styles.calcBtnText}>Calcular Resultados</Text>
        </TouchableOpacity>

        {currentDiet.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear}>
            <Text style={styles.clearBtnText}>Limpiar Dieta</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  statsBar: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 12 },
  statsBarText: { fontSize: 14, color: '#4CAF50', fontWeight: '600' },
  content: { flex: 1, padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  emptyText: { color: '#999', fontStyle: 'italic', textAlign: 'center', padding: 20 },
  dietItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8 },
  dietItemName: { flex: 1, fontSize: 14 },
  pctInput: { width: 55, borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 6, textAlign: 'center', marginRight: 5 },
  pctSign: { marginRight: 12, color: '#666' },
  removeBtn: { color: '#f44336', fontSize: 18, padding: 5 },
  addMainBtn: { backgroundColor: '#E8F5E9', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  addMainBtnText: { color: '#4CAF50', fontWeight: '600', fontSize: 16 },
  calcBtn: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  calcBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  clearBtn: { backgroundColor: '#fff', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15, borderWidth: 1, borderColor: '#f44336' },
  clearBtnText: { color: '#f44336', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  searchInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 15 },
  ingredientOption: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  ingredientOptionText: { fontSize: 15 },
  ingredientOptionNe: { color: '#4CAF50', fontSize: 13 },
  closeModalBtn: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  closeModalBtnText: { color: '#fff', fontWeight: '600' },
});
