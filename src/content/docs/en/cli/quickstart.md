---
title: Quick Start
description: Create, run, and expand your first project with Keel CLI using the recommended workflow.
---

## 1) Install the CLI

```bash
go install github.com/slice-soft/keel@latest
keel --version
```

## 2) Create a new project

Interactive mode (recommended):

```bash
keel new my-api
```

Automatic mode (no prompts):

```bash
keel new my-api --yes
```

:::caution[If you use `--yes`]
The module is generated with a placeholder (`github.com/my-github-user/<app>`). Review and fix `go.mod` before publishing the repository.
:::

## 3) Enter the project and run development

```bash
cd my-api
keel run dev
```

In new projects, `keel.toml` typically includes:

```toml
[scripts]
dev   = "air -c .air.toml"
build = "go build -o bin/my-api ./cmd/main.go"
test  = "go test ./..."
lint  = "golangci-lint run"
```

## 4) Generate your first module

```bash
keel generate module users --with-repository
```

Expected output (main paths):

- `internal/modules/users/users_module.go`
- `internal/modules/users/users_service.go`
- `internal/modules/users/users_controller.go`
- `internal/modules/users/users_repository.go`
- update of `cmd/main.go` with `app.Use(users.NewModule(appLogger))`

## 5) Verify base endpoints

With the app running in development:

- `GET /health`
- `GET /docs`
- `GET /docs/openapi.json`
- `GET /hello` (if you kept `starter`)

> `ss-keel-core` does not mount docs when `Env == "production"`.

## 6) Run more project scripts

```bash
keel run test
keel run build
```

## Alternate flow: existing project

If you already have a Go project and want to adopt `keel run`:

```bash
cd existing-project
keel init
keel run test
```

`keel init` creates `keel.toml` and, depending on your response, also `.air.toml`.

## Next steps

- [`new` command](/cli/new/)
- [`init` command](/cli/init/)
- [`generate` command](/cli/generate/)
- [`run` command](/cli/run/)
