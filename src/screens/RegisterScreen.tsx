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
import {
  getPasswordChecks,
  isStrongPassword,
  isValidEmail,
} from '../lib/authValidation';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export default function RegisterScreen({ navigation }: Props) {
  const { darkMode } = useDietStore(useShallow((s) => ({ darkMode: s.darkMode })));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const passwordChecks = useMemo(() => getPasswordChecks(password), [password]);

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

  const handleSignUp = async () => {
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

    if (password !== confirmPassword) {
      setErrorMsg('Las contraseñas no coinciden');
      return;
    }

    if (!isStrongPassword(password)) {
      setErrorMsg('La contraseña no cumple con los requisitos de seguridad');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await useAuthStore.getState().signUp(trimmedEmail, password);
      if (error) {
        setErrorMsg(error);
      } else {
        Alert.alert(
          'Cuenta creada',
          'Revisá tu email para confirmar tu cuenta. Después vas a poder iniciar sesión.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login'),
            },
          ],
        );
      }
    } catch {
      setErrorMsg('Error inesperado. Intentá de nuevo.');
    } finally {
      setIsLoading(false);
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
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.accent }]}>
          <Text style={styles.logoPig}>🐷</Text>
          <Text style={styles.logoTitle}>Crear Cuenta</Text>
          <Text style={styles.logoSubtitle}>Registrate para sincronizar tus dietas</Text>
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
          <Text style={[styles.hintText, { color: colors.textSecondary }]}>
            Formato esperado: nombre@correo.com
          </Text>

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
            placeholder="Mínimo 6 caracteres"
            placeholderTextColor={colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            editable={!isLoading}
          />

          <View style={styles.requirementsBox}>
            <Text style={[styles.requirementsTitle, { color: colors.text }]}>La contrasena debe tener:</Text>
            <Text
              style={[
                styles.requirementItem,
                { color: passwordChecks.minLength ? colors.accent : colors.textSecondary },
              ]}
            >
              {passwordChecks.minLength ? '✓' : '•'} Minimo 8 caracteres
            </Text>
            <Text
              style={[
                styles.requirementItem,
                { color: passwordChecks.hasUppercase ? colors.accent : colors.textSecondary },
              ]}
            >
              {passwordChecks.hasUppercase ? '✓' : '•'} Al menos 1 letra mayuscula
            </Text>
            <Text
              style={[
                styles.requirementItem,
                { color: passwordChecks.hasLowercase ? colors.accent : colors.textSecondary },
              ]}
            >
              {passwordChecks.hasLowercase ? '✓' : '•'} Al menos 1 letra minuscula
            </Text>
            <Text
              style={[
                styles.requirementItem,
                { color: passwordChecks.hasNumber ? colors.accent : colors.textSecondary },
              ]}
            >
              {passwordChecks.hasNumber ? '✓' : '•'} Al menos 1 numero
            </Text>
            <Text
              style={[
                styles.requirementItem,
                { color: passwordChecks.hasSpecialChar ? colors.accent : colors.textSecondary },
              ]}
            >
              {passwordChecks.hasSpecialChar ? '✓' : '•'} Al menos 1 simbolo (!@#$%...)
            </Text>
          </View>

          {/* Confirm Password */}
          <Text style={[styles.label, { color: colors.text }]}>Confirmar Contraseña</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
            placeholder="Repetí tu contraseña"
            placeholderTextColor={colors.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoComplete="new-password"
            editable={!isLoading}
          />

          {/* Sign Up button */}
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.accent }]}
            onPress={handleSignUp}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Crear Cuenta</Text>
            )}
          </TouchableOpacity>

          {/* Login link */}
          <TouchableOpacity
            onPress={() => navigation.replace('Login')}
            disabled={isLoading}
            style={styles.loginLink}
          >
            <Text style={[styles.linkTextSecondary, { color: colors.textSecondary }]}>
              ¿Ya tenés cuenta?{' '}
              <Text style={{ color: colors.accent, fontWeight: '600' }}>Iniciá Sesión</Text>
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
              Volver sin registrarse
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
  hintText: {
    fontSize: 12,
    marginTop: 6,
  },
  requirementsBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  requirementItem: {
    fontSize: 12,
    marginBottom: 2,
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
  loginLink: {
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
