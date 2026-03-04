# Release Android

Guia de build y verificacion de artefactos release.

## Build de APK release

```bash
npm run release:build
```

Salida esperada:

- `android/app/build/outputs/apk/release/app-universal-release.apk`
- `android/app/build/outputs/apk/release/app-arm64-v8a-release.apk`
- `android/app/build/outputs/apk/release/app-x86_64-release.apk`

## Compatibilidad Android (release)

- `minSdkVersion`: `24` (Android 7.0+)
- `targetSdkVersion`: `36`
- `compileSdkVersion`: `36`

Arquitecturas soportadas:

- `arm64-v8a`: dispositivos fisicos Android modernos
- `x86_64`: emuladores Android
- `app-universal-release.apk`: distribucion general

## Verificar artefactos

```bash
npm run verify-release -- android/app/build/outputs/apk/release/app-universal-release.apk
```

Para pruebas:

- Emulador x86_64: `app-x86_64-release.apk` o `app-universal-release.apk`
- Dispositivo fisico ARM64: `app-arm64-v8a-release.apk` o `app-universal-release.apk`

Validaciones incluidas:

- nombre de archivo (rechaza artefactos `debug`)
- inspeccion interna del APK como ZIP
- presencia de bundle de runtime (`assets/index.android.bundle` o equivalente valido para Expo/React Native)

## Gate combinado

```bash
npm run gate:release -- android/app/build/outputs/apk/release/app-universal-release.apk
```

Politica de artefactos:

- Permitidos: APKs `*-release.apk` con bundle de runtime
- No permitidos: APKs `*debug*.apk`, APKs sin bundle de runtime o archivos que no sean `.apk`

## Versionado y publicacion

- Crear tags solo cuando existan cambios significativos desde el tag previo.
- Incluir artefactos APK release en tags user-facing.
