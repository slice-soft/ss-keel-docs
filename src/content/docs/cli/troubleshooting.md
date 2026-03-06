---
title: Troubleshooting
description: Diagnóstico y solución de problemas comunes al usar Keel CLI.
---

## 1) `keel: command not found`

Verifica instalación y PATH:

```bash
which -a keel
go env GOBIN
go env GOPATH
```

Si instalaste con `go install`, agrega `$(go env GOPATH)/bin` al `PATH` (cuando `GOBIN` está vacío).

## 2) Tengo varias versiones de `keel`

```bash
which -a keel
keel --version
```

Mantén un solo método de instalación activo (`go install`, `brew` o binario manual).

## 3) Me aparece sugerencia `keel upgrade`

En el binario actual, el subcomando `upgrade` no aparece en `keel --help`.

Actualiza con tu método real:

- `go install github.com/slice-soft/keel@latest`
- `brew upgrade slice-soft/tap/keel`
- reemplazo manual desde release

## 4) `keel new ...` falla

Casos frecuentes:

- `directory '<name>' already exists`
- `project name cannot contain spaces`
- `project name is required when using --yes/-y`

Además, en post-setup pueden fallar:

- `go mod tidy` (red/proxy)
- `git init` o commit inicial (config de git)

## 5) `keel generate` no funciona en mi proyecto

Valida estructura mínima:

- `go.mod`
- `cmd/main.go`
- `internal/`

Si no existe, verás:

```text
keel generate must be executed inside a Keel project
```

## 6) `keel generate` falla por archivos existentes

Error típico:

```text
file already exists: ...
```

En tipos no-module, el CLI no sobreescribe archivos. Renombra/elimina manualmente o genera otro componente.

## 7) `module package mismatch`

Si editaste manualmente paquetes dentro de `internal/modules/<modulo>/`, puede aparecer:

```text
module package mismatch: expected 'x', found 'y' in <file>
```

Alinea el `package` de los archivos del módulo al nombre esperado.

## 8) `keel run <script>` dice que no existe

Revisa `keel.toml`:

- debe existir `[scripts]`
- el nombre debe coincidir exactamente
- el valor no puede ser vacío

## 9) `keel init` no completa instalación de Air

El CLI intenta:

```bash
go install github.com/air-verse/air@latest
```

Si falla:

1. instala Air manualmente,
2. valida que `air` esté en `PATH`,
3. abre una nueva terminal.

## 10) Completion no funciona

1. Ejecuta `keel completion install`.
2. Verifica que el archivo de shell tenga línea `source`.
3. Abre una nueva sesión.

## 11) `/docs` no aparece

Comportamiento de `ss-keel-core`: si `Env == "production"`, no monta `GET /docs` ni `GET /docs/openapi.json`.

## 12) Puerto ocupado

`ss-keel-core` intenta buscar el siguiente puerto disponible desde el configurado y lo reporta en logs. Revisa la salida de arranque para confirmar el puerto final.

## Checklist de diagnóstico rápido

```bash
keel --version
keel --help
which -a keel
cat keel.toml
go test ./...
```

Si el error persiste, comparte:

- comando exacto ejecutado
- mensaje completo de error
- salida de `keel --version`
- fragmento relevante de `keel.toml`
