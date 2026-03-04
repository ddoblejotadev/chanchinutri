# 🐷 PorciNutri CL

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
| 🥕 **44 Ingredientes** | Cereales, oleaginosas, subproductos, animales, lacteos y minerales |
| 💰 **Costos en CLP** | Calculadora de costos por kg y tonelada |
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
- Android Studio + SDK de Android (solo para generar APK local)

### Entorno local vs nube

- Para desarrollo diario **no necesitás levantar backend local**.
- La sincronización usa Supabase en la nube; si no configurás credenciales, la app sigue funcionando en modo local/offline.
- Para correr la app en desarrollo alcanza con `npm start` y abrir en Expo Go/emulador.

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

### Gate de calidad

```bash
npm run quality
```

Incluye:
- tests (`jest --runInBand`)
- typecheck (`tsc --noEmit`)
- build verify (`expo export`)

### Build APK release

```bash
npm run release:build
```

Salida esperada:
- `android/app/build/outputs/apk/release/app-release.apk`

Notas:
- En el flujo normal se genera **un solo APK release** (`app-release.apk`).
- Las variantes por ABI (por ejemplo `app-arm64-v8a-release.apk`, `app-x86_64-release.apk` o `app-universal-release.apk`) son opcionales y dependen de tener ABI split habilitado en Gradle.

### Verificar artefactos release

```bash
npm run verify-release -- android/app/build/outputs/apk/release/app-release.apk
```

Para pruebas en emulador x86_64, instalar `app-x86_64-release.apk` (o `app-universal-release.apk`).
Para dispositivos fisicos ARM64, instalar `app-arm64-v8a-release.apk` (o `app-universal-release.apk`).

Si no usás ABI split, validá e instalá `app-release.apk`.

Valida automaticamente:
- nombre de archivo (rechaza artefactos `debug`)
- inspeccion interna del APK como ZIP
- presencia de bundle de runtime (`assets/index.android.bundle` o equivalente valido para Expo/React Native)

### Gate combinado (calidad + artefactos release)

```bash
npm run gate:release -- android/app/build/outputs/apk/release/app-release.apk
```

Politica de artefactos:
- Permitidos: APKs `*-release.apk` con bundle de runtime de inicio.
- No permitidos: APKs `*debug*.apk`, APKs sin bundle de runtime, o archivos que no sean `.apk`.

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

PorciNutri CL es un proyecto independiente y **no esta afiliado, asociado, autorizado ni respaldado por EvaPig**.

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
