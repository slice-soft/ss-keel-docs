---
title: Architecture
description: Official Keel architecture across ss-keel-core, the contracts layer, official addons, the CLI, and official examples.
---

The official Keel ecosystem is organized around four pieces:

| Piece | Repositories | Responsibility |
|---|---|---|
| Core | `ss-keel-core` | Runtime, HTTP abstractions, app lifecycle, health endpoint, OpenAPI bridge |
| Contracts | `ss-keel-core/contracts` | Stable interfaces shared by the runtime, addons, and applications |
| Addons | `ss-keel-gorm`, `ss-keel-mongo`, and other official addon repos | Optional infrastructure integrations that implement contracts |
| CLI | `ss-keel-cli`, `ss-keel-addons`, `ss-keel-addon-template` | Project scaffolding, code generation, addon installation, and script execution |

This separation keeps Keel aligned with SliceSoft principles: modular architecture, SOLID boundaries, DRY abstractions, and a clean separation between the core runtime and addon infrastructure.

## Core

The runtime lives in `ss-keel-core/core` and `ss-keel-core/core/httpx`.

- `core.New(...)` creates the app and registers default middleware.
- `app.Use(...)` registers modules.
- `app.RegisterController(...)` registers routes.
- `app.RegisterHealthChecker(...)`, `app.SetTracer(...)`, `app.SetTranslator(...)`, and `app.SetMetricsCollector(...)` accept contract implementations.

Official examples of the core runtime:

- `ss-keel-examples/examples/01-hello-world`
- `ss-keel-examples/examples/03-health-check`
- `ss-keel-examples/examples/04-rest-crud`

Those examples show the runtime before any persistence addon is introduced.

## Contracts

The `contracts` package is the stable boundary between the runtime and integrations.

It defines interfaces such as:

- `Module[A]` and `Controller[R]`
- `Repository[T, ID, Q, P]`
- `HealthChecker`, `Logger`, `Guard`, `Cache`, `Mailer`, `Storage`
- `Publisher`, `Subscriber`, `Scheduler`, `Tracer`, `MetricsCollector`, `Translator`

The purpose of the contracts layer is to:

- keep the runtime independent from infrastructure packages
- let official addons plug into the runtime without modifying `ss-keel-core`
- give applications a stable abstraction surface for their own adapters and module boundaries
- avoid coupling modules through cross-package implementation imports

In the official codebase, both persistence addons prove contract compatibility at compile time:

```go
var _ contracts.Repository[any, any, httpx.PageQuery, httpx.Page[any]] =
    (*database.GormRepository[any, any])(nil)

var _ contracts.Repository[any, any, httpx.PageQuery, httpx.Page[any]] =
    (*mongo.MongoRepository[any, any])(nil)
```

## Addons

Addons are separate Go modules that implement contracts.

Official persistence integrations today are:

- `ss-keel-gorm` for relational databases through GORM
- `ss-keel-mongo` for MongoDB through the official Go driver

Official addon-related examples:

- `ss-keel-examples/examples/08-gorm-postgres` shows GORM + PostgreSQL integration
- `ss-keel-examples/examples/10-addon-example` shows addon consumption patterns and addon metadata concepts

The runtime stays stable while addons provide infrastructure-specific behavior.

## CLI

The CLI is the official workflow layer of the Keel ecosystem.

From the code in `ss-keel-cli`:

- `keel new` scaffolds a project with `cmd/main.go`, `keel.toml`, and optionally `internal/modules/starter`
- `keel generate` creates modules, controllers, services, repositories, middleware, guards, schedulers, and more
- `keel generate repository ... --gorm` or `--mongo` uses official repository templates for persistence addons
- `keel add <alias|repo>` resolves official aliases through `ss-keel-addons`, validates `keel-addon.json`, and wires addon steps into the project
- `keel run <script>` executes scripts defined in `keel.toml`

The CLI is not part of the runtime, but it is part of the official Keel architecture and workflow.

## Dependency direction

The dependency direction is intentionally one-way:

```text
applications and examples
    -> import core + contracts + addon packages

official addons
    -> import contracts (+ shared helper packages such as core/httpx)

core runtime
    -> imports contracts

CLI
    -> scaffolds and wires projects around core/addons, but is not a runtime dependency
```

## Boundary rules

- Keep HTTP lifecycle, routing, middleware, health, and OpenAPI behavior in the core runtime.
- Keep shared interfaces in `contracts`.
- Keep persistence, messaging, storage, and other infrastructure concerns in addons.
- Keep scaffolding, code generation, addon installation, and script execution in the CLI.
- Prefer module-local abstractions over cross-module implementation coupling.

See [Contracts](/reference/interfaces) for the contract catalog and [Persistence](/guides/persistence) for the official persistence integrations.
