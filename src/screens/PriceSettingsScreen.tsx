import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useDietStore } from '../store/dietStore';
import { useAuthStore } from '../store/authStore';
import { useShallow } from 'zustand/react/shallow';
import { defaultPrices, getIngredientPrice } from '../data/prices';
import { ingredients } from '../data/ingredients';

// Only show prices for ingredients that have a price
const ingredientsWithPrices = ingredients.filter(i => 
  defaultPrices.some(p => p.id === i.id)
);

export default function PriceSettingsScreen() {
  const { darkMode, updatePrice, resetPrices } = useDietStore(useShallow((s) => ({ darkMode: s.darkMode, updatePrice: s.updatePrice, resetPrices: s.resetPrices })));
  const { user, isAuthenticated, signOut } = useAuthStore(useShallow((s) => ({ user: s.user, isAuthenticated: s.isAuthenticated, signOut: s.signOut })));
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [prices, setPrices] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();

  const parseLocalizedDecimal = (value: string): number | null => {
    const normalized = value.replace(',', '.').trim();
    if (!normalized) {
      return null;
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  };

  useEffect(() => {
    // Load current prices
    const currentPrices: Record<string, string> = {};
    ingredientsWithPrices.forEach(ing => {
      currentPrices[ing.id] = getIngredientPrice(ing.id).toString();
    });
    setPrices(currentPrices);
  }, []);

  const handlePriceChange = (id: string, value: string) => {
    setPrices(prev => ({ ...prev, [id]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
      try {
        for (const [id, priceStr] of Object.entries(prices)) {
          const price = parseLocalizedDecimal(priceStr);
          if (price !== null && price >= 0) {
            await updatePrice(id, price);
          }
        }
      setHasChanges(false);
      Alert.alert('✅ Precios guardados', 'Los precios se han actualizado correctamente');
    } catch (error) {
      Alert.alert('❌ Error', 'No se pudieron guardar los precios');
    }
  };

  const handleReset = () => {
    Alert.alert(
      '🔄 Restablecer precios',
      '¿Querés volver a los precios por defecto?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Restablecer', 
          style: 'destructive',
          onPress: async () => {
            await resetPrices();
            const defaultVals: Record<string, string> = {};
            ingredientsWithPrices.forEach(ing => {
              const def = defaultPrices.find(p => p.id === ing.id);
              if (def) defaultVals[ing.id] = def.pricePerKg.toString();
            });
            setPrices(defaultVals);
            setHasChanges(false);
            Alert.alert('✅ Precios restablecidos');
          }
        },
      ]
    );
  };

  const colors = useMemo(() => darkMode ? {
    bg: '#121212', card: '#1E1E1E', text: '#FFF', textSecondary: '#AAA', accent: '#4CAF50',
  } : {
    bg: '#f5f5f5', card: '#FFF', text: '#333', textSecondary: '#666', accent: '#4CAF50',
  }, [darkMode]);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={[styles.scrollContent, { paddingBottom: tabBarHeight + 24 }]}
    >
      <View style={[styles.header, { backgroundColor: colors.accent }]}>
        <Text style={styles.headerTitle}>💰 Precios</Text>
        <Text style={styles.headerSubtitle}>Editá los precios de tu región</Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.infoBox, { backgroundColor: colors.accent + '20' }]}>
          <Text style={[styles.infoText, { color: colors.text }]}>
            📝 Ingresá el precio por kg de cada ingrediente en pesos chilenos (CLP). 
            Los precios por defecto son aproximados - ajustalos a los costos de tu proveedor local.
          </Text>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Ingredientes ({ingredientsWithPrices.length})
        </Text>

        {ingredientsWithPrices.map(ing => (
          <View key={ing.id} style={[styles.priceRow, { backgroundColor: colors.card }]}>
            <View style={styles.priceInfo}>
              <Text style={[styles.ingredientName, { color: colors.text }]}>{ing.name}</Text>
              <Text style={[styles.ingredientCategory, { color: colors.textSecondary }]}>{ing.category}</Text>
            </View>
            <View style={styles.priceInputContainer}>
              <Text style={[styles.currency, { color: colors.textSecondary }]}>$</Text>
              <TextInput
                style={[styles.priceInput, { backgroundColor: colors.bg, color: colors.text }]}
                value={prices[ing.id] || ''}
                onChangeText={(val) => handlePriceChange(ing.id, val)}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={[styles.unit, { color: colors.textSecondary }]}>CLP/kg</Text>
            </View>
          </View>
        ))}

        {hasChanges && (
          <TouchableOpacity style={[styles.saveBtn, { backgroundColor: colors.accent }]} onPress={handleSave}>
            <Text style={styles.saveBtnText}>Guardar Precios</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={[styles.resetBtn, { backgroundColor: colors.card, borderColor: colors.accent }]} onPress={handleReset}>
          <Text style={[styles.resetBtnText, { color: colors.accent }]}>Restablecer precios por defecto</Text>
        </TouchableOpacity>

        {/* Account Section */}
        <View style={[styles.accountSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.accountTitle, { color: colors.text }]}>Cuenta</Text>
          {isAuthenticated && user ? (
            <View>
              <Text style={[styles.accountEmail, { color: colors.textSecondary }]}>{user.email}</Text>
              <TouchableOpacity onPress={signOut}>
                <Text style={[styles.signOutLink, { color: colors.accent }]}>Cerrar sesión</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View>
              <Text style={[styles.accountHint, { color: colors.textSecondary }]}>
                Iniciá sesión para guardar y sincronizar tus dietas
              </Text>
              <View style={styles.accountButtons}>
                <TouchableOpacity
                  style={[styles.accountBtn, { backgroundColor: colors.accent }]}
                  onPress={() => navigation.navigate('Login')}
                >
                  <Text style={styles.accountBtnText}>Iniciar sesión</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.accountBtnOutline, { borderColor: colors.accent }]}
                  onPress={() => navigation.navigate('Register')}
                >
                  <Text style={[styles.accountBtnOutlineText, { color: colors.accent }]}>Crear cuenta</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 24 },
  header: { padding: 20, alignItems: 'center' },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  headerSubtitle: { fontSize: 14, color: '#E8F5E9', marginTop: 5 },
  content: { padding: 15 },
  infoBox: { padding: 15, borderRadius: 8, marginBottom: 15 },
  infoText: { fontSize: 14, lineHeight: 20 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderRadius: 8, marginBottom: 8 },
  priceInfo: { flex: 1 },
  ingredientName: { fontSize: 14, fontWeight: '600' },
  ingredientCategory: { fontSize: 12, marginTop: 2 },
  priceInputContainer: { flexDirection: 'row', alignItems: 'center' },
  currency: { fontSize: 14, marginRight: 4 },
  priceInput: { width: 70, padding: 8, borderRadius: 6, textAlign: 'right', fontSize: 14 },
  unit: { fontSize: 12, marginLeft: 4 },
  saveBtn: { padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 15 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  resetBtn: { padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10, borderWidth: 1 },
  resetBtnText: { fontSize: 14 },
  accountSection: { padding: 15, borderRadius: 8, marginTop: 20 },
  accountTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  accountEmail: { fontSize: 14, marginBottom: 8 },
  signOutLink: { fontSize: 14, fontWeight: '600', paddingVertical: 4 },
  accountHint: { fontSize: 13, lineHeight: 18, marginBottom: 12 },
  accountButtons: { flexDirection: 'row', gap: 10 },
  accountBtn: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8 },
  accountBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  accountBtnOutline: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 8, borderWidth: 1.5 },
  accountBtnOutlineText: { fontWeight: '600', fontSize: 14 },
});
