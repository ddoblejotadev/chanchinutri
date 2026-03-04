# 🐷 ChanchiNutri

<div align="center">

[![Expo](https://img.shields.io/badge/Expo-54.0-blue?style=flat-square)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-blue?style=flat-square)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-2.x-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**Evaluacion nutricional de piensos para cerdos**

Calcula energia neta, aminoacidos digestibles, fosforo y costos de dietas porcinas.

</div>

---

## 🚀 Quick Start

```bash
git clone https://github.com/ddoblejotadev/chanchinutri.git
cd chanchinutri
npm install
npm start
```

Para desarrollo diario no necesitás backend local: la app funciona en modo local/offline y usa Supabase cloud cuando hay credenciales.

Si querés habilitar sync en nube, copiá `.env.example` a `.env` y completá:

```bash
EXPO_PUBLIC_SUPABASE_URL=...
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## 📱 Caracteristicas principales

- Calculo nutricional: NE, lisina, metionina, treonina, fosforo y materia seca.
- Base de 44 ingredientes (cereales, oleaginosas, subproductos, animales, lacteos y minerales).
- Costeo por kg y tonelada en CLP.
- Plantillas de dieta por etapa productiva.
- Graficos, exportacion PDF, sync en nube y modo offline.

## 🛠️ Stack

- Expo SDK 54 + React Native 0.81 + TypeScript
- Estado global con Zustand
- Navegacion con React Navigation (tabs + stack)
- Supabase (sync en nube + persistencia remota)
- Testing con Jest

## 📖 Uso rapido

1. Selecciona el tipo de animal (lechon, crecimiento, cerda o reproductor).
2. Crea una dieta con ingredientes y porcentajes.
3. Revisa resultados nutricionales (NE, aminoacidos, fosforo).
4. Evalua costo por kg y tonelada.
5. Guarda localmente y sincroniza en nube cuando haya credenciales.

## 📁 Estructura del proyecto

```text
chanchinutri/
├── src/
│   ├── data/          # Ingredientes, precios y plantillas
│   ├── engine/        # Motor de calculo nutricional
│   ├── lib/           # Integraciones externas (Supabase)
│   ├── navigation/    # Navegacion principal
│   ├── screens/       # Pantallas de la app
│   ├── store/         # Estado global (Zustand)
│   └── utils/         # Utilidades (ej. exportacion PDF)
├── __tests__/         # Unit + regression tests
├── scripts/           # Build/verificacion de artefactos
├── landing/           # Landing web estatica
├── docs/              # Documentacion extendida
├── .github/           # Workflows, templates y CODEOWNERS
├── App.tsx            # Entry principal de la app
├── package.json       # Scripts y dependencias
└── README.md
```

## ✅ Calidad y release

```bash
# Gate principal de calidad
npm run quality

# Build release Android
npm run release:build
```

Detalles completos de desarrollo, artefactos APK y politica de release en `docs/development.md` y `docs/release.md`.

## 📚 Documentacion

- Indice general: [docs/README.md](docs/README.md)
- Desarrollo local: [docs/development.md](docs/development.md)
- Build/release Android: [docs/release.md](docs/release.md)
- Aviso legal: [docs/legal.md](docs/legal.md)
- Contribucion: [CONTRIBUTING.md](CONTRIBUTING.md)
- Seguridad: [SECURITY.md](SECURITY.md)
- Playbook interno de maintainers: [docs/maintainers/community-playbook.md](docs/maintainers/community-playbook.md)

## 📄 Licencia

MIT License - ver [LICENSE](LICENSE).

## 👨‍💻 Autor

Desarrollado por [@ddoblejotadev](https://github.com/ddoblejotadev).

---

<div align="center">

⭐️ Si te gusta el proyecto, dale una estrella.

</div>
