import fs from 'fs';
import path from 'path';

describe('numeric input regression', () => {
  it('usa teclado decimal y evita parseo entero en porcentajes de dieta', () => {
    const file = path.join(__dirname, '..', 'src', 'screens', 'CreateDietScreen.tsx');
    const source = fs.readFileSync(file, 'utf8');

    expect(source).toMatch(/keyboardType="decimal-pad"/);
    expect(source).not.toMatch(/parseInt\(text\)/);
  });

  it('normaliza coma decimal para precios y presupuesto', () => {
    const priceFile = path.join(__dirname, '..', 'src', 'screens', 'PriceSettingsScreen.tsx');
    const resultFile = path.join(__dirname, '..', 'src', 'screens', 'DietResultScreen.tsx');
    const priceSource = fs.readFileSync(priceFile, 'utf8');
    const resultSource = fs.readFileSync(resultFile, 'utf8');

    expect(priceSource).toContain("replace(',', '.')");
    expect(resultSource).toContain("replace(',', '.')");
    expect(priceSource).toMatch(/keyboardType="decimal-pad"/);
    expect(resultSource).toMatch(/keyboardType="decimal-pad"/);
  });
});
