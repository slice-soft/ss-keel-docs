---
title: CLI Overview
description: The ss-keel CLI for scaffolding, code generation, and project management.
---

:::caution[Work in Progress]
The **keel CLI** is currently under development. Commands and flags described here are planned and subject to change. This page will be updated as features ship.
:::

The `keel` CLI accelerates development by providing scaffolding, code generation, and project management for ss-keel-core applications.

## Installation

```bash
# Coming soon
go install github.com/slice-soft/keel@latest
```

## Commands

### `keel new`

Scaffold a new project interactively:

```bash
keel new my-api
```

Planned prompts:
- Module path (e.g. `github.com/myorg/my-api`)
- Port and environment defaults
- Select addons to include (database, cache, auth, etc.)
- Docker / docker-compose setup
- GitHub Actions CI template

### `keel generate`

Generate boilerplate for common components:

```bash
keel generate controller users
keel generate module orders
keel generate dto CreateUserDTO
```

| Subcommand | Generates |
|---|---|
| `controller <name>` | Controller struct with CRUD routes skeleton |
| `module <name>` | Module with Register() and wired controller |
| `dto <name>` | DTO struct with common validation tags |

### `keel dev`

Start the development server with hot-reload:

```bash
keel dev
# or
keel dev --port 8080
```

### `keel build`

Build the application binary:

```bash
keel build
keel build --output ./bin/server
```

## Project Generator

A web-based project generator is also planned, inspired by [create.astro.build](https://astro.new/). Configure your stack through a UI and download a ready-to-run project.

Planned features:
- Pick your database addon (`ss-keel-gorm`, `ss-keel-mongo`)
- Pick your cache addon (`ss-keel-redis`)
- Pick your auth strategy (`ss-keel-jwt`, `ss-keel-oauth`)
- Docker and CI/CD templates included
- Download as a `.zip` or push directly to a new GitHub repo

:::note[Stay Updated]
Follow the [repository](https://github.com/slice-soft/ss-keel-core) for CLI release announcements.
:::
