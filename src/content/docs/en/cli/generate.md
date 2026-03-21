---
title: generate command
description: Generate modules and components with consistent naming and automatic wiring in cmd/main.go.
---

## Usage

```bash
keel generate [type] [name]
```

Alias:

```bash
keel g [type] [name]
```

## Project requirements

`generate` only works inside a project with:

- `go.mod`
- `cmd/main.go`
- `internal/` folder

If not met, it returns:

```text
keel generate must be executed inside a Keel project
```

## `name` format

Two formats are supported:

- standalone: `users`
- module/component: `users/create`

Rules validated by the CLI:

- only letters, numbers, `-`, `_`
- at most one `/`
- not empty

`module` only accepts standalone format (`users`), not `users/x`.

## Supported types

| Type | Standalone | `module/component` | Main location |
|---|---|---|---|
| `module` | Yes | No | `internal/modules/<module>/` |
| `service` | Yes | Yes | `internal/services/` or `internal/modules/<module>/` |
| `controller` | Yes | Yes | `internal/controllers/` or `internal/modules/<module>/` |
| `repository` | No | Yes | `internal/modules/<module>/` |
| `middleware` | Yes | No | `internal/middleware/` |
| `guard` | Yes | No | `internal/guards/` |
| `scheduler` | Yes | No | `internal/scheduler/` |
| `event` | Yes | No | `internal/events/` |
| `checker` | Yes | No | `internal/checkers/` |
| `hook` | Yes | No | `internal/hooks/` |

## Type aliases

| Alias | Real type |
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

| Flag | Applies to | Effect |
|---|---|---|
| `--transactional` | `module` | Generates module without controller |
| `--gorm` | `module`, `repository` | Generates a GORM-backed repository; installs `ss-keel-gorm` if absent |
| `--mongo` | `module`, `repository` | Generates a Mongo-backed repository; installs `ss-keel-mongo` if absent |
| `--in-main` | standalone `controller` | Inserts inline route in `cmd/main.go` without a controller file |

Invalid combinations return an explicit error, for example:

- `--transactional` outside of `module`
- `--gorm` or `--mongo` outside of `module` or `repository`
- `--gorm` and `--mongo` used together
- `--in-main` outside of standalone `controller`

## Automatic wiring in `cmd/main.go`

Depending on the generated type, the CLI may:

- add missing imports
- initialize `appLogger` if it doesn't exist
- register modules: `app.Use(...)`
- register controllers: `app.RegisterController(...)`
- register scheduler/checker/hook
- create inline controller with `contracts.ControllerFunc` (`--in-main`)
- run `go mod tidy` after `module` generation finishes wiring the project

## `module` scaffold output

`keel generate module users` creates the base module scaffold under `internal/modules/users/`:

- `users_module.go`
- `users_module_test.go`
- `users_dto.go`
- `users_entity.go`
- `users_service.go`
- `users_service_test.go`
- `users_controller.go`
- `users_controller_test.go`

It also updates `cmd/main.go` with `app.Use(users.NewModule(appLogger))`.

If you use `--gorm` or `--mongo`, the CLI also generates:

- `users_repository.go`
- `users_repository_test.go`

And `cmd/main.go` is wired with the matching dependency:

- `app.Use(users.NewModule(appLogger, db))` for `--gorm`
- `app.Use(users.NewModule(appLogger, mongoClient))` for `--mongo`

If you use `--transactional`, controller files are omitted and the generated module is wired without HTTP handlers.

## Behavior with existing files

- For `module`: if a file already exists, it is not overwritten; it continues with the rest.
- For most non-module types: if the target file exists, it fails with `file already exists: ...`.

## Examples

Full module:

```bash
keel g module users
```

Transactional module (no controller):

```bash
keel g module payments --transactional
```

Module with GORM repository:

```bash
keel g module payments --gorm
```

Service inside a module:

```bash
keel g service users/validate-email
```

Standalone controller inlined in `main`:

```bash
keel g controller ops-ping --in-main
```

Scheduler/checker/hook:

```bash
keel g scheduler nightly-jobs
keel g checker redis
keel g hook shutdown
```

## Common errors

- `unsupported generator type: ...`
- `invalid name: ...`
- `module name must not contain '/'`
- `file already exists: ...`
- `module package mismatch: expected 'x', found 'y' in <file>`

## Recommendations

1. Use `module` for business domains (`users`, `orders`, `payments`).
2. Use standalone for cross-cutting pieces (`middleware`, `scheduler`, `hooks`).
3. Always review the `cmd/main.go` diff after each generation.
