import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigation';
import { useAuthStore } from '../store/authStore';
import { useDietStore } from '../store/dietStore';
import { useShallow } from 'zustand/react/shallow';
import { isValidEmail } from '../lib/authValidation';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
  const { darkMode } = useDietStore(useShallow((s) => ({ darkMode: s.darkMode })));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const colors = useMemo(
    () =>
      darkMode
        ? {
            bg: '#121212',
            card: '#1E1E1E',
            text: '#FFF',
            textSecondary: '#AAA',
            accent: '#4CAF50',
            inputBg: '#2A2A2A',
            inputBorder: '#444',
            errorText: '#FF6B6B',
          }
        : {
            bg: '#f5f5f5',
            card: '#FFF',
            text: '#333',
            textSecondary: '#666',
            accent: '#4CAF50',
            inputBg: '#FFF',
            inputBorder: '#DDD',
            errorText: '#D32F2F',
          },
    [darkMode],
  );

  const handleSignIn = async () => {
    setErrorMsg(null);
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setErrorMsg('Completá email y contraseña');
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setErrorMsg('Ingresá un email valido (ejemplo: nombre@correo.com)');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await useAuthStore.getState().signIn(trimmedEmail, password);
      if (error) {
        setErrorMsg(error);
      } else {
        // Success — go back to previous screen
        if (navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.navigate('MainTabs');
        }
      }
    } catch {
      setErrorMsg('Error inesperado. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      Alert.alert(
        'Email requerido',
        'Ingresá tu email en el campo de arriba y luego tocá "Olvidaste tu contraseña".',
      );
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      Alert.alert('Email invalido', 'Ingresá un email valido (ejemplo: nombre@correo.com).');
      return;
    }

    const { error } = await useAuthStore.getState().resetPassword(trimmedEmail);
    if (error) {
      Alert.alert('Error', error);
    } else {
      Alert.alert(
        'Email enviado',
        'Si el email está registrado, vas a recibir instrucciones para restablecer tu contraseña.',
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header / Logo */}
        <View style={[styles.header, { backgroundColor: colors.accent }]}>
          <Text style={styles.logoPig}>🐷</Text>
          <Text style={styles.logoTitle}>ChanchiNutri</Text>
          <Text style={styles.logoSubtitle}>Iniciá sesión para sincronizar tus dietas</Text>
        </View>

        <View style={styles.formContainer}>
          {/* Error message */}
          {errorMsg && (
            <View style={[styles.errorBox, { backgroundColor: colors.errorText + '15' }]}>
              <Text style={[styles.errorText, { color: colors.errorText }]}>{errorMsg}</Text>
            </View>
          )}

          {/* Email */}
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            placeholder="tu@email.com"
            placeholderTextColor={colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            editable={!isLoading}
          />

          {/* Password */}
          <Text style={[styles.label, { color: colors.text }]}>Contraseña</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            placeholder="Tu contraseña"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="password"
            editable={!isLoading}
          />

          {/* Sign In button */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.accent }]}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Iniciar Sesión</Text>
            )}
          </TouchableOpacity>

          {/* Forgot password */}
          <TouchableOpacity onPress={handleResetPassword} disabled={isLoading}>
            <Text style={[styles.linkText, { color: colors.accent }]}>
              ¿Olvidaste tu contraseña?
            </Text>
          </TouchableOpacity>

          {/* Register link */}
          <TouchableOpacity
            onPress={() => navigation.replace('Register')}
            disabled={isLoading}
            style={styles.registerLink}
          >
            <Text style={[styles.linkTextSecondary, { color: colors.textSecondary }]}>
              ¿No tenés cuenta?{' '}
              <Text style={{ color: colors.accent, fontWeight: '600' }}>Registrate</Text>
            </Text>
          </TouchableOpacity>

          {/* Back to app */}
          <TouchableOpacity
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              } else {
                navigation.navigate('MainTabs');
              }
            }}
            style={styles.backLink}
          >
            <Text style={[styles.linkTextSecondary, { color: colors.textSecondary }]}>
              Volver sin iniciar sesión
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1 },
  header: {
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  logoPig: { fontSize: 48 },
  logoTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    marginTop: 8,
  },
  logoSubtitle: {
    fontSize: 14,
    color: '#E8F5E9',
    marginTop: 6,
  },
  formContainer: {
    padding: 24,
  },
  errorBox: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
  },
  primaryButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 20,
  },
  registerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkTextSecondary: {
    fontSize: 14,
    textAlign: 'center',
  },
  backLink: {
    marginTop: 16,
    alignItems: 'center',
  },
});
