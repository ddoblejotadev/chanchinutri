import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Modal } from 'react-native';

// Ingredientes con más datos nutricionales
const sampleIngredients = [
  { id: 'corn', name: 'Maíz', ne: 2475, lys: 2.3, met: 1.5, thr: 2.8, p: 2.5, dm: 88.5 },
  { id: 'soy', name: 'Harina de Soja', ne: 2160, lys: 24.5, met: 6.2, thr: 17.8, p: 6.0, dm: 89.0 },
  { id: 'wheat', name: 'Trigo', ne: 2290, lys: 2.9, met: 1.6, thr: 2.8, p: 3.0, dm: 89.0 },
  { id: 'barley', name: 'Cebada', ne: 2150, lys: 3.4, met: 1.5, thr: 3.2, p: 3.4, dm: 89.0 },
  { id: 'fish', name: 'Harina de Pescado', ne: 2650, lys: 45.0, met: 12.0, thr: 28.0, p: 25.0, dm: 92.0 },
  { id: 'full-fat-soy', name: 'Soja Full Fat', ne: 2550, lys: 22.0, met: 5.5, thr: 16.0, p: 5.5, dm: 90.0 },
  { id: 'wheat-bran', name: 'Salvado de Trigo', ne: 1650, lys: 4.5, met: 2.0, thr: 4.0, p: 11.0, dm: 89.0 },
  { id: 'oil', name: 'Aceite de Soja', ne: 3500, lys: 0, met: 0, thr: 0, p: 0, dm: 99.5 },
  { id: 'limestone', name: 'Piedra Caliza', ne: 0, lys: 0, met: 0, thr: 0, p: 0, dm: 100.0 },
  { id: 'salt', name: 'Sal (NaCl)', ne: 0, lys: 0, met: 0, thr: 0, p: 0, dm: 100.0 },
  { id: 'lysine', name: 'L-Lisina HCl', ne: 0, lys: 780, met: 0, thr: 0, p: 0, dm: 98.0 },
  { id: 'methionine', name: 'DL-Metionina', ne: 0, lys: 0, met: 980, thr: 0, p: 0, dm: 98.0 },
  { id: 'threonine', name: 'L-Treonina', ne: 0, lys: 0, met: 0, thr: 980, p: 0, dm: 98.0 },
  { id: 'phytase', name: 'Fitasa', ne: 0, lys: 0, met: 0, thr: 0, p: 0, dm: 95.0 },
];

type DietItem = { id: string; name: string; pct: number };
type SavedDiet = { id: string; name: string; items: DietItem[]; ne: number; lys: number; met: number; thr: number; p: number; dm: number };

export default function App() {
  const [diet, setDiet] = useState<DietItem[]>([]);
  const [savedDiets, setSavedDiets] = useState<SavedDiet[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showSaved, setShowSaved] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dietName, setDietName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredIngredients = sampleIngredients.filter(ing => 
    ing.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addIngredient = (ing: typeof sampleIngredients[0]) => {
    if (diet.find(d => d.id === ing.id)) {
      Alert.alert('Info', 'Este ingrediente ya está en la dieta');
      return;
    }
    setDiet([...diet, { id: ing.id, name: ing.name, pct: 0 }]);
    setShowAddModal(false);
    setSearchQuery('');
  };

  const updatePercentage = (id: string, pct: number) => {
    setDiet(diet.map(d => d.id === id ? { ...d, pct } : d));
  };

  const removeIngredient = (id: string) => {
    setDiet(diet.filter(d => d.id !== id));
  };

  const calculateResults = () => {
    const totalPct = diet.reduce((sum, d) => sum + d.pct, 0);
    if (totalPct !== 100) {
      Alert.alert('Advertencia', `La dieta suma ${totalPct}%. Debe sumar 100%.`);
      return;
    }
    if (diet.length === 0) {
      Alert.alert('Error', 'Agregá al menos un ingrediente');
      return;
    }
    setShowResults(true);
  };

  const getResults = () => {
    let ne = 0, lys = 0, met = 0, thr = 0, p = 0, dm = 0;
    diet.forEach(d => {
      const ing = sampleIngredients.find(i => i.id === d.id);
      if (ing) {
        ne += ing.ne * d.pct / 100;
        lys += ing.lys * d.pct / 100;
        met += ing.met * d.pct / 100;
        thr += ing.thr * d.pct / 100;
        p += ing.p * d.pct / 100;
        dm += ing.dm * d.pct / 100;
      }
    });
    return { ne: ne.toFixed(1), lys: lys.toFixed(2), met: met.toFixed(2), thr: thr.toFixed(2), p: p.toFixed(2), dm: dm.toFixed(1) };
  };

  const saveDiet = () => {
    if (!dietName.trim()) {
      Alert.alert('Error', 'Ingresá un nombre para la dieta');
      return;
    }
    const results = getResults();
    const newDiet: SavedDiet = {
      id: Date.now().toString(),
      name: dietName,
      items: [...diet],
      ne: parseFloat(results.ne),
      lys: parseFloat(results.lys),
      met: parseFloat(results.met),
      thr: parseFloat(results.thr),
      p: parseFloat(results.p),
      dm: parseFloat(results.dm),
    };
    setSavedDiets([...savedDiets, newDiet]);
    setDietName('');
    Alert.alert('Éxito', 'Dieta guardada');
  };

  const loadDiet = (saved: SavedDiet) => {
    setDiet(saved.items.map(d => ({ ...d })));
    setShowSaved(false);
    setShowResults(false);
  };

  const deleteSaved = (id: string) => {
    Alert.alert('Eliminar', '¿Eliminar esta dieta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => setSavedDiets(savedDiets.filter(d => d.id !== id)) },
    ]);
  };

  const clearDiet = () => {
    Alert.alert('Limpiar', '¿Borrar la dieta actual?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: () => { setDiet([]); setShowResults(false); } },
    ]);
  };

  const results = getResults();
  const totalPct = diet.reduce((sum, d) => sum + d.pct, 0);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>EvaPig</Text>
        <Text style={styles.subtitle}>Evaluación de piensos</Text>
      </View>

      {/* Modal Agregar Ingrediente */}
      <Modal visible={showAddModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Ingrediente</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <ScrollView style={styles.ingredientList}>
              {filteredIngredients.map(ing => (
                <TouchableOpacity key={ing.id} style={styles.ingredientOption} onPress={() => addIngredient(ing)}>
                  <Text style={styles.ingredientOptionText}>{ing.name}</Text>
                  <Text style={styles.ingredientOptionNe}>NE: {ing.ne}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => { setShowAddModal(false); setSearchQuery(''); }}>
              <Text style={styles.closeModalBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Dietas Guardadas */}
      <Modal visible={showSaved} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Dietas Guardadas</Text>
            {savedDiets.length === 0 ? (
              <Text style={styles.emptyText}>No hay dietas guardadas</Text>
            ) : (
              <ScrollView>
                {savedDiets.map(saved => (
                  <View key={saved.id} style={styles.savedItem}>
                    <TouchableOpacity style={styles.savedInfo} onPress={() => loadDiet(saved)}>
                      <Text style={styles.savedName}>{saved.name}</Text>
                      <Text style={styles.savedStats}>NE: {saved.ne} | Lys: {saved.lys}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => deleteSaved(saved.id)}>
                      <Text style={styles.deleteBtn}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowSaved(false)}>
              <Text style={styles.closeModalBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Resultados */}
      {showResults ? (
        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Resultados del Análisis</Text>
          
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Energía Neta</Text>
            <Text style={styles.resultValue}>{results.ne} <Text style={styles.resultUnit}>kcal/kg</Text></Text>
          </View>
          
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Lisina Digestible (SID)</Text>
            <Text style={styles.resultValue}>{results.lys} <Text style={styles.resultUnit}>g/kg</Text></Text>
          </View>
          
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Metionina Digestible (SID)</Text>
            <Text style={styles.resultValue}>{results.met} <Text style={styles.resultUnit}>g/kg</Text></Text>
          </View>
          
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Treonina Digestible (SID)</Text>
            <Text style={styles.resultValue}>{results.thr} <Text style={styles.resultUnit}>g/kg</Text></Text>
          </View>
          
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Fósforo Digestible</Text>
            <Text style={styles.resultValue}>{results.p} <Text style={styles.resultUnit}>g/kg</Text></Text>
          </View>
          
          <View style={styles.resultCard}>
            <Text style={styles.resultLabel}>Materia Seca</Text>
            <Text style={styles.resultValue}>{results.dm} <Text style={styles.resultUnit}>%</Text></Text>
          </View>

          <View style={styles.saveSection}>
            <TextInput
              style={styles.nameInput}
              placeholder="Nombre de la dieta"
              value={dietName}
              onChangeText={setDietName}
            />
            <TouchableOpacity style={styles.saveBtn} onPress={saveDiet}>
              <Text style={styles.saveBtnText}>Guardar Dieta</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.backBtn} onPress={() => setShowResults(false)}>
            <Text style={styles.backBtnText}>← Volver</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView style={styles.content}>
          <View style={styles.statsBar}>
            <Text style={styles.statsBarText}>Total: {totalPct.toFixed(1)}%</Text>
            <Text style={styles.statsBarText}>Ingredientes: {diet.length}</Text>
          </View>

          <Text style={styles.sectionTitle}>Ingredientes en la Dieta</Text>
          {diet.length === 0 ? (
            <Text style={styles.emptyText}>Tocá "+ Agregar" para comenzar</Text>
          ) : (
            diet.map((item, idx) => (
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

          <TouchableOpacity style={styles.addMainBtn} onPress={() => setShowAddModal(true)}>
            <Text style={styles.addMainBtnText}>+ Agregar Ingrediente</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.calcBtn} onPress={calculateResults}>
            <Text style={styles.calcBtnText}>Calcular Resultados</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.savedBtn} onPress={() => setShowSaved(true)}>
            <Text style={styles.savedBtnText}>Ver Dietas Guardadas ({savedDiets.length})</Text>
          </TouchableOpacity>

          {diet.length > 0 && (
            <TouchableOpacity style={styles.clearBtn} onPress={clearDiet}>
              <Text style={styles.clearBtnText}>Limpiar Dieta</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#4CAF50', padding: 25, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#e8f5e9', marginTop: 2 },
  content: { flex: 1, padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, color: '#333' },
  statsBar: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 15 },
  statsBarText: { fontSize: 14, color: '#4CAF50', fontWeight: '600' },
  dietItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 8 },
  dietItemName: { flex: 1, fontSize: 14 },
  pctInput: { width: 55, borderWidth: 1, borderColor: '#ddd', borderRadius: 5, padding: 6, textAlign: 'center', marginRight: 5 },
  pctSign: { marginRight: 12, color: '#666' },
  removeBtn: { color: '#f44336', fontSize: 18, padding: 5 },
  emptyText: { color: '#999', fontStyle: 'italic', textAlign: 'center', padding: 20 },
  
  addMainBtn: { backgroundColor: '#E8F5E9', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  addMainBtnText: { color: '#4CAF50', fontWeight: '600', fontSize: 16 },
  
  calcBtn: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  calcBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  
  savedBtn: { backgroundColor: '#fff', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, borderWidth: 2, borderColor: '#2196F3' },
  savedBtnText: { color: '#2196F3', fontWeight: '600', fontSize: 16 },
  
  clearBtn: { backgroundColor: '#fff', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15, borderWidth: 1, borderColor: '#f44336' },
  clearBtnText: { color: '#f44336', fontSize: 14 },

  resultCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
  resultLabel: { fontSize: 13, color: '#666', marginBottom: 3 },
  resultValue: { fontSize: 26, fontWeight: 'bold', color: '#4CAF50' },
  resultUnit: { fontSize: 14, fontWeight: 'normal', color: '#666' },

  saveSection: { flexDirection: 'row', marginTop: 15, gap: 10 },
  nameInput: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  saveBtn: { backgroundColor: '#2196F3', padding: 12, borderRadius: 8, justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '600' },

  backBtn: { backgroundColor: '#fff', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15, borderWidth: 1, borderColor: '#4CAF50' },
  backBtnText: { color: '#4CAF50', fontWeight: '600' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  searchInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 15 },
  ingredientList: { maxHeight: 300 },
  ingredientOption: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  ingredientOptionText: { fontSize: 15 },
  ingredientOptionNe: { color: '#4CAF50', fontSize: 13 },
  closeModalBtn: { backgroundColor: '#4CAF50', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  closeModalBtnText: { color: '#fff', fontWeight: '600' },

  savedItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  savedInfo: { flex: 1 },
  savedName: { fontSize: 16, fontWeight: '600' },
  savedStats: { fontSize: 12, color: '#4CAF50', marginTop: 2 },
  deleteBtn: { color: '#f44336', fontSize: 18, padding: 8 },
});
