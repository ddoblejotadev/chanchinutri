/**
 * Tests for the debounce utility in dietStore.
 *
 * Covers: rapid calls coalesce into one save, flush forces immediate execution,
 * timer cleanup, and error handling.
 */

import { debouncedSave, flushDebouncedSave, _resetDebouncedSave } from '../src/store/dietStore';
import { logger } from '../src/lib/logger';

jest.mock('../src/lib/logger', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
    log: jest.fn(),
    info: jest.fn(),
  },
}));

const mockLogger = logger as jest.Mocked<typeof logger>;

describe('debouncedSave / flushDebouncedSave', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    _resetDebouncedSave();
  });

  afterEach(() => {
    _resetDebouncedSave();
    jest.useRealTimers();
  });

  it('does not execute the save function synchronously', () => {
    const saveFn = jest.fn().mockResolvedValue(undefined);
    debouncedSave(saveFn);
    expect(saveFn).not.toHaveBeenCalled();
  });

  it('executes the save function after the 300ms debounce delay', () => {
    const saveFn = jest.fn().mockResolvedValue(undefined);
    debouncedSave(saveFn);

    jest.advanceTimersByTime(299);
    expect(saveFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1);
    expect(saveFn).toHaveBeenCalledTimes(1);
  });

  it('coalesces rapid calls — only the last save function runs', () => {
    const firstFn = jest.fn().mockResolvedValue(undefined);
    const secondFn = jest.fn().mockResolvedValue(undefined);
    const thirdFn = jest.fn().mockResolvedValue(undefined);

    debouncedSave(firstFn);
    jest.advanceTimersByTime(100);
    debouncedSave(secondFn);
    jest.advanceTimersByTime(100);
    debouncedSave(thirdFn);

    // Advance past full debounce window from last call
    jest.advanceTimersByTime(300);

    expect(firstFn).not.toHaveBeenCalled();
    expect(secondFn).not.toHaveBeenCalled();
    expect(thirdFn).toHaveBeenCalledTimes(1);
  });

  it('resets the timer on each new call', () => {
    const saveFn = jest.fn().mockResolvedValue(undefined);

    debouncedSave(saveFn);
    jest.advanceTimersByTime(250); // 250ms in, not yet triggered
    debouncedSave(saveFn); // resets timer
    jest.advanceTimersByTime(250); // 250ms from second call — still not 300
    expect(saveFn).not.toHaveBeenCalled();

    jest.advanceTimersByTime(50); // now 300ms from second call
    expect(saveFn).toHaveBeenCalledTimes(1);
  });

  describe('flushDebouncedSave', () => {
    it('executes the pending save immediately', () => {
      const saveFn = jest.fn().mockResolvedValue(undefined);
      debouncedSave(saveFn);

      flushDebouncedSave();
      expect(saveFn).toHaveBeenCalledTimes(1);
    });

    it('cancels the pending timer so save does not run twice', () => {
      const saveFn = jest.fn().mockResolvedValue(undefined);
      debouncedSave(saveFn);

      flushDebouncedSave();
      jest.advanceTimersByTime(500); // well past debounce window

      // Only the flush call, not a second timer-based call
      expect(saveFn).toHaveBeenCalledTimes(1);
    });

    it('is a no-op when nothing is pending', () => {
      // Should not throw
      expect(() => flushDebouncedSave()).not.toThrow();
    });

    it('clears pending state so a second flush is a no-op', () => {
      const saveFn = jest.fn().mockResolvedValue(undefined);
      debouncedSave(saveFn);

      flushDebouncedSave();
      flushDebouncedSave();

      expect(saveFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('logs errors from the save function on timer expiry without throwing', () => {
      mockLogger.error.mockImplementation(() => {});
      const failingFn = jest.fn().mockRejectedValue(new Error('write failed'));

      debouncedSave(failingFn);
      jest.advanceTimersByTime(300);

      // The promise rejection is handled internally via .catch
      // Give microtask queue a chance to flush
      return Promise.resolve().then(() => {
        expect(mockLogger.error).toHaveBeenCalledWith('Error in debounced save:', expect.any(Error));
        mockLogger.error.mockRestore();
      });
    });

    it('logs errors from the save function on flush without throwing', () => {
      mockLogger.error.mockImplementation(() => {});
      const failingFn = jest.fn().mockRejectedValue(new Error('write failed'));

      debouncedSave(failingFn);
      flushDebouncedSave();

      return Promise.resolve().then(() => {
        expect(mockLogger.error).toHaveBeenCalledWith('Error flushing save:', expect.any(Error));
        mockLogger.error.mockRestore();
      });
    });
  });
});
