import {
  getPasswordChecks,
  isStrongPassword,
  isValidEmail,
} from '../src/lib/authValidation';

describe('authValidation', () => {
  describe('isValidEmail', () => {
    it('accepts valid emails', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
      expect(isValidEmail('test.user+app@dominio.com')).toBe(true);
    });

    it('rejects invalid emails', () => {
      expect(isValidEmail('userexample.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('')).toBe(false);
    });
  });

  describe('getPasswordChecks', () => {
    it('reports individual checks', () => {
      const checks = getPasswordChecks('Abc123!@');
      expect(checks).toEqual({
        minLength: true,
        hasUppercase: true,
        hasLowercase: true,
        hasNumber: true,
        hasSpecialChar: true,
      });
    });

    it('detects missing criteria', () => {
      const checks = getPasswordChecks('abc12345');
      expect(checks.minLength).toBe(true);
      expect(checks.hasUppercase).toBe(false);
      expect(checks.hasLowercase).toBe(true);
      expect(checks.hasNumber).toBe(true);
      expect(checks.hasSpecialChar).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('returns true only when all requirements are met', () => {
      expect(isStrongPassword('Abc123!@')).toBe(true);
      expect(isStrongPassword('abc12345')).toBe(false);
      expect(isStrongPassword('ABC12345')).toBe(false);
      expect(isStrongPassword('Abcdefgh')).toBe(false);
      expect(isStrongPassword('Abc12345')).toBe(false);
      expect(isStrongPassword('Abc12!')).toBe(false);
    });
  });
});
