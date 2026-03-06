/**
 * Simple logging utility that can be toggled based on environment.
 * In production, set EXPO_PUBLIC_DEBUG_MODE=false to disable logs.
 * 
 * NOTE: error() is ALWAYS logged regardless of debug mode.
 */

const isDebugMode = process.env.EXPO_PUBLIC_DEBUG_MODE === 'true' || process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: unknown[]) => {
    if (isDebugMode) {
      console.log('[LOG]', ...args);
    }
  },

  warn: (...args: unknown[]) => {
    if (isDebugMode) {
      console.warn('[WARN]', ...args);
    }
  },

  error: (...args: unknown[]) => {
    // Errors are ALWAYS logged, even in production
    console.error('[ERROR]', ...args);
  },

  info: (...args: unknown[]) => {
    if (isDebugMode) {
      console.info('[INFO]', ...args);
    }
  },
};
