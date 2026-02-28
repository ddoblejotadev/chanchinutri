import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useDietStore, ANIMAL_TYPES } from '../store/dietStore';
import { calculateDiet, validateDiet, getComplianceStatus } from '../engine/calculations';
import { exportDietToPDF } from '../utils/pdfExport';

export default function DietResultScreen() {
  const [dietName, setDietName] = useState('');
  const [diet, setDiet] = useState<any>(null);
  const { currentDiet, savedDiets, saveDiet, clearDiet, animalType, darkMode, loadDiet } = useDietStore();
  
  const results = calculateDiet(currentDiet);
  const validation = validateDiet(currentDiet, animalType);
  const compliance = getComplianceStatus(currentDiet, animalType);
  const requirements = ANIMAL_TYPES[animalType].requirements;

  const colors = darkMode ? {
    bg: '#121212', card: '#1E1E1E', text: '#FFF', textSecondary: '#AAA', accent: '#4CAF50',
    warning: '#FFA000', error: '#f44336', success: '#4CAF50'
  } : {
    bg: '#f5f5f5', card: '#FFF', text: '#333', textSecondary: '#666', accent: '#4CAF50',
    warning: '#FFA000', error: '#f44336', success: '#4CAF50'
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'green': return colors.success;
      case 'yellow': return colors.warning;
      case 'red': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const handleSave = async () => {
    if (!dietName.trim()) {
      Alert.alert('Error', 'Ingresá un nombre para la dieta');
      return;
    }
    saveDiet(dietName, results);
    setDietName('');
    Alert.alert('Éxito', 'Dieta guardada correctamente');
  };

  const handleExportPDF = async () => {
    const savedDiet = {
      id: Date.now().toString(),
      name: dietName || 'Dieta sin nombre',
      items: currentDiet.map(d => ({ ...d })),
      ...results,
      animalType,
      createdAt: new Date().toISOString(),
    };
    
    try {
      await exportDietToPDF(savedDiet);
    } catch (error) {
      Alert.alert('Error', 'No se pudo exportar el PDF');
    }
  };

  const ResultCard = ({ label, value, unit, status }: { label: string; value: number; unit: string; status?: string }) => {
    const color = status ? getComplianceColor(status) : colors.accent;
    return (
      <View style={[styles.resultCard, { backgroundColor: colors.card }]}>
        <View style={styles.resultHeader}>
          <Text style={[styles.resultLabel, { color: colors.textSecondary }]}>{label}</Text>
          {status && <View style={[styles.statusDot, { backgroundColor: color }]} />}
        </View>
        <Text style={[styles.resultValue, { color }]}>{value} <Text style={styles.resultUnit}>{unit}</Text></Text>
      </View>
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.accent }]}>
        <Text style={styles.headerTitle}>Resultados del Análisis</Text>
        <Text style={styles.headerSubtitle}>{ANIMAL_TYPES[animalType].label}</Text>
      </View>

      {/* Warnings */}
      {validation.warnings.length > 0 && (
        <View style={[styles.warningBox, { backgroundColor: colors.warning + '20' }]}>
          <Text style={[styles.warningTitle, { color: colors.warning }]}>⚠️ Recomendaciones:</Text>
          {validation.warnings.map((w, i) => (
            <Text key={i} style={[styles.warningText, { color: colors.textSecondary }]}>• {w}</Text>
          ))}
        </View>
      )}
      
      <View style={styles.content}>
        <ResultCard label="Energía Neta" value={results.ne} unit="kcal/kg" status={compliance.ne} />
        <ResultCard label="Lisina Digestible (SID)" value={results.lys} unit="g/kg" status={compliance.lys} />
        <ResultCard label="Metionina Digestible (SID)" value={results.met} unit="g/kg" />
        <ResultCard label="Treonina Digestible (SID)" value={results.thr} unit="g/kg" />
        <ResultCard label="Fósforo Digestible" value={results.p} unit="g/kg" status={compliance.p} />
        <ResultCard label="Materia Seca" value={results.dm} unit="%" />

        {/* Requirements Reference */}
        <View style={[styles.referenceBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.referenceTitle, { color: colors.text }]}>Valores de referencia ({ANIMAL_TYPES[animalType].label})</Text>
          <Text style={[styles.referenceText, { color: colors.textSecondary }]}>
            NE: {requirements.ne.min} - {requirements.ne.max} kcal/kg{' | '}
            Lys: {requirements.lys.min} - {requirements.lys.max} g/kg{' | '}
            P: {requirements.p.min} - {requirements.p.max} g/kg
          </Text>
        </View>

        <View style={styles.saveSection}>
          <TextInput
            style={[styles.nameInput, { backgroundColor: colors.card, color: colors.text }]}
            placeholder="Nombre de la dieta"
            placeholderTextColor={colors.textSecondary}
            value={dietName}
            onChangeText={setDietName}
          />
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.accent }]} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Guardar</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.exportBtn, { backgroundColor: colors.card, borderColor: colors.accent }]} onPress={handleExportPDF}>
          <Text style={[styles.exportBtnText, { color: colors.accent }]}>📄 Exportar PDF</Text>
        </TouchableOpacity>

        <View style={[styles.sourceBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.sourceTitle, { color: colors.text }]}>Referencias</Text>
          <Text style={[styles.sourceText, { color: colors.textSecondary }]}>
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
  container: { flex: 1 },
  header: { padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#E8F5E9', marginTop: 5 },
  warningBox: { margin: 15, padding: 15, borderRadius: 8 },
  warningTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  warningText: { fontSize: 12, marginBottom: 3 },
  content: { padding: 15 },
  resultCard: { padding: 15, borderRadius: 8, marginBottom: 10 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  resultLabel: { fontSize: 13 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  resultValue: { fontSize: 26, fontWeight: 'bold', marginTop: 3 },
  resultUnit: { fontSize: 14, fontWeight: 'normal' },
  referenceBox: { padding: 15, borderRadius: 8, marginTop: 10 },
  referenceTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  referenceText: { fontSize: 12, lineHeight: 18 },
  saveSection: { flexDirection: 'row', marginTop: 20, gap: 10 },
  nameInput: { flex: 1, padding: 12, borderRadius: 8 },
  saveBtn: { padding: 12, borderRadius: 8, justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '600' },
  exportBtn: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, borderWidth: 2 },
  exportBtnText: { fontWeight: '600', fontSize: 16 },
  sourceBox: { padding: 15, borderRadius: 8, marginTop: 20 },
  sourceTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  sourceText: { fontSize: 12, lineHeight: 18 },
});
