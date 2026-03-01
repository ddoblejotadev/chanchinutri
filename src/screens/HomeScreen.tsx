import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../navigation/AppNavigation';
import { useDietStore, ANIMAL_TYPES } from '../store/dietStore';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = { navigation: HomeScreenNavigationProp };

export default function HomeScreen({ navigation }: Props) {
  const { darkMode, toggleDarkMode, animalType, setAnimalType, syncEnabled, toggleSync, isSyncing, lastSynced, syncToCloud, savedDiets } = useDietStore();

  const colors = darkMode ? {
    bg: '#121212',
    card: '#1E1E1E',
    text: '#FFF',
    textSecondary: '#AAA',
    accent: '#4CAF50',
  } : {
    bg: '#f5f5f5',
    card: '#FFF',
    text: '#333',
    textSecondary: '#666',
    accent: '#4CAF50',
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { backgroundColor: colors.accent }]}>
        <Text style={styles.title}>EvaPig®</Text>
        <Text style={styles.subtitle}>Evaluación de piensos</Text>
      </View>

      <View style={[styles.content, { backgroundColor: colors.bg }]}>
        {/* Dark Mode Toggle */}
        <View style={[styles.darkModeRow, { backgroundColor: colors.card }]}>
          <Text style={[styles.darkModeLabel, { color: colors.text }]}>Modo Oscuro</Text>
          <Switch
            value={darkMode}
            onValueChange={toggleDarkMode}
            trackColor={{ false: '#767577', true: '#4CAF50' }}
            thumbColor={darkMode ? '#fff' : '#f4f3f4'}
          />
        </View>

        {/* Cloud Sync Toggle - Default ON */}
        <View style={[styles.darkModeRow, { backgroundColor: colors.card }]}>
          <View style={styles.syncToggleContainer}>
            <Text style={[styles.darkModeLabel, { color: colors.text }]}>☁️ Sincronización automática</Text>
            <Text style={[styles.darkModeSub, { color: colors.textSecondary }]}>
              Tus dietas se guardan en la nube y se protegen contra pérdida del dispositivo
            </Text>
          </View>
          <Switch
            value={syncEnabled}
            onValueChange={toggleSync}
            trackColor={{ false: '#767577', true: '#4CAF50' }}
            thumbColor={syncEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>

        {/* Sync Now Button */}
        {syncEnabled && (
          <TouchableOpacity 
            style={[styles.syncCard, { backgroundColor: colors.accent + '15' }]}
            onPress={syncToCloud}
            disabled={isSyncing}
          >
            <View style={styles.syncCardContent}>
              <Text style={styles.syncIcon}>🔄</Text>
              <View style={styles.syncTextContainer}>
                <Text style={[styles.syncTitle, { color: colors.text }]}>
                  {isSyncing ? 'Sincronizando...' : 'Sincronizar ahora'}
                </Text>
                <Text style={[styles.syncSubtitle, { color: colors.textSecondary }]}>
                  {savedDiets.length} dieta{savedDiets.length !== 1 ? 's' : ''} guardada{savedDiets.length !== 1 ? 's' : ''} • Toca para actualizar
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Animal Type Selector */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>🐷 Tipo de Animal</Text>
          <View style={styles.animalTypes}>
            {Object.entries(ANIMAL_TYPES).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.animalTypeBtn,
                  animalType === key && styles.animalTypeBtnActive,
                  { borderColor: colors.accent }
                ]}
                onPress={() => setAnimalType(key as any)}
              >
                <Text style={[
                  styles.animalTypeText,
                  { color: animalType === key ? colors.accent : colors.textSecondary }
                ]}>
                  {value.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Big Create Button */}
        <TouchableOpacity 
          style={[styles.bigButton, { backgroundColor: colors.accent }]} 
          onPress={() => navigation.navigate('CreateDiet')}
        >
          <Text style={styles.bigButtonIcon}>➕</Text>
          <Text style={styles.bigButtonText}>Crear Nueva Dieta</Text>
          <Text style={styles.bigButtonSubtext}>para {ANIMAL_TYPES[animalType].label}</Text>
        </TouchableOpacity>

        {/* Quick Stats */}
        <View style={[styles.statsRow, { backgroundColor: colors.card }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.accent }]}>{savedDiets.length}</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>dietas</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.accent }]}>44</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>ingredientes</Text>
          </View>
        </View>

        <View style={[styles.infoBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.infoTitle, { color: colors.text }]}>Acerca de EvaPig</Text>
          <Text style={[styles.infoText, { color: colors.textSecondary }]}>
            Herramienta de evaluación nutricional para piensos de cerdos. 
            Calcula energía neta, aminoácidos digestibles y fósforo.
          </Text>
          <Text style={[styles.infoSource, { color: colors.textSecondary }]}>
            Basado en tablas INRAE-CIRAD-AFZ
          </Text>
        </View>

        <View style={[styles.statsBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.statsTitle, { color: colors.text }]}>Ingredientes disponibles</Text>
          <Text style={[styles.statsNumber, { color: colors.accent }]}>44</Text>
          <Text style={[styles.statsLabel, { color: colors.textSecondary }]}>
            Categorías: Cereales, Oleaginosas, Proteicos, Minerales, Aminoácidos
          </Text>
        </View>

        {/* Aviso Legal */}
        <View style={[styles.warningBox, { backgroundColor: '#FFF3E0', borderColor: '#FF9800' }]}>
          <Text style={[styles.warningTitle, { color: '#E65100' }]}>⚠️ Aviso Important</Text>
          <Text style={[styles.warningText, { color: '#666' }]}>
            Los valores nutricionales y precios mostrados son REFERENCIAS GENÉRICAS basadas en tablas públicas (INRAE-CIRAD-AFZ). 
            {'\n\n'}
            Para uso profesional, validá los datos con un nutricionista porcino y tus proveedores locales.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 30, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#e8f5e9', marginTop: 5 },
  content: { padding: 20 },
  darkModeRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, borderRadius: 10, marginBottom: 15 },
  darkModeLabel: { fontSize: 16, fontWeight: '600' },
  darkModeSub: { fontSize: 12, marginTop: 2 },
  syncToggleContainer: { flex: 1 },
  syncCard: { flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 10, marginBottom: 15, borderWidth: 1, borderColor: '#4CAF50' },
  syncCardContent: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  syncIcon: { fontSize: 24, marginRight: 12 },
  syncTextContainer: { flex: 1 },
  syncTitle: { fontSize: 15, fontWeight: '600' },
  syncSubtitle: { fontSize: 12, marginTop: 2 },
  section: { padding: 15, borderRadius: 10, marginBottom: 15 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  animalTypes: { gap: 8 },
  animalTypeBtn: { padding: 12, borderRadius: 8, borderWidth: 2, marginBottom: 8 },
  animalTypeBtnActive: { backgroundColor: '#E8F5E9' },
  animalTypeText: { fontSize: 14, fontWeight: '600' },
  button: { padding: 18, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  buttonSecondary: { padding: 18, borderRadius: 10, alignItems: 'center', marginBottom: 15, borderWidth: 2 },
  buttonTextSecondary: { fontSize: 18, fontWeight: '600' },
  infoBox: { padding: 20, borderRadius: 10, marginTop: 10 },
  infoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  infoText: { fontSize: 14, lineHeight: 20 },
  infoSource: { fontSize: 12, marginTop: 10, fontStyle: 'italic' },
  statsBox: { padding: 20, borderRadius: 10, marginTop: 15, alignItems: 'center' },
  statsTitle: { fontSize: 14, fontWeight: '600' },
  statsNumber: { fontSize: 36, fontWeight: 'bold', marginVertical: 5 },
  statsLabel: { fontSize: 12, textAlign: 'center' },
  warningBox: { padding: 15, borderRadius: 10, marginTop: 15, borderWidth: 1 },
  warningTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8 },
  warningText: { fontSize: 12, lineHeight: 18 },
  // New styles
  bigButton: { padding: 25, borderRadius: 16, alignItems: 'center', marginBottom: 15, elevation: 4 },
  bigButtonIcon: { fontSize: 32, marginBottom: 8 },
  bigButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  bigButtonSubtext: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  statsRow: { flexDirection: 'row', borderRadius: 12, padding: 20, marginBottom: 15 },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: '#ddd', marginVertical: 5 },
});
