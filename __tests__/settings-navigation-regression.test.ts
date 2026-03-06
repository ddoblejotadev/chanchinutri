import fs from 'fs';
import path from 'path';

describe('settings navigation regression', () => {
  it('renders Settings tab directly instead of redirect placeholder', () => {
    const navigationFile = path.join(__dirname, '..', 'src', 'navigation', 'AppNavigation.tsx');
    const source = fs.readFileSync(navigationFile, 'utf8');

    expect(source).toMatch(/name="Settings"[\s\S]*component=\{PriceSettingsScreen\}/);
    expect(source).not.toMatch(/navigation\.navigate\('PriceSettings'\)/);
  });

  it('agrega espacio inferior dinamico para evitar contenido tapado por tab bar', () => {
    const settingsFile = path.join(__dirname, '..', 'src', 'screens', 'PriceSettingsScreen.tsx');
    const source = fs.readFileSync(settingsFile, 'utf8');

    expect(source).toMatch(/useBottomTabBarHeight/);
    expect(source).toMatch(/contentContainerStyle=\{\[styles\.scrollContent,\s*\{\s*paddingBottom:\s*tabBarHeight\s*\+\s*24\s*\}\]\}/);
  });

  it('incluye seccion de cuenta con auth store integration', () => {
    const settingsFile = path.join(__dirname, '..', 'src', 'screens', 'PriceSettingsScreen.tsx');
    const source = fs.readFileSync(settingsFile, 'utf8');

    // Auth store imported and used
    expect(source).toContain('useAuthStore');
    expect(source).toContain('isAuthenticated');
    expect(source).toContain('signOut');

    // Account section present
    expect(source).toContain('Cuenta');
  });
});
