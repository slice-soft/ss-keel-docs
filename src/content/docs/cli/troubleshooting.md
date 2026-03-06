---
title: Troubleshooting
description: Problemas comunes al usar Keel CLI y cómo resolverlos rápidamente.
---

## `keel: command not found`

Causa común: binario fuera de `PATH`.

Verifica:

```bash
which -a keel
go env GOBIN
go env GOPATH
```

Si instalaste con `go install`, asegúrate de tener `$(go env GOPATH)/bin` en `PATH`.

## Tengo varias versiones de `keel`

Verifica todos los binarios detectados:

```bash
which -a keel
```

Deja un solo método de instalación activo (`go install` o `brew`) para evitar conflictos.

## `keel new ...` falla en `go mod tidy`

Puede pasar en redes corporativas, sin internet o sin proxy de Go.

Acciones:

1. Revisa conectividad a `proxy.golang.org` (o configura tu `GOPROXY`).
2. Ejecuta luego manualmente:
   ```bash
   go mod tidy
   ```
3. Si usaste `--yes`, corrige antes el módulo placeholder en `go.mod`.

## `keel generate` no funciona en mi proyecto

`generate` requiere:

- `go.mod`
- `cmd/main.go`
- carpeta `internal/`

Si tu estructura no cumple eso, adapta el proyecto o usa `keel new` como base.

## `keel run <script>` dice que no existe

Revisa `keel.toml`:

- Debe existir `[scripts]`
- El nombre debe coincidir exactamente
- El comando no puede estar vacío

## Air no se instala automáticamente

El CLI intenta:

```bash
go install github.com/air-verse/air@latest
```

Si falla:

1. Instala Air manualmente.
2. Verifica que `air` esté en `PATH`.
3. Reabre la terminal.

## Completion no aparece

1. Ejecuta:
   ```bash
   keel completion install
   ```
2. Revisa que tu archivo de shell tenga la línea `source`.
3. Abre una nueva sesión.
