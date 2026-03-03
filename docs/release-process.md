# Proceso de publicacion de releases

Este documento define el flujo oficial para publicar versiones de EvaPigApp con notas claras para usuarios.

## Objetivo

- Comunicar cambios en lenguaje simple, orientado a usuario final.
- Evitar releases tecnicos/confusos.
- Mantener consistencia entre tags, release y notas.

## Reglas obligatorias

- NO usar `--generate-notes` solo.
- Si se usan notas autogeneradas, siempre complementar con un resumen claro para usuarios.
- Toda release debe incluir estas secciones:
  - Resumen para usuarios
  - Cambios funcionales visibles
  - Mejoras tecnicas internas (breve)
  - Compatibilidad e instalacion

## Paso a paso

1. Verificar rama principal actualizada

```bash
git checkout master
git pull
```

2. Confirmar version y cambios

```bash
git log --oneline <tag-anterior>..HEAD
```

3. Crear tag de release

```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```

4. Preparar notas de release en archivo

- Crear `docs/releases/vX.Y.Z-notes.md`.
- Escribir notas en espanol claro y orientado a usuario final.

5. Crear o editar release en GitHub

- Crear release nueva:

```bash
gh release create vX.Y.Z --title "EvaPigApp vX.Y.Z" --notes-file docs/releases/vX.Y.Z-notes.md
```

- Editar release existente:

```bash
gh release edit vX.Y.Z --notes-file docs/releases/vX.Y.Z-notes.md
```

## Plantilla recomendada de notas

```markdown
## Resumen para usuarios
[Que mejora esta version de forma simple]

## Cambios funcionales visibles
- [Cambio visible 1]
- [Cambio visible 2]

## Mejoras tecnicas internas (breve)
- [Ajuste interno 1]
- [Ajuste interno 2]

## Compatibilidad e instalacion
- [Compatibilidad]
- [Indicacion de actualizacion/instalacion]
```

## Automatizacion disponible

- Configuracion de notas autogeneradas: `.github/release.yml`.
- Script para publicar notas desde archivo:

```bash
npm run release:publish -- vX.Y.Z docs/releases/vX.Y.Z-notes.md
```

Si no se pasan argumentos, el script usa la version de `package.json` y el archivo `docs/releases/v<version>-notes.md`.
