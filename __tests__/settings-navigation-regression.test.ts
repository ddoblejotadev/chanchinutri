import fs from 'fs';
import path from 'path';

describe('settings navigation regression', () => {
  it('renders Settings tab directly instead of redirect placeholder', () => {
    const navigationFile = path.join(__dirname, '..', 'src', 'navigation', 'AppNavigation.tsx');
    const source = fs.readFileSync(navigationFile, 'utf8');

    expect(source).toMatch(/name="Settings"[\s\S]*component=\{PriceSettingsScreen\}/);
    expect(source).not.toMatch(/navigation\.navigate\('PriceSettings'\)/);
  });
});
