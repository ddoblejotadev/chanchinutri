# 🐷 EvaPigApp

<div align="center">

[![Expo](https://img.shields.io/badge/Expo-54.0-blue?style=flat-square)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue?style=flat-square)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Evaluación nutricional de piensos para cerdos**

Calcula energía neta, aminoácidos digestibles, fósforo y costos de dietas porcinas.

</div>

---

## 📱 Características

| Característica | Descripción |
|----------------|-------------|
| 🧮 **Cálculo Nutricional** | NE, Lisina, Metionina, Treonina, Fósforo, Materia Seca |
| 🥕 **44 Ingredientes** | Cereales, oleaginosas, subproductos, animales, lácteos, minerales 💰 **Cost, aminoácidos |
|os en CLP** | Calculadora de costos por kg y tonelada |
| 📋 **Plantillas** | Dietas predefinidas para lechones, crecimiento, cerdas y reproductores |
| 📊 **Gráficos** | Visualización de distribución de ingredientes |
| ☁️ **Sync en la Nube** | Sincronización con Supabase |
| 🌙 **Modo Oscuro** | Interfaz adaptativa |
| 📄 **Exportación PDF** | Informes de dietas |
| 💾 **Offline** | Funciona sin internet |

---

## 🛠️ Tecnologías

- **Framework**: [Expo](https://expo.dev) SDK 54
- **UI**: React Native + TypeScript
- **Estado**: [Zustand](https://zustand-demo.pmnd.rs/)
- **Navegación**: React Navigation (Tabs + Stack)
- **Gráficos**: react-native-chart-kit
- **Backend**: Supabase (cloud sync)
- **Testing**: Jest

---

## 🚀 Instalación

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Expo CLI

### Desarrollo

```bash
# Clonar el repositorio
git clone https://github.com/ddoblejotadev/evapigapp.git
cd evapigapp

# Instalar dependencias
npm install

# Iniciar desarrollo
npm start
```

### Verificacion de build (CI-friendly)

```bash
npm run build:verify
```

Este comando ejecuta `expo export` para Android y valida que el bundle de produccion pueda generarse sin compilar nativo.

### Gate de calidad (pro)

```bash
npm run quality
```

Incluye:
- tests (`jest --runInBand`)
- typecheck (`tsc --noEmit`)
- build verify (`expo export`)

Para instalar el hook local de commit (pre-commit):

```bash
npm run hooks:install
```

El hook ejecuta `npm run quality:commit` y exige tambien `gga run` antes de permitir el commit.

### Build APK

```bash
# Generar APK debug
cd android
./gradlew assembleDebug
```

El APK se generará en: `android/app/build/outputs/apk/debug/`

---

## 📖 Uso

1. **Seleccionar tipo de animal**: Lechón, Crecimiento, Cerda gestante o Reproductor
2. **Crear dieta**: Agregar ingredientes y definir porcentajes
3. **Ver resultados**: Energía, aminoácidos, cumplimiento nutricional
4. **Establecer presupuesto**: Comparar costo vs objetivo
5. **Guardar**: Guardar localmente y sincronizar con la nube

---

## 📁 Estructura

```
src/
├── data/
│   ├── ingredients.ts    # 44 ingredientes con valores nutricionales
│   ├── prices.ts         # Precios en CLP (editables)
│   └── templates.ts      # Plantillas de dietas
├── engine/
│   └── calculations.ts    # Motor de cálculo nutricional
├── lib/
│   └── supabase.ts      # Cliente Supabase
├── navigation/
│   └── AppNavigation.tsx # Navegación principal
├── screens/
│   ├── HomeScreen.tsx           # Pantalla principal
│   ├── CreateDietScreen.tsx    # Crear dieta
│   ├── DietResultScreen.tsx    # Resultados
│   ├── SavedDietsScreen.tsx    # Dietas guardadas
│   └── PriceSettingsScreen.tsx # Configurar precios
├── store/
│   └── dietStore.ts      # Estado global (Zustand)
└── utils/
    └── pdfExport.ts      # Exportación PDF
```

---

## ⚠️ Aviso Legal

Los valores nutricionales y precios mostrados son **REFERENCIAS GENÉRICAS** basadas en tablas públicas (INRAE-CIRAD-AFZ).

Para uso **profesional**, validá los datos con:
- Un nutricionista porcino matriculado
- Análisis de laboratorio de tus proveedores
- Tablas nutricionales actualizadas de tu región

---

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE) para detalles.

---

## 👨‍💻 Autor

**Desarrollado por**: [@ddoblejotadev](https://github.com/ddoblejotadev)

---

<div align="center">

⭐️ Si te gusta el proyecto, dale una estrella!

</div>
