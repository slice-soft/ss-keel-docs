---
title: Comando add
description: Instala addons oficiales o comunitarios de Keel y los integra en el proyecto actual.
---

## Uso

```bash
keel add [alias|repo]
```

Con refresh de registry:

```bash
keel add [alias|repo] --refresh
```

`add` requiere exactamente un argumento.

## Requisitos de proyecto

`add` solo funciona dentro de un proyecto Keel con:

- `go.mod`
- `cmd/main.go`
- carpeta `internal/`

Si no se cumple, devuelve:

```text
keel add must be executed inside a Keel project
```

## Cómo funciona la resolución del objetivo

| Entrada | Resolución |
|---|---|
| `gorm` | Se busca como alias en el registry oficial |
| `github.com/acme/my-addon` | Se trata como ruta de repositorio directa (sin lookup de alias) |
| alias desconocido (por ejemplo `my-addon`) | Se trata como objetivo no oficial y pide confirmación |

## Comportamiento del registry y caché

- Fuente del registry: `https://raw.githubusercontent.com/slice-soft/ss-keel-addons/main/registry.json`
- Archivo de caché local: `~/.keel/registry.json`
- TTL de caché: 1 hora
- `--refresh` ignora caché fresca y fuerza fetch por red
- Si falla el fetch por red, el CLI intenta usar caché
- Si no se puede obtener el registry, la instalación puede continuar por repo directo

## Flujo oficial vs no oficial

- Alias oficial (encontrado en registry): instala directamente.
- Objetivo no oficial: solicita confirmación:

```text
Install anyway? [y/N]
```

Solo `y` continúa. Cualquier otra respuesta cancela la instalación.

## Contrato `keel-addon.json`

Para un repositorio objetivo, el CLI descarga:

`https://raw.githubusercontent.com/<owner>/<repo>/main/keel-addon.json`

Actualmente solo se soportan rutas de módulo GitHub (`github.com/...`).

El CLI parsea esta estructura:

```json
{
  "name": "my-addon",
  "version": "0.1.0",
  "description": "Description",
  "repo": "github.com/your-org/my-addon",
  "steps": [
    { "type": "go_get", "package": "github.com/your-org/my-addon@v0.1.0" },
    { "type": "env", "key": "MY_ADDON_KEY", "example": "value", "description": "Optional note" },
    { "type": "main_import", "path": "github.com/your-org/my-addon" },
    { "type": "main_code", "guard": "app.Use(myaddon.New())", "code": "app.Use(myaddon.New())" }
  ]
}
```

## Tipos de paso soportados

| Tipo de paso | Qué hace |
|---|---|
| `go_get` | Ejecuta `go get <package>` (agrega `@latest` si no incluyes versión) |
| `env` | Agrega `KEY=example` en `.env` si la llave no existe |
| `main_import` | Inserta import en `cmd/main.go` si falta |
| `main_code` | Inserta código antes de `app.Listen()` en `cmd/main.go`; `guard` evita duplicados |

Tipos de paso desconocidos fallan la instalación.

## Comportamiento después de instalar

- Los pasos se ejecutan en orden.
- Luego el CLI ejecuta `go mod tidy`.
- Si `go mod tidy` falla, el CLI muestra advertencia pero no falla toda la instalación.

## Ejemplos

Instalar addon oficial por alias:

```bash
keel add gorm
```

Instalar addon MongoDB por alias:

```bash
keel add mongo
```

Instalar addon comunitario por repo:

```bash
keel add github.com/acme/ss-keel-feature-flags
```

Forzar refresh del registry de aliases:

```bash
keel add gorm --refresh
```

## Errores frecuentes

- `keel add must be executed inside a Keel project`
- `could not fetch addon registry: ...`
- `only github.com repos are supported (got "...")`
- `<repo> does not have a keel-addon.json — it may not be a Keel addon`
- `invalid keel-addon.json in <repo>: ...`
- `step "<type>" failed: ...`
