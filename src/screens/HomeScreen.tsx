import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';

type Props = { navigation: NativeStackNavigationProp<RootStackParamList, 'Home'> };

export default function HomeScreen({ navigation }: Props) {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>EvaPig®</Text>
        <Text style={styles.subtitle}>Evaluación de piensos para cerdos</Text>
      </View>
      <View style={styles.content}>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('CreateDiet')}>
          <Text style={styles.buttonText}>Crear Nueva Dieta</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonSecondary} onPress={() => navigation.navigate('SavedDiets')}>
          <Text style={styles.buttonTextSecondary}>Dietas Guardadas</Text>
        </TouchableOpacity>
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>Acerca de EvaPig</Text>
          <Text style={styles.infoText}>
            Herramienta de evaluación nutricional para piensos de cerdos. 
            Calcula energía neta, aminoácidos digestibles y fósforo.
          </Text>
          <Text style={styles.infoSource}>Basado en tablas INRAE-CIRAD-AFZ</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#4CAF50', padding: 30, alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#fff' },
  subtitle: { fontSize: 14, color: '#e8f5e9', marginTop: 5 },
  content: { padding: 20 },
  button: { backgroundColor: '#4CAF50', padding: 18, borderRadius: 10, alignItems: 'center', marginBottom: 15 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' },
  buttonSecondary: { backgroundColor: '#fff', padding: 18, borderRadius: 10, alignItems: 'center', marginBottom: 15, borderWidth: 2, borderColor: '#4CAF50' },
  buttonTextSecondary: { color: '#4CAF50', fontSize: 18, fontWeight: '600' },
  infoBox: { backgroundColor: '#fff', padding: 20, borderRadius: 10, marginTop: 20 },
  infoTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  infoText: { fontSize: 14, color: '#666', lineHeight: 20 },
  infoSource: { fontSize: 12, color: '#999', marginTop: 10, fontStyle: 'italic' },
});
