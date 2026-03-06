import { create } from 'zustand';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, TABLES } from '../lib/supabase';
import { getCachedDeviceId } from '../lib/deviceId';

interface AuthState {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  initAuth: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  migrateDeviceData: () => Promise<void>;
}

/**
 * Maps Supabase auth error messages to user-friendly Spanish strings.
 */
function mapAuthError(message: string): string {
  if (message.includes('User already registered')) {
    return 'Este email ya está registrado';
  }
  if (message.includes('Password should be at least 6 characters')) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }
  if (message.includes('Invalid login credentials')) {
    return 'Email o contraseña incorrectos';
  }
  if (
    message.includes('rate limit') ||
    message.includes('too many requests') ||
    message.includes('For security purposes')
  ) {
    return 'Demasiados intentos. Esperá unos minutos.';
  }
  // Fallback: return the original message
  return message;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  session: null,
  user: null,
  isLoading: true,
  isAuthenticated: false,

  initAuth: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error.message);
      }
      if (data.session) {
        set({
          session: data.session,
          user: data.session.user,
          isAuthenticated: true,
        });
      }
    } catch (e) {
      console.error('Error initializing auth:', e);
    }

    // Set up auth state change listener
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        set({
          session,
          user: session.user,
          isAuthenticated: true,
        });
      } else {
        set({
          session: null,
          user: null,
          isAuthenticated: false,
        });
      }
    });

    set({ isLoading: false });
  },

  signUp: async (email, password) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        return { error: mapAuthError(error.message) };
      }
      // On success, onAuthStateChange listener updates state
      // Migrate device data after signup+login
      await get().migrateDeviceData();
      return { error: null };
    } catch (e) {
      console.error('Error during sign up:', e);
      return { error: 'Error inesperado al registrarse' };
    }
  },

  signIn: async (email, password) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { error: mapAuthError(error.message) };
      }
      // On success, onAuthStateChange listener updates state
      // Migrate device data after login
      await get().migrateDeviceData();
      return { error: null };
    } catch (e) {
      console.error('Error during sign in:', e);
      return { error: 'Error inesperado al iniciar sesión' };
    }
  },

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({
        session: null,
        user: null,
        isAuthenticated: false,
      });
    } catch (e) {
      console.error('Error during sign out:', e);
    }
  },

  resetPassword: async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) {
        if (
          error.message.includes('rate limit') ||
          error.message.includes('too many requests') ||
          error.message.includes('For security purposes')
        ) {
          return { error: 'Demasiados intentos. Esperá unos minutos.' };
        }
        // Return success even for unknown errors related to email not found
        // (security best practice: don't reveal if email exists)
      }
      return { error: null };
    } catch (e) {
      console.error('Error during password reset:', e);
      return { error: 'Error inesperado al restablecer la contraseña' };
    }
  },

  migrateDeviceData: async () => {
    try {
      const userId = get().user?.id;
      const deviceId = getCachedDeviceId();

      if (!userId || !deviceId) return;

      const { error } = await supabase
        .from(TABLES.SAVED_DIETS)
        .update({ user_id: userId })
        .eq('device_id', deviceId)
        .is('user_id', null);

      if (error) {
        console.error('Error migrating device data:', error);
      } else {
        console.log(`Migrated device data: device_id=${deviceId} → user_id=${userId}`);
      }
    } catch (e) {
      // Fire-and-forget: don't block the app if migration fails
      console.error('Error during device data migration:', e);
    }
  },
}));
