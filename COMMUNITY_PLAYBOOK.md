# Community Playbook

Guia operativa para crecer contributors y mantener colaboracion de calidad en ChanchiNutri.

## 1) Social Preview (repo visibility)

- Archivo sugerido: `social-preview.svg` (base editable incluida en este repo).
- Recomendacion: exportar version final a PNG 1280x640 para subirla en GitHub.
- Ruta en GitHub UI: `Settings > General > Social preview > Upload image`.

## 2) Required contributor issues (already created)

- #1 `docs: add architecture section to README`
- #2 `test: add regression test for diet save + return flow`
- #3 `docs: add release checklist for APK verification`

Etiquetas aplicadas para discovery: `good first issue`, `help wanted`, `documentation`/`enhancement`.

## 3) Pull Request smoke test workflow

Flujo recomendado por contributor:

1. Crear rama corta desde `master` (`feat/*`, `fix/*`, `docs/*`).
2. Abrir PR contra `master`.
3. Esperar check obligatorio `quality`.
4. Obtener 1 aprobacion (CODEOWNERS activo).
5. Resolver conversaciones.
6. Merge por squash.

## 4) Release notes template (copy/paste)

Usar este bloque en `gh release create --notes` o en el editor de GitHub Releases:

```md
## Highlights
- [Feature/fix 1]
- [Feature/fix 2]

## Quality
- Tests: `npm test -- --runInBand`
- Typecheck: `npx tsc --noEmit`
- Build verify: `npm run build:verify`

## Android Artifacts
- `app-universal-release.apk`
- `app-arm64-v8a-release.apk`
- `app-x86_64-release.apk`

## Notes
- [Known limitation / migration note, if any]
```

## 5) Outreach copy templates

### LinkedIn (short)

```text
Lance una nueva version de ChanchiNutri, una app movil para evaluar nutricion y costos de dietas porcinas (Expo + React Native + TypeScript).

Tambien deje el repo listo para contributors: quality gate obligatorio, branch protection, CODEOWNERS y issues de onboarding.

Repo: https://github.com/ddoblejotadev/chanchinutri
Landing: https://ddoblejotadev.github.io/chanchinutri/
```

### X/Twitter (short)

```text
ChanchiNutri is live 🐷
Mobile app to evaluate pig diet nutrition + cost (Expo/RN/TS).

Repo now contributor-ready: protected branch, required CI, CODEOWNERS, starter issues.

GitHub: https://github.com/ddoblejotadev/chanchinutri
Landing: https://ddoblejotadev.github.io/chanchinutri/
```
