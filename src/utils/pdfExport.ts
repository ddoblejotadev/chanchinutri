import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { SavedDiet, ANIMAL_TYPES } from '../store/dietStore';
import { getIngredientById } from '../data/ingredients';
import { logger } from '../lib/logger';

export async function exportDietToPDF(diet: SavedDiet): Promise<void> {
  const animalLabel = ANIMAL_TYPES[diet.animalType as keyof typeof ANIMAL_TYPES]?.label || diet.animalType;
  
  const ingredientsTable = diet.items.map(item => {
    const ing = getIngredientById(item.id);
    return `
      <tr>
        <td>${item.name}</td>
        <td style="text-align: center">${item.pct}%</td>
        <td style="text-align: center">${ing?.category || '-'}</td>
      </tr>
    `;
  }).join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>ChanchiNutri - ${diet.name}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
        h1 { color: #4CAF50; border-bottom: 2px solid #4CAF50; padding-bottom: 10px; }
        h2 { color: #666; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th { background-color: #4CAF50; color: white; padding: 10px; text-align: left; }
        td { padding: 8px; border-bottom: 1px solid #ddd; }
        .result-card { 
          background-color: #f5f5f5; 
          padding: 15px; 
          border-radius: 8px; 
          margin: 10px 0;
          border-left: 4px solid #4CAF50;
        }
        .result-value { font-size: 24px; font-weight: bold; color: #4CAF50; }
        .result-label { color: #666; font-size: 12px; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #999; font-size: 10px; }
        .warning { background-color: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
      </style>
    </head>
    <body>
      <h1>ChanchiNutri - Informe de Dieta</h1>
      
      <div style="display: flex; justify-content: space-between;">
        <div>
          <p><strong>Nombre:</strong> ${diet.name}</p>
          <p><strong>Tipo de animal:</strong> ${animalLabel}</p>
          <p><strong>Fecha:</strong> ${new Date(diet.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      <h2>Resultados Nutricionales</h2>
      <div style="display: flex; flex-wrap: wrap;">
        <div class="result-card" style="width: 45%;">
          <div class="result-label">Energía Neta</div>
          <div class="result-value">${diet.ne} <span style="font-size: 14px;">kcal/kg</span></div>
        </div>
        <div class="result-card" style="width: 45%;">
          <div class="result-label">Lisina Digestible (SID)</div>
          <div class="result-value">${diet.lys} <span style="font-size: 14px;">g/kg</span></div>
        </div>
        <div class="result-card" style="width: 45%;">
          <div class="result-label">Metionina Digestible (SID)</div>
          <div class="result-value">${diet.met} <span style="font-size: 14px;">g/kg</span></div>
        </div>
        <div class="result-card" style="width: 45%;">
          <div class="result-label">Treonina Digestible (SID)</div>
          <div class="result-value">${diet.thr} <span style="font-size: 14px;">g/kg</span></div>
        </div>
        <div class="result-card" style="width: 45%;">
          <div class="result-label">Fósforo Digestible</div>
          <div class="result-value">${diet.p} <span style="font-size: 14px;">g/kg</span></div>
        </div>
        <div class="result-card" style="width: 45%;">
          <div class="result-label">Materia Seca</div>
          <div class="result-value">${diet.dm} <span style="font-size: 14px;">%</span></div>
        </div>
      </div>

      <h2>Ingredientes de la Dieta</h2>
      <table>
        <thead>
          <tr>
            <th>Ingrediente</th>
            <th style="text-align: center">%</th>
            <th style="text-align: center">Categoría</th>
          </tr>
        </thead>
        <tbody>
          ${ingredientsTable}
        </tbody>
      </table>

      <div class="footer">
        <p>Generado por ChanchiNutri - Herramienta de evaluación nutricional para piensos de cerdos.</p>
        <p>Basado en tablas INRAE-CIRAD-AFZ</p>
      </div>
    </body>
    </html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartir dieta',
        UTI: 'com.adobe.pdf',
      });
    } else {
      logger.log('Sharing not available');
    }
  } catch (error) {
    logger.error('Error exporting PDF:', error);
    throw error;
  }
}
