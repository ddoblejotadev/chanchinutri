import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Dimensions } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useDietStore, ANIMAL_TYPES } from '../store/dietStore';
import { useAuthStore } from '../store/authStore';
import { useShallow } from 'zustand/react/shallow';
import { calculateDiet, validateDiet, getComplianceStatus } from '../engine/calculations';
import { exportDietToPDF } from '../utils/pdfExport';
import { calculateDietCost, calculateCostPerTonne } from '../data/prices';

type ThemeColors = {
  bg: string;
  card: string;
  text: string;
  textSecondary: string;
  accent: string;
  warning: string;
  error: string;
  success: string;
};

type ComplianceItemProps = {
  label: string;
  value: number;
  target: string;
  unit: string;
  status: string;
  colors: ThemeColors;
  getComplianceColor: (status: string) => string;
};

type ValueCardProps = {
  label: string;
  value: number;
  unit: string;
  colors: ThemeColors;
};

type ResultCardProps = {
  label: string;
  value: number;
  unit: string;
  status?: string;
  colors: ThemeColors;
  getComplianceColor: (status: string) => string;
};

// --- Extracted Components ---

const ComplianceItem = React.memo(function ComplianceItem({ label, value, target, unit, status, colors, getComplianceColor }: ComplianceItemProps): React.JSX.Element {
  const statusColor = getComplianceColor(status);
  return (
    <View style={styles.complianceItem}>
      <Text style={[styles.complianceLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.complianceValue, { color: statusColor }]}>{value} {unit}</Text>
      <Text style={[styles.complianceTarget, { color: colors.textSecondary }]}>Objetivo: {target}</Text>
    </View>
  );
});

const ValueCard = React.memo(function ValueCard({ label, value, unit, colors }: ValueCardProps): React.JSX.Element {
  return (
    <View style={[styles.valueCard, { backgroundColor: colors.card }]}>
      <Text style={[styles.valueLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.valueText, { color: colors.text }]}>{value} {unit}</Text>
    </View>
  );
});

const ResultCard = React.memo(function ResultCard({ label, value, unit, status, colors, getComplianceColor }: ResultCardProps): React.JSX.Element {
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
});

// --- Module-scope constants ---

const chartColors = ['#4CAF50', '#2196F3', '#FF9800', '#9C27B0', '#F44336'];

const chartConfig = {
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
};

// --- Main Component ---

export default function DietResultScreen(): React.JSX.Element {
  const [dietName, setDietName] = useState('');
  const [budget, setBudget] = useState('');
  const { currentDiet, savedDiets, saveDiet, clearDiet, animalType, darkMode, loadDiet, updatePrice } = useDietStore(useShallow((s) => ({ currentDiet: s.currentDiet, savedDiets: s.savedDiets, saveDiet: s.saveDiet, clearDiet: s.clearDiet, animalType: s.animalType, darkMode: s.darkMode, loadDiet: s.loadDiet, updatePrice: s.updatePrice })));

  const parseLocalizedDecimal = (value: string): number | null => {
    const normalized = value.replace(',', '.').trim();
    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  };
  
  const results = useMemo(() => calculateDiet(currentDiet), [currentDiet]);
  const validation = useMemo(() => validateDiet(currentDiet, animalType, results), [currentDiet, animalType, results]);
  const compliance = useMemo(() => getComplianceStatus(currentDiet, animalType, results), [currentDiet, animalType, results]);
  const requirements = ANIMAL_TYPES[animalType].requirements;
  
  // Cost calculation
  const costPerKg = calculateDietCost(currentDiet);
  const costPerTonne = calculateCostPerTonne(currentDiet);
  
  // Budget comparison
  const budgetValue = parseLocalizedDecimal(budget) ?? 0;
  const isOverBudget = budgetValue > 0 && costPerKg > budgetValue;
  const budgetDiff = budgetValue > 0 ? costPerKg - budgetValue : 0;
  const inclusionWarnings = validation.warningDetails;
  const nutritionWarnings = validation.warnings.filter((warning) => !warning.startsWith('Inclusion '));

  const colors = useMemo(() => darkMode ? {
    bg: '#121212', card: '#1E1E1E', text: '#FFF', textSecondary: '#AAA', accent: '#4CAF50',
    warning: '#FFA000', error: '#f44336', success: '#4CAF50'
  } : {
    bg: '#f5f5f5', card: '#FFF', text: '#333', textSecondary: '#666', accent: '#4CAF50',
    warning: '#FFA000', error: '#f44336', success: '#4CAF50'
  }, [darkMode]);

  // Chart data - top 5 ingredients by percentage
  const chartData = useMemo(() => [...currentDiet]
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 5)
    .map((item, index) => {
      return {
        name: item.name.length > 10 ? item.name.substring(0, 10) + '...' : item.name,
        population: item.pct,
        color: chartColors[index % chartColors.length],
        legendFontColor: colors.textSecondary,
        legendFontSize: 12,
      };
    }), [currentDiet, colors.textSecondary]);

  const screenWidth = Dimensions.get('window').width;

  const getComplianceColor = useCallback((status: string) => {
    switch (status) {
      case 'green': return colors.success;
      case 'yellow': return colors.warning;
      case 'red': return colors.error;
      default: return colors.textSecondary;
    }
  }, [colors]);

  // Helper components for simplified display have been extracted to module scope

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const handleSave = async () => {
    if (!dietName.trim()) {
      Alert.alert('Error', 'Ingresá un nombre para la dieta');
      return;
    }

    const user = useAuthStore.getState().user;
    if (!user) {
      Alert.alert(
        'Cuenta requerida',
        'Para guardar dietas necesitás una cuenta. ¿Querés crear una?',
        [
          { text: 'Ahora no', style: 'cancel' },
          { text: 'Crear cuenta', onPress: () => navigation.navigate('Register') },
          { text: 'Iniciar sesión', onPress: () => navigation.navigate('Login') },
        ]
      );
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

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.accent }]}>
        <Text style={styles.headerTitle}>Resultados del Análisis</Text>
        <Text style={styles.headerSubtitle}>{ANIMAL_TYPES[animalType].label}</Text>
      </View>

      {/* Warnings */}
      {(validation.warnings.length > 0 || inclusionWarnings.length > 0) && (
        <View style={[styles.warningBox, { backgroundColor: colors.warning + '20' }]}>
          <Text style={[styles.warningTitle, { color: colors.warning }]}>⚠️ Recomendaciones:</Text>
          {inclusionWarnings.length > 0 && (
            <>
              <Text style={[styles.warningSectionTitle, { color: colors.text }]}>Límites de inclusión</Text>
              {inclusionWarnings.map((warning) => {
                const direction = warning.reason === 'below-min' ? 'por debajo' : 'por encima';
                return (
                  <Text key={`${warning.ingredientId}-${warning.reason}`} style={[styles.warningText, { color: colors.textSecondary }]}>
                    • {warning.ingredientName}: {warning.actualPct}% {direction} de {warning.limitPct}%
                  </Text>
                );
              })}
            </>
          )}
          {nutritionWarnings.length > 0 && (
            <>
              <Text style={[styles.warningSectionTitle, { color: colors.text }]}>Balance nutricional</Text>
              {nutritionWarnings.map((w, i) => (
                <Text key={i} style={[styles.warningText, { color: colors.textSecondary }]}>• {w}</Text>
              ))}
            </>
          )}
        </View>
      )}
      
      <View style={styles.content}>
        {/* 🎯 COST AND BUDGET - MOST IMPORTANT */}
        <View style={[styles.costCard, { 
          backgroundColor: isOverBudget ? '#ffebee' : colors.accent + '20', 
          borderColor: isOverBudget ? '#f44336' : colors.accent 
        }]}>
          <Text style={[styles.costCardTitle, { color: colors.text }]}>💰 Costo por kg</Text>
          <Text style={[styles.costCardValue, { color: isOverBudget ? '#f44336' : colors.accent }]}>
            ${Math.round(costPerKg).toLocaleString('es-CL')} CLP
          </Text>
          <Text style={[styles.costCardSub, { color: colors.textSecondary }]}>
            ${Math.round(costPerTonne).toLocaleString('es-CL')} CLP/tonelada
          </Text>
          
          {/* Budget Input */}
          <View style={styles.budgetRow}>
            <Text style={[styles.budgetLabel, { color: colors.textSecondary }]}>🎯 Mi presupuesto:</Text>
            <View style={styles.budgetInputWrap}>
              <Text style={[styles.budgetCurrency, { color: colors.textSecondary }]}>$</Text>
              <TextInput
                style={[styles.budgetInput, { backgroundColor: colors.card, color: colors.text }]}
                value={budget}
                onChangeText={setBudget}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={[styles.budgetUnit, { color: colors.textSecondary }]}>CLP/kg</Text>
            </View>
          </View>
          
          {budgetValue > 0 && (
            <View style={[styles.budgetResult, { backgroundColor: isOverBudget ? '#f44336' : '#4CAF50' }]}>
              <Text style={styles.budgetResultText}>
                {isOverBudget 
                  ? `⚠️ Excede en $${Math.round(budgetDiff).toLocaleString('es-CL')}` 
                  : `✅ Dentro del presupuesto`}
              </Text>
            </View>
          )}
        </View>

        {/* ✅ NUTRITIONAL COMPLIANCE - SECOND PRIORITY */}
        <View style={[styles.complianceCard, { backgroundColor: colors.card }]}>
          <Text style={[styles.complianceTitle, { color: colors.text }]}>✅ Cumplimiento Nutricional</Text>
          <View style={styles.complianceGrid}>
            <ComplianceItem label="Energía Neta" value={results.ne} target={`${requirements.ne.min}-${requirements.ne.max}`} unit="kcal/kg" status={compliance.ne} colors={colors} getComplianceColor={getComplianceColor} />
            <ComplianceItem label="Lisina" value={results.lys} target={`${requirements.lys.min}-${requirements.lys.max}`} unit="g/kg" status={compliance.lys} colors={colors} getComplianceColor={getComplianceColor} />
            <ComplianceItem label="Fósforo" value={results.p} target={`${requirements.p.min}-${requirements.p.max}`} unit="g/kg" status={compliance.p} colors={colors} getComplianceColor={getComplianceColor} />
          </View>
        </View>

        {/* 📊 ADDITIONAL NUTRITIONAL VALUES */}
        <Text style={[styles.sectionTitle, { color: colors.text, marginTop: 15 }]}>📈 Valores Nutricionales</Text>
        <View style={styles.valuesRow}>
          <ValueCard label="Metionina" value={results.met} unit="g/kg" colors={colors} />
          <ValueCard label="Treonina" value={results.thr} unit="g/kg" colors={colors} />
          <ValueCard label="Materia Seca" value={results.dm} unit="%" colors={colors} />
        </View>

        {/* Pie Chart */}
        {chartData.length > 0 && (
          <View style={[styles.chartBox, { backgroundColor: colors.card, marginTop: 15 }]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>📊 Distribución</Text>
            <PieChart
              data={chartData}
              width={screenWidth - 50}
              height={160}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute={false}
            />
          </View>
        )}

        {/* Save Section */}
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
  warningSectionTitle: { fontSize: 12, fontWeight: '700', marginTop: 4, marginBottom: 4 },
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
  costBox: { padding: 15, borderRadius: 8, marginTop: 10, borderWidth: 1 },
  costTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  costRow: { flexDirection: 'row', justifyContent: 'space-around' },
  costItem: { alignItems: 'center' },
  costLabel: { fontSize: 12, marginBottom: 4 },
  costValue: { fontSize: 22, fontWeight: 'bold' },
  budgetCompare: { marginTop: 12, padding: 10, borderRadius: 6 },
  budgetCompareText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
  budgetBox: { padding: 15, borderRadius: 8, marginTop: 10 },
  budgetTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  budgetSubtitle: { fontSize: 12, marginBottom: 12 },
  budgetInputRow: { flexDirection: 'row', alignItems: 'center' },
  budgetCurrency: { fontSize: 16, marginRight: 4 },
  budgetUnit: { fontSize: 14, marginLeft: 8 },
  chartBox: { padding: 15, borderRadius: 8, marginTop: 10, alignItems: 'center' },
  chartTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  saveSection: { flexDirection: 'row', marginTop: 20, gap: 10 },
  nameInput: { flex: 1, padding: 12, borderRadius: 8 },
  saveBtn: { padding: 12, borderRadius: 8, justifyContent: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '600' },
  exportBtn: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, borderWidth: 2 },
  exportBtnText: { fontWeight: '600', fontSize: 16 },
  sourceBox: { padding: 15, borderRadius: 8, marginTop: 20 },
  sourceTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  sourceText: { fontSize: 12, lineHeight: 18 },
  // New simplified styles
  costCard: { padding: 20, borderRadius: 16, borderWidth: 2, marginBottom: 15 },
  costCardTitle: { fontSize: 16, fontWeight: '600', marginBottom: 8 },
  costCardValue: { fontSize: 36, fontWeight: 'bold' },
  costCardSub: { fontSize: 14, marginTop: 4 },
  budgetRow: { marginTop: 15 },
  budgetLabel: { fontSize: 14, marginBottom: 8 },
  budgetInputWrap: { flexDirection: 'row', alignItems: 'center' },
  budgetInput: { flex: 1, padding: 10, borderRadius: 8, fontSize: 16 },
  budgetResult: { marginTop: 12, padding: 10, borderRadius: 8 },
  budgetResultText: { color: '#fff', fontWeight: '600', textAlign: 'center' },
  complianceCard: { padding: 15, borderRadius: 12, marginBottom: 15 },
  complianceTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  complianceGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  complianceItem: { flex: 1, alignItems: 'center' },
  complianceLabel: { fontSize: 12, marginBottom: 4 },
  complianceValue: { fontSize: 18, fontWeight: 'bold' },
  complianceTarget: { fontSize: 10, marginTop: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  valuesRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  valueCard: { flex: 1, padding: 12, borderRadius: 8, alignItems: 'center' },
  valueLabel: { fontSize: 11, marginBottom: 4 },
  valueText: { fontSize: 14, fontWeight: 'bold' },
});
