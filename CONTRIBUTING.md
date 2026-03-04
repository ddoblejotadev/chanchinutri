# Contributing to ChanchiNutri

Guia para contributors y desarrolladores que trabajan en ChanchiNutri.

## Table of Contents

- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Quality Gates and Testing](#quality-gates-and-testing)
- [Branch and Review Policy](#branch-and-review-policy)
- [Release Process](#release-process)
- [Code Standards](#code-standards)
- [Pull Request Checklist](#pull-request-checklist)
- [Reporting Bugs](#reporting-bugs)

## Development Setup

### Requirements

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 18+ | Ejecutar tooling de Expo y scripts |
| npm | 9+ | Gestion de dependencias y scripts |
| Android Studio + SDK | Ultimo estable | Build APK local (release/debug) |
| Git | Ultimo estable | Control de versiones |

### Build from Source

```bash
git clone https://github.com/ddoblejotadev/chanchinutri.git
cd chanchinutri
npm install
npm start
```

### Useful local commands

```bash
# Run app in Android (native run)
npm run android

# Run tests once
npm test -- --runInBand

# Type checking
npx tsc --noEmit
```

## Project Structure

```text
chanchinutri/
├── src/
│   ├── data/                  # Ingredientes, precios y plantillas
│   ├── engine/                # Motor de calculo nutricional
│   ├── lib/                   # Integraciones externas (Supabase)
│   ├── navigation/            # Configuracion de navegacion
│   ├── screens/               # Pantallas de la app
│   ├── store/                 # Estado global (Zustand)
│   └── utils/                 # Utilidades (ej. exportacion PDF)
├── __tests__/                 # Unit tests + regression tests
├── scripts/                   # Build/verify de artefactos release
├── .github/workflows/         # Quality gate y release gate en CI
├── landing/                   # Landing web publica del proyecto
└── AGENTS.md                  # Reglas de revision de codigo del repo
```

## Quality Gates and Testing

Antes de abrir PR, estos checks son obligatorios:

```bash
npm run quality
```

`npm run quality` ejecuta:

1. `npm test -- --runInBand`
2. `npx tsc --noEmit`
3. `npm run build:verify`

Para cambios relacionados a release de Android, ejecutar ademas:

```bash
# Build release APK(s)
npm run release:build

# Verify release artifact (example)
npm run verify-release -- android/app/build/outputs/apk/release/app-universal-release.apk

# Combined gate
npm run gate:release -- android/app/build/outputs/apk/release/app-universal-release.apk
```

## Branch and Review Policy

Repositorio configurado para colaboracion segura:

- Rama protegida: `master`
- Merge permitido: `squash` (sin merge commit, sin rebase merge)
- PR obligatorio para entrar a `master`
- CI obligatorio en PR: check `quality`
- Requiere 1 aprobacion minima
- Requiere resolver conversaciones antes de merge
- Requiere review de CODEOWNERS
- Se bloquea force-push y borrado de rama protegida
- Se elimina la rama del PR automaticamente al merge

Flujo recomendado por cambio:

1. Crear rama corta: `feat/...`, `fix/...`, `docs/...`
2. Abrir Pull Request contra `master`
3. Esperar CI + aprobacion
4. Merge por squash

## Release Process

Sigue este flujo para releases versionadas:

1. Asegura cambios significativos desde el tag anterior.
2. Corre quality gate y release gate.
3. Crea y publica tag.
4. Crea GitHub Release con notas claras y artefactos APK correspondientes.

### Tag + release example

```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z

gh release create vX.Y.Z \
  --title "vX.Y.Z" \
  --notes "## Changes\n- Describe key features/fixes"
```

Release safety policy (obligatoria):

- No crear release sin commits significativos desde el tag previo.
- Para tags user-facing, incluir artefactos APK release validos.
- Nunca publicar APK `debug` como release.

## Code Standards

Estas reglas son obligatorias y se validan en revision:

- No commitear secretos o credenciales.
- No dejar errores silenciados.
- No dejar codigo muerto ni imports sin usar.
- No introducir `any` sin justificacion explicita.
- Mantener tipado claro en funciones/componentes publicos.
- Si cambias navegacion, cubrir comportamiento de back-navigation con tests de regresion.
- Mantener mutaciones de Zustand inmutables y predecibles.

## Pull Request Checklist

- [ ] El alcance es claro, pequeno y revisable.
- [ ] Se agregaron/actualizaron tests si cambia comportamiento.
- [ ] `npm run quality` pasa localmente.
- [ ] El check `quality` pasa en GitHub Actions.
- [ ] No hay secretos ni credenciales en el diff.
- [ ] No hay dead code ni imports sin usar.
- [ ] README/docs se actualizaron si cambia UX, release o setup.
- [ ] Si hubo cambios de navegacion, se incluyeron regression tests de back-navigation.
- [ ] El PR tiene aprobacion del CODEOWNER requerido.

## Reporting Bugs

Usa los issue templates y agrega:

- Pasos para reproducir
- Resultado esperado
- Resultado actual
- Version de app
- Dispositivo y version de Android
- Logs/screenshots cuando aplique
