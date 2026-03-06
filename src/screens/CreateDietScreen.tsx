import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Modal, FlatList } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useDietStore, ANIMAL_TYPES, DietItem, IngredientInclusionWarning } from '../store/dietStore';
import { useShallow } from 'zustand/react/shallow';
import { ingredients, CATEGORIES, getIngredientById } from '../data/ingredients';
import { getTotalPercentage, calculateDiet, validateDiet, getComplianceStatus } from '../engine/calculations';
import { getTemplatesByAnimalType } from '../data/templates';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'CreateDiet'> };

// --- Extracted Components ---

interface IngredientRowProps {
  item: DietItem;
  inclusionWarning: IngredientInclusionWarning | undefined;
  percentageDraft: string | undefined;
  colors: {
    bg: string; card: string; text: string; textSecondary: string;
    accent: string; warning: string; error: string; success: string;
  };
  onPercentageChange: (id: string, value: string) => void;
  onRemove: (id: string) => void;
}

const IngredientRow = React.memo(function IngredientRow({
  item, inclusionWarning, percentageDraft, colors, onPercentageChange, onRemove,
}: IngredientRowProps): React.JSX.Element {
  const ingredient = getIngredientById(item.id);
  const limits = ingredient?.inclusionLimits;
  const hasInclusionWarning = Boolean(inclusionWarning);

  const rangeText = limits
    ? `${limits.minPct ?? 0}% - ${limits.maxPct ?? 100}%`
    : null;

  const warningText = inclusionWarning
    ? inclusionWarning.reason === 'below-min'
      ? `Debajo del minimo (${inclusionWarning.limitPct}%)`
      : `Encima del maximo (${inclusionWarning.limitPct}%)`
    : null;

  return (
    <View
      style={[
        styles.dietItem,
        { backgroundColor: colors.card },
        hasInclusionWarning && {
          borderWidth: 1,
          borderColor: inclusionWarning?.reason === 'below-min' ? colors.warning : colors.error,
        },
      ]}
    >
      <View style={styles.dietItemInfo}>
        <Text style={[styles.dietItemName, { color: colors.text }]}>{item.name}</Text>
        {rangeText && (
          <Text style={[styles.limitHint, { color: colors.textSecondary }]}>Rango recomendado: {rangeText}</Text>
        )}
        {warningText && (
          <Text
            style={[
              styles.limitWarning,
              {
                color: inclusionWarning?.reason === 'below-min' ? colors.warning : colors.error,
              },
            ]}
          >
            {warningText}
          </Text>
        )}
      </View>
      <TextInput
        style={[styles.pctInput, { backgroundColor: colors.bg, color: colors.text }]}
        value={percentageDraft ?? item.pct.toString()}
        keyboardType="decimal-pad"
        onChangeText={(text) => onPercentageChange(item.id, text)}
      />
      <Text style={[styles.pctSign, { color: colors.textSecondary }]}>%</Text>
      <TouchableOpacity onPress={() => onRemove(item.id)}>
        <Text style={[styles.removeBtn, { color: colors.error }]}>✕</Text>
      </TouchableOpacity>
    </View>
  );
});

// --- Pure utility functions ---

function parseDecimalInput(value: string): number | null {
  const normalized = value.replace(',', '.').trim();

  if (!normalized || normalized.endsWith('.')) {
    return null;
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

// --- Main Component ---

export default function CreateDietScreen({ navigation }: Props): React.JSX.Element {
  const [showModal, setShowModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [percentageDrafts, setPercentageDrafts] = useState<Record<string, string>>({});
  
  const { 
    currentDiet, addIngredient, updatePercentage, removeIngredient, clearDiet, 
    animalType, darkMode, loadFromStorage, setFullDiet
  } = useDietStore(useShallow((s) => ({ currentDiet: s.currentDiet, addIngredient: s.addIngredient, updatePercentage: s.updatePercentage, removeIngredient: s.removeIngredient, clearDiet: s.clearDiet, animalType: s.animalType, darkMode: s.darkMode, loadFromStorage: s.loadFromStorage, setFullDiet: s.setFullDiet })));
  
  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    setPercentageDrafts((prev) => {
      const next: Record<string, string> = {};

      currentDiet.forEach((item) => {
        next[item.id] = Object.prototype.hasOwnProperty.call(prev, item.id)
          ? prev[item.id]
          : item.pct.toString();
      });

      const prevKeys = Object.keys(prev);
      const nextKeys = Object.keys(next);
      const hasChanged =
        prevKeys.length !== nextKeys.length ||
        nextKeys.some((key) => prev[key] !== next[key]);

      return hasChanged ? next : prev;
    });
  }, [currentDiet]);

  const handlePercentageChange = useCallback((id: string, value: string) => {
    setPercentageDrafts((prev) => ({ ...prev, [id]: value }));

    if (!value.trim()) {
      updatePercentage(id, 0);
      return;
    }

    const parsed = parseDecimalInput(value);
    if (parsed !== null) {
      updatePercentage(id, parsed);
    }
  }, [updatePercentage]);

  const totalPct = getTotalPercentage(currentDiet);
  const filteredIngredients = useMemo(() => ingredients.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchCategory = !selectedCategory || i.category === selectedCategory;
    return matchSearch && matchCategory;
  }), [search, selectedCategory]);

  const dietResults = useMemo(() => calculateDiet(currentDiet), [currentDiet]);
  const validation = useMemo(() => validateDiet(currentDiet, animalType, dietResults), [currentDiet, animalType, dietResults]);
  const compliance = useMemo(() => getComplianceStatus(currentDiet, animalType, dietResults), [currentDiet, animalType, dietResults]);
  const inclusionWarningByIngredient = useMemo(() => validation.warningDetails.reduce((acc, warning) => {
    acc[warning.ingredientId] = warning;
    return acc;
  }, {} as Record<string, (typeof validation.warningDetails)[number]>), [validation]);

  const colors = useMemo(() => darkMode ? {
    bg: '#121212', card: '#1E1E1E', text: '#FFF', textSecondary: '#AAA', accent: '#4CAF50',
    warning: '#FFA000', error: '#f44336', success: '#4CAF50'
  } : {
    bg: '#f5f5f5', card: '#FFF', text: '#333', textSecondary: '#666', accent: '#4CAF50',
    warning: '#FFA000', error: '#f44336', success: '#4CAF50'
  }, [darkMode]);

  const handleCalculate = useCallback(() => {
    if (currentDiet.length === 0) {
      alert('Agregá al menos un ingrediente');
      return;
    }
    navigation.navigate('DietResult');
  }, [currentDiet.length, navigation]);

  const handleClear = useCallback(() => {
    if (currentDiet.length === 0) return;
    if (confirm('¿Borrar la dieta actual?')) {
      clearDiet();
    }
  }, [currentDiet.length, clearDiet]);

  const getComplianceColor = useCallback((status: string) => {
    switch (status) {
      case 'green': return colors.success;
      case 'yellow': return colors.warning;
      case 'red': return colors.error;
      default: return colors.textSecondary;
    }
  }, [colors]);

  const renderIngredientOption = useCallback(({ item }: { item: typeof ingredients[number] }) => (
    <TouchableOpacity
      style={[styles.ingredientOption, { borderBottomColor: colors.bg }]}
      onPress={() => { addIngredient(item); setShowModal(false); setSearch(''); }}
    >
      <View>
        <Text style={[styles.ingredientOptionText, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.ingredientOptionCategory, { color: colors.textSecondary }]}>{item.category}</Text>
      </View>
      <Text style={[styles.ingredientOptionNe, { color: colors.accent }]}>NE: {item.ne}</Text>
    </TouchableOpacity>
  ), [colors, addIngredient]);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Agregar Ingrediente</Text>
            
            <TextInput
              style={[styles.searchInput, { backgroundColor: colors.bg, color: colors.text }]}
              placeholder="Buscar..."
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
              <TouchableOpacity 
                style={[styles.categoryBtn, !selectedCategory && styles.categoryBtnActive]} 
                onPress={() => setSelectedCategory(null)}
              >
                <Text style={[styles.categoryBtnText, { color: !selectedCategory ? colors.accent : colors.textSecondary }]}>Todos</Text>
              </TouchableOpacity>
              {CATEGORIES.map(cat => (
                <TouchableOpacity 
                  key={cat} 
                  style={[styles.categoryBtn, selectedCategory === cat && styles.categoryBtnActive]}
                  onPress={() => setSelectedCategory(cat)}
                >
                  <Text style={[styles.categoryBtnText, { color: selectedCategory === cat ? colors.accent : colors.textSecondary }]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <FlatList
              data={filteredIngredients}
              keyExtractor={(item) => item.id}
              style={styles.ingredientList}
              renderItem={renderIngredientOption}
            />
            <TouchableOpacity style={[styles.closeModalBtn, { backgroundColor: colors.accent }]} onPress={() => { setShowModal(false); setSearch(''); }}>
              <Text style={styles.closeModalBtnText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
        </Modal>

        {/* Template Selection Modal */}
        <Modal visible={showTemplateModal} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Seleccionar Plantilla</Text>
              <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                Plantillas disponibles para {ANIMAL_TYPES[animalType].label}
              </Text>
              
              <FlatList
                data={getTemplatesByAnimalType(animalType)}
                keyExtractor={(item) => item.id}
                style={styles.templateList}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.templateOption, { borderBottomColor: colors.bg }]}
                    onPress={() => {
                      setFullDiet(item.items);
                      setShowTemplateModal(false);
                    }}
                  >
                    <View>
                      <Text style={[styles.templateName, { color: colors.text }]}>{item.name}</Text>
                      <Text style={[styles.templateDesc, { color: colors.textSecondary }]}>{item.description}</Text>
                      <Text style={[styles.templateItems, { color: colors.accent }]}>{item.items.length} ingredientes</Text>
                    </View>
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                    No hay plantillas para este tipo de animal
                  </Text>
                }
              />
              <TouchableOpacity 
                style={[styles.closeModalBtn, { backgroundColor: colors.error }]} 
                onPress={() => setShowTemplateModal(false)}
              >
                <Text style={styles.closeModalBtnText}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

      {/* Compliance Indicators */}
      {currentDiet.length > 0 && (
        <View style={[styles.complianceBar, { backgroundColor: colors.card }]}>
          <Text style={[styles.complianceTitle, { color: colors.text }]}>Cumplimiento - {ANIMAL_TYPES[animalType].label}</Text>
          <View style={styles.complianceItems}>
            <View style={styles.complianceItem}>
              <View style={[styles.complianceDot, { backgroundColor: getComplianceColor(compliance.ne) }]} />
              <Text style={[styles.complianceLabel, { color: colors.textSecondary }]}>NE</Text>
            </View>
            <View style={styles.complianceItem}>
              <View style={[styles.complianceDot, { backgroundColor: getComplianceColor(compliance.lys) }]} />
              <Text style={[styles.complianceLabel, { color: colors.textSecondary }]}>Lys</Text>
            </View>
            <View style={styles.complianceItem}>
              <View style={[styles.complianceDot, { backgroundColor: getComplianceColor(compliance.p) }]} />
              <Text style={[styles.complianceLabel, { color: colors.textSecondary }]}>P</Text>
            </View>
          </View>
        </View>
      )}

      <View style={[styles.statsBar, { backgroundColor: colors.card }]}>
        <Text style={[styles.statsBarText, { color: colors.accent }]}>Total: {totalPct.toFixed(1)}%</Text>
        <Text style={[styles.statsBarText, { color: colors.textSecondary }]}>Ingredientes: {currentDiet.length}</Text>
      </View>

      <TouchableOpacity 
        style={[styles.templateBtn, { backgroundColor: colors.card }]} 
        onPress={() => setShowTemplateModal(true)}
      >
        <Text style={[styles.templateBtnText, { color: colors.accent }]}>📋 Usar Plantilla</Text>
      </TouchableOpacity>

      <ScrollView style={styles.content}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Ingredientes</Text>
        {currentDiet.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Tocá "+ Agregar" para comenzar</Text>
        ) : (
          currentDiet.map((item) => (
            <IngredientRow
              key={item.id}
              item={item}
              inclusionWarning={inclusionWarningByIngredient[item.id]}
              percentageDraft={percentageDrafts[item.id]}
              colors={colors}
              onPercentageChange={handlePercentageChange}
              onRemove={removeIngredient}
            />
          ))
        )}

        <TouchableOpacity style={[styles.addMainBtn, { backgroundColor: colors.card }]} onPress={() => setShowModal(true)}>
          <Text style={[styles.addMainBtnText, { color: colors.accent }]}>+ Agregar Ingrediente</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.calcBtn, { backgroundColor: colors.accent }]} onPress={handleCalculate}>
          <Text style={styles.calcBtnText}>Calcular Resultados</Text>
        </TouchableOpacity>

        {currentDiet.length > 0 && (
          <TouchableOpacity style={[styles.clearBtn, { backgroundColor: colors.card, borderColor: colors.error }]} onPress={handleClear}>
            <Text style={[styles.clearBtnText, { color: colors.error }]}>Limpiar Dieta</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  statsBar: { flexDirection: 'row', justifyContent: 'space-between', padding: 12 },
  statsBarText: { fontSize: 14, fontWeight: '600' },
  templateBtn: { marginHorizontal: 15, marginTop: 8, padding: 10, borderRadius: 8, alignItems: 'center' },
  templateBtnText: { fontSize: 14, fontWeight: '600' },
  complianceBar: { padding: 10, margin: 15, marginBottom: 0, borderRadius: 8 },
  complianceTitle: { fontSize: 12, fontWeight: '600', marginBottom: 8 },
  complianceItems: { flexDirection: 'row', gap: 20 },
  complianceItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  complianceDot: { width: 10, height: 10, borderRadius: 5 },
  complianceLabel: { fontSize: 12 },
  content: { flex: 1, padding: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  emptyText: { fontStyle: 'italic', textAlign: 'center', padding: 20 },
  dietItem: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, marginBottom: 8 },
  dietItemInfo: { flex: 1, marginRight: 8 },
  dietItemName: { fontSize: 14, fontWeight: '600' },
  limitHint: { fontSize: 11, marginTop: 2 },
  limitWarning: { fontSize: 11, marginTop: 2, fontWeight: '600' },
  pctInput: { width: 55, borderRadius: 5, padding: 6, textAlign: 'center', marginRight: 5 },
  pctSign: { marginRight: 12 },
  removeBtn: { fontSize: 18, padding: 5 },
  addMainBtn: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  addMainBtnText: { fontWeight: '600', fontSize: 16 },
  calcBtn: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  calcBtnText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  clearBtn: { padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15, borderWidth: 1 },
  clearBtnText: { fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  searchInput: { borderRadius: 8, padding: 10, marginBottom: 15 },
  categoryRow: { marginBottom: 15, maxHeight: 40 },
  categoryBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, marginRight: 8 },
  categoryBtnActive: { backgroundColor: '#E8F5E9' },
  categoryBtnText: { fontSize: 12, fontWeight: '600' },
  ingredientList: { maxHeight: 300 },
  ingredientOption: { flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1 },
  ingredientOptionText: { fontSize: 15, fontWeight: '600' },
  ingredientOptionCategory: { fontSize: 12, marginTop: 2 },
  ingredientOptionNe: { fontSize: 13 },
  modalSubtitle: { fontSize: 14, textAlign: 'center', marginBottom: 15 },
  templateList: { maxHeight: 350 },
  templateOption: { padding: 15, borderBottomWidth: 1 },
  templateName: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  templateDesc: { fontSize: 13, marginBottom: 4 },
  templateItems: { fontSize: 12 },
  closeModalBtn: { padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  closeModalBtnText: { color: '#fff', fontWeight: '600' },
});
