# Dependencias - Estado y Recomendaciones

## Vulnerabilidades

### Alta
- `tar` (<=7.5.9): Hardlink Path Traversal
  - **Ubicación:** transitive (node_modules/tar)
  - **Acción:** `npm audit fix` (pero puede romper algo)

### Media/Baja
- Varias dependencias desactualizadas (ver abajo)

## Paquetes desactualizados (recomendación: actualizar en siguiente release)

| Paquete | Actual | Última | Prioridad |
|---------|--------|--------|-----------|
| expo | 54.0.33 | 55.0.5 | Alta |
| react-native | 0.81.5 | 0.84.1 | Alta |
| @react-navigation/* | 7.15.x | 7.15.5 | Media |
| react-native-screens | 4.16.0 | 4.24.0 | Media |
| react-native-svg | 15.12.1 | 15.15.3 | Baja |

## Acción recomendada

Para la próxima release (v1.0.8), ejecutar:

```bash
npm install expo@latest @react-navigation/native@latest @react-navigation/bottom-tabs@latest @react-navigation/native-stack@latest react-native@latest react-native-screens@latest react-native-svg@latest
```

**Nota:** Actualizar a Expo 55 puede requerir cambios adicionales. Verificar compatibilidad primero.
