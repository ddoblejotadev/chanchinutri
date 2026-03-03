$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$gitDir = Join-Path $repoRoot '.git'

if (-not (Test-Path $gitDir)) {
  throw "No se encontro .git en $repoRoot"
}

$hooksDir = Join-Path $gitDir 'hooks'
if (-not (Test-Path $hooksDir)) {
  New-Item -ItemType Directory -Path $hooksDir | Out-Null
}

$preCommitPath = Join-Path $hooksDir 'pre-commit'
$hookContent = @'
#!/usr/bin/env sh
set -e

node scripts/pre-commit-gate.js
'@

Set-Content -Path $preCommitPath -Value $hookContent -Encoding ascii

Write-Host "Pre-commit hook instalado en $preCommitPath"
Write-Host "Gate activo: quality condicional por staged files + GGA opcional local (estricto con GGA_STRICT=1)"
