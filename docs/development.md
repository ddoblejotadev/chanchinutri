# Desarrollo

Guia tecnica para trabajar en ChanchiNutri localmente.

## Requisitos

- Node.js 18+
- npm 9+
- Android Studio + SDK (solo si vas a generar APK local)

## Setup rapido

```bash
git clone https://github.com/ddoblejotadev/chanchinutri.git
cd chanchinutri
npm install
npm start
```

## Entorno local vs nube

- Para desarrollo diario no hace falta backend local.
- La sincronizacion usa Supabase cloud.
- Si no hay credenciales configuradas, la app sigue operativa en modo local/offline.

## Comandos clave

```bash
# Iniciar app en modo desarrollo
npm start

# Build verify (CI-friendly)
npm run build:verify

# Quality gate (tests + typecheck + build verify)
npm run quality
```

`npm run quality` ejecuta:

1. `npm test -- --runInBand`
2. `npx tsc --noEmit`
3. `npm run build:verify`

## Landing web

La landing estatica vive en `landing/`.

```bash
# Opcion 1: abrir directo
landing/index.html

# Opcion 2: servidor estatico
npx serve landing
```

## Branding visual (assets)

- Revisar y reemplazar `assets/icon.png`, `assets/splash-icon.png`, `assets/favicon.png` y `assets/android-icon-*` si contienen versiones temporales o desactualizadas.
- El reemplazo debe hacerse manualmente con assets finales.
