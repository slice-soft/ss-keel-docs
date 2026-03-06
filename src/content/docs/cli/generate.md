---
title: Comando generate
description: Genera módulos y componentes en proyectos Keel con wiring automático.
---

## Uso

```bash
keel generate [type] [name]
```

Alias:

```bash
keel g [type] [name]
```

## Requisitos del proyecto

`generate` exige ejecutarse dentro de un proyecto Keel válido con:

- `go.mod`
- `cmd/main.go`
- carpeta `internal/`

Si falta alguno, verás:

```text
keel generate must be executed inside a Keel project
```

## Formato de `name`

Se aceptan dos formatos:

- `standalone`: `users`
- `modulo/componente`: `users/create`

Reglas:

- Solo un `/` máximo
- Letras, números, `-`, `_`
- No vacío

## Tipos soportados

| Tipo | Standalone | `modulo/componente` | Salida principal |
|---|---|---|---|
| `module` | Sí | No | `internal/modules/<modulo>/*` |
| `service` | Sí | Sí | `internal/services/*` o `internal/modules/<modulo>/*` |
| `controller` | Sí | Sí | `internal/controllers/*` o `internal/modules/<modulo>/*` |
| `repository` | No | Sí | `internal/modules/<modulo>/*` |
| `middleware` | Sí | No | `internal/middleware/*` |
| `guard` | Sí | No | `internal/guards/*` |
| `scheduler` | Sí | No | `internal/scheduler/*` |
| `event` | Sí | No | `internal/events/*` |
| `checker` | Sí | No | `internal/checkers/*` |
| `hook` | Sí | No | `internal/hooks/*` |

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
| `--transactional` | `module` | Crea módulo sin controller (uso background/transactional) |
| `--with-repository` | `module` | Agrega repository al generar módulo |
| `--in-main` | `controller` standalone | Inserta rutas inline en `cmd/main.go` sin crear archivo de controller |

Si usas una combinación inválida, el comando falla con error explícito.

## Ejemplos

Generar módulo completo:

```bash
keel g module users
```

Módulo sin controller + con repository:

```bash
keel g module payments --transactional --with-repository
```

Service dentro de módulo:

```bash
keel g service users/validate-email
```

Controller standalone inline en `main`:

```bash
keel g controller health --in-main
```

Scheduler/checker/hook:

```bash
keel g scheduler nightly-jobs
keel g checker redis
keel g hook shutdown
```

## Wiring automático

Según el tipo generado, `generate` puede modificar `cmd/main.go` automáticamente para:

- agregar imports
- registrar módulos (`app.Use(...)`)
- registrar controllers (`app.RegisterController(...)`)
- registrar scheduler (`app.RegisterScheduler(...)`)
- registrar health checkers (`app.RegisterHealthChecker(...)`)
- registrar hooks de apagado (`app.OnShutdown(...)`)

También regenera el archivo de módulo (`*_module.go`) con los componentes existentes.

## Errores comunes

- `unsupported generator type: ...`
- `invalid name: ...`
- `file already exists: ...`
- `module package mismatch: ...`

## Buenas prácticas

- Usa `module` para features de dominio (`users`, `orders`, `payments`).
- Usa standalone solo para piezas transversales (`middleware`, `scheduler`, `hooks`).
- Revisa el diff de `cmd/main.go` después de cada generación para mantener control del wiring.
