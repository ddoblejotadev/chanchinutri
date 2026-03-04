import fs from 'fs';
import path from 'path';

describe('home navigation regression', () => {
  it('mantiene el CTA de Home hacia CreateDiet', () => {
    const homeScreenFile = path.join(__dirname, '..', 'src', 'screens', 'HomeScreen.tsx');
    const source = fs.readFileSync(homeScreenFile, 'utf8');

    expect(source).toMatch(/navigation\.navigate\('CreateDiet'\)/);
  });

  it('mantiene CreateDiet como pantalla del stack para permitir volver a Home', () => {
    const navigationFile = path.join(__dirname, '..', 'src', 'navigation', 'AppNavigation.tsx');
    const source = fs.readFileSync(navigationFile, 'utf8');

    expect(source).toMatch(/type RootStackParamList = \{[\s\S]*CreateDiet: undefined;[\s\S]*\};/);
    expect(source).toMatch(/<Stack\.Screen name="CreateDiet" component=\{CreateDietScreen\}/);
  });
});
