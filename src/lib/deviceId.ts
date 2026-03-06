import { randomUUID } from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = '@evapig_device_id';

let cachedId: string | null = null;

/**
 * @deprecated Since auth-supabase. Use `authStore.user?.id` for cloud
 * operations instead. device_id is kept only for backward compatibility:
 * - Identifying pre-auth rows during migration (migrateDeviceData)
 * - Local-only fallback when the user is not authenticated
 *
 * Will be removed once all users have migrated to auth-based scoping.
 *
 * Returns a stable device identifier, generating one on first call.
 * The ID is persisted to AsyncStorage so it survives app restarts.
 */
export async function getDeviceId(): Promise<string> {
  if (cachedId) return cachedId;

  try {
    const stored = await AsyncStorage.getItem(DEVICE_ID_KEY);
    if (stored) {
      cachedId = stored;
      return stored;
    }
  } catch (e) {
    console.error('Error reading device ID from storage:', e);
  }

  const newId = randomUUID();

  try {
    await AsyncStorage.setItem(DEVICE_ID_KEY, newId);
  } catch (e) {
    console.error('Error saving device ID to storage:', e);
  }

  cachedId = newId;
  return newId;
}

/**
 * @deprecated Since auth-supabase. See `getDeviceId()` deprecation notice.
 *
 * Synchronous access to the device ID after it has been initialised
 * by a prior `getDeviceId()` call.  Returns `null` if not yet cached.
 */
export function getCachedDeviceId(): string | null {
  return cachedId;
}
