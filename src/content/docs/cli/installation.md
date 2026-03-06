---
title: Instalación
description: Instala Keel CLI con go install, Homebrew tap o binarios de GitHub Releases.
---

## Requisitos

- Go `1.25+` (recomendado)
- Git (para flujos de proyecto)

## Opción 1: `go install` (recomendada si trabajas full Go)

```bash
go install github.com/slice-soft/keel@latest
```

Si `keel` no aparece en tu shell, valida que tu binario de Go esté en `PATH`:

```bash
echo "GOBIN=$(go env GOBIN)"
echo "GOPATH=$(go env GOPATH)"
```

En la mayoría de casos debes agregar `$(go env GOPATH)/bin` al `PATH`.

Verifica instalación:

```bash
keel --version
```

Actualizar con este método:

```bash
go install github.com/slice-soft/keel@latest
```

## Opción 2: Homebrew tap (macOS/Linux)

El release del CLI publica fórmula Homebrew en el tap:
- Tap repo: `slice-soft/homebrew-tap`
- Fórmula: `keel`

Instalación:

```bash
brew tap slice-soft/tap
brew install slice-soft/tap/keel
```

Verifica:

```bash
keel --version
```

Actualizar:

```bash
brew upgrade slice-soft/tap/keel
```

## Opción 3: Binario desde GitHub Releases

1. Abre [github.com/slice-soft/keel/releases](https://github.com/slice-soft/keel/releases).
2. Descarga el artefacto de tu plataforma:
   - Linux/macOS: `keel_<os>_<arch>.tar.gz`
   - Windows: `keel_windows_<arch>.zip`
3. Extrae el binario `keel` y ubícalo en un directorio dentro de `PATH`.
4. Ejecuta `keel --version`.

## Verificación rápida

```bash
keel --help
keel --version
```

Debes ver comandos como `new`, `init`, `generate`, `run` y `completion`.

## Evita instalaciones duplicadas

Si instalaste por más de un método y el binario no coincide con lo esperado:

```bash
which -a keel
```

Deja una sola instalación activa para evitar confusión entre versiones.
