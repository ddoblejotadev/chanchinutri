import fs from 'fs';
import path from 'path';

describe('home screen regression', () => {
  it('muestra el aviso legal con texto corregido', () => {
    const homeScreenFile = path.join(__dirname, '..', 'src', 'screens', 'HomeScreen.tsx');
    const source = fs.readFileSync(homeScreenFile, 'utf8');

    expect(source).toContain('Aviso Importante');
    expect(source).not.toContain('Aviso Important</Text>');
  });

  it('mantiene branding con icono de cerdito en el header', () => {
    const homeScreenFile = path.join(__dirname, '..', 'src', 'screens', 'HomeScreen.tsx');
    const source = fs.readFileSync(homeScreenFile, 'utf8');

    expect(source).toContain('styles.titleRow');
    expect(source).toContain('styles.titlePig');
    expect(source).toContain('🐷');
    expect(source).toContain('ChanchiNutri');
  });

  it('mantiene la navegacion al flujo Crear Dieta', () => {
    const homeScreenFile = path.join(__dirname, '..', 'src', 'screens', 'HomeScreen.tsx');
    const source = fs.readFileSync(homeScreenFile, 'utf8');

    expect(source).toContain(`navigation.navigate('CreateDiet')`);
  });

  it('muestra sync condicional segun autenticacion (auth-gated UI)', () => {
    const homeScreenFile = path.join(__dirname, '..', 'src', 'screens', 'HomeScreen.tsx');
    const source = fs.readFileSync(homeScreenFile, 'utf8');

    // Imports auth store
    expect(source).toContain('useAuthStore');
    expect(source).toContain('isAuthenticated');

    // Conditional rendering: sync controls for authenticated, prompt for unauthenticated
    expect(source).toContain('authPromptCard');
    expect(source).toContain('Iniciar sesión');
    expect(source).toContain('Crear cuenta');
  });
});
