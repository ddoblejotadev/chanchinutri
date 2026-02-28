import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useDietStore, ANIMAL_TYPES } from '../store/dietStore';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Home'> };

export default function HomeScreen({ navigation }: Props) {
  const { darkMode, toggleDarkMode, animalType, setAnimalType } = useDietStore();

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

        {/* Animal Type Selector */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Tipo de Animal</Text>
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

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: colors.accent }]} 
          onPress={() => navigation.navigate('CreateDiet')}
        >
          <Text style={styles.buttonText}>Crear Nueva Dieta</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.buttonSecondary, { backgroundColor: colors.card, borderColor: colors.accent }]} 
          onPress={() => navigation.navigate('SavedDiets')}
        >
          <Text style={[styles.buttonTextSecondary, { color: colors.accent }]}>Dietas Guardadas</Text>
        </TouchableOpacity>

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
  statsBox: { padding: 20, borderRadius: 10, marginTop: 10, alignItems: 'center' },
  statsTitle: { fontSize: 14, fontWeight: '600' },
  statsNumber: { fontSize: 36, fontWeight: 'bold', marginVertical: 5 },
  statsLabel: { fontSize: 12, textAlign: 'center' },
});
