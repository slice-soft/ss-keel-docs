---
title: Comando generate
description: Genera módulos y componentes con naming consistente y wiring automático en cmd/main.go.
---

## Uso

```bash
keel generate [type] [name]
```

Alias:

```bash
keel g [type] [name]
```

## Requisitos de proyecto

`generate` solo funciona dentro de un proyecto con:

- `go.mod`
- `cmd/main.go`
- carpeta `internal/`

Si no se cumple, devuelve:

```text
keel generate must be executed inside a Keel project
```

## Formato de `name`

Se soportan dos formatos:

- standalone: `users`
- módulo/componente: `users/create`

Reglas validadas por el CLI:

- solo letras, números, `-`, `_`
- máximo un `/`
- no vacío

`module` solo acepta formato standalone (`users`), no `users/x`.

## Tipos soportados

| Tipo | Standalone | `modulo/componente` | Ubicación principal |
|---|---|---|---|
| `module` | Sí | No | `internal/modules/<modulo>/` |
| `service` | Sí | Sí | `internal/services/` o `internal/modules/<modulo>/` |
| `controller` | Sí | Sí | `internal/controllers/` o `internal/modules/<modulo>/` |
| `repository` | No | Sí | `internal/modules/<modulo>/` |
| `middleware` | Sí | No | `internal/middleware/` |
| `guard` | Sí | No | `internal/guards/` |
| `scheduler` | Sí | No | `internal/scheduler/` |
| `event` | Sí | No | `internal/events/` |
| `checker` | Sí | No | `internal/checkers/` |
| `hook` | Sí | No | `internal/hooks/` |

## Aliases de tipo

| Alias | Tipo real |
|---|---|
| `m`, `mod` | `module` |
| `s`, `svc` | `service` |
| `c`, `ctrl` | `controller` |
| `r`, `repo` | `repository` |
| `mw` | `middleware` |
| `gd` | `guard` |
| `sch` | `scheduler` |
| `ev` | `event` |
| `chk` | `checker` |
| `hk` | `hook` |

## Flags

| Flag | Aplica a | Efecto |
|---|---|---|
| `--transactional` | `module` | Genera módulo sin controller |
| `--with-repository` | `module` | Agrega repository al módulo |
| `--in-main` | `controller` standalone | Inserta ruta inline en `cmd/main.go` sin archivo de controller |

Combinaciones inválidas retornan error explícito, por ejemplo:

- `--transactional` fuera de `module`
- `--with-repository` fuera de `module`
- `--in-main` fuera de `controller` standalone

## Wiring automático en `cmd/main.go`

Dependiendo del tipo generado, el CLI puede:

- agregar imports faltantes
- inicializar `appLogger` si no existe
- registrar módulos: `app.Use(...)`
- registrar controllers: `app.RegisterController(...)`
- registrar scheduler/checker/hook
- crear controlador inline con `core.ControllerFunc` (`--in-main`)

## Comportamiento con archivos existentes

- Para `module`: si un archivo ya existe, no lo sobrescribe; continúa con el resto.
- Para la mayoría de tipos no-module: si el archivo destino existe, falla con `file already exists: ...`.

## Ejemplos

Módulo completo:

```bash
keel g module users
```

Módulo transaccional con repositorio:

```bash
keel g module payments --transactional --with-repository
```

Service dentro de módulo:

```bash
keel g service users/validate-email
```

Controller standalone inline en `main`:

```bash
keel g controller ops-ping --in-main
```

Scheduler/checker/hook:

```bash
keel g scheduler nightly-jobs
keel g checker redis
keel g hook shutdown
```

## Errores frecuentes

- `unsupported generator type: ...`
- `invalid name: ...`
- `module name must not contain '/'`
- `file already exists: ...`
- `module package mismatch: expected 'x', found 'y' in <file>`

## Recomendaciones

1. Usa `module` para dominios de negocio (`users`, `orders`, `payments`).
2. Usa standalone para piezas transversales (`middleware`, `scheduler`, `hooks`).
3. Revisa siempre el diff de `cmd/main.go` después de cada generación.
