import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useDietStore } from '../store/dietStore';
import { calculateDiet } from '../engine/calculations';

export default function DietResultScreen() {
  const [dietName, setDietName] = useState('');
  const { currentDiet, savedDiets, saveDiet, clearDiet } = useDietStore();
  
  const results = calculateDiet(currentDiet);

  const handleSave = () => {
    if (!dietName.trim()) {
      Alert.alert('Error', 'Ingresá un nombre para la dieta');
      return;
    }
    saveDiet(dietName, results);
    setDietName('');
    Alert.alert('Éxito', 'Dieta guardada correctamente');
  };

  const ResultCard = ({ label, value, unit }: { label: string; value: number; unit: string }) => (
    <View style={styles.resultCard}>
      <Text style={styles.resultLabel}>{label}</Text>
      <Text style={styles.resultValue}>{value} <Text style={styles.resultUnit}>{unit}</Text></Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resultados del Análisis</Text>
      </View>
      
      <View style={styles.content}>
        <ResultCard label="Energía Neta" value={results.ne} unit="kcal/kg" />
        <ResultCard label="Lisina Digestible (SID)" value={results.lys} unit="g/kg" />
        <ResultCard label="Metionina Digestible (SID)" value={results.met} unit="g/kg" />
        <ResultCard label="Treonina Digestible (SID)" value={results.thr} unit="g/kg" />
        <ResultCard label="Fósforo Digestible" value={results.p} unit="g/kg" />
        <ResultCard label="Materia Seca" value={results.dm} unit="%" />

        <View style={styles.saveSection}>
          <TextInput
            style={styles.nameInput}
            placeholder="Nombre de la dieta"
            value={dietName}
            onChangeText={setDietName}
          />
          <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Guardar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.referenceBox}>
          <Text style={styles.referenceTitle}>Referencias</Text>
          <Text style={styles.referenceText}>
            • NE: Sistema de Energía Neta (INRAE){'\n'}
            • SID: Digestibilidad ileal estandarizada{'\n'}
            • Valores basados en tablas INRAE-CIRAD-AFZ
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#4CAF50', padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  content: { padding: 15 },
  resultCard: { backgroundColor: '#fff', padding: 15, borderRadius: 8, marginBottom: 10, elevation: 2 },
  resultLabel: { fontSize: 13, color: '#666', marginBottom: 3 },
  resultValue: { fontSize: 26, fontWeight: 'bold', color: '#4CAF50' },
  resultUnit: { fontSize: 14, fontWeight: 'normal', color: '#666' },
  saveSection: { flexDirection: 'row', marginTop: 15, gap: 10 },
  nameInput: { flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#ddd' },
  saveBtn: { backgroundColor: '#2196F3', padding: 12, borderRadius: 8, justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '600' },
  referenceBox: { backgroundColor: '#E8F5E9', marginTop: 20, padding: 15, borderRadius: 8 },
  referenceTitle: { fontSize: 14, fontWeight: 'bold', color: '#2E7D32', marginBottom: 8 },
  referenceText: { fontSize: 12, color: '#4CAF50', lineHeight: 18 },
});
