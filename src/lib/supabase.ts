import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bmogjhpqzuardlwzidve.supabase.co';
const supabaseAnonKey = 'sb_publishable_XzraQQ9CI9luv0b1tY6RkA_DI2aQfm5';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tablas disponibles en Supabase
export const TABLES = {
  SAVED_DIETS: 'saved_diets',
  USER_PREFERENCES: 'user_preferences',
};
