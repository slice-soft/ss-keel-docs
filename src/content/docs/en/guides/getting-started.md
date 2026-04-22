---
title: Getting Started
description: Create your first API with Keel CLI and ss-keel-core.
---

**Keel** combines:

- **`ss-keel-core`**: HTTP framework in Go built on Fiber, with OpenAPI, logging, validation, and lifecycle.
- **`keel` CLI**: scaffolding, component generation, and script automation.

## Requirements

- Go `1.25+`
- Git
- (Optional) Air for hot reload

## Recommended path: with CLI

Install the CLI with Homebrew:

```bash
brew install slice-soft/tap/keel
```

Or with Go:

```bash
go install github.com/slice-soft/keel@latest
```

Then scaffold your project:

```bash
keel new myapp
cd myapp
```

Run in development:

```bash
keel run dev
```

Generate your first module:

```bash
keel generate module users
```

### Generated base structure

A typical CLI-generated project looks like this:

```text
myapp/
├── cmd/
│   └── main.go
├── internal/
│   └── modules/
│       └── starter/           # optional
├── go.mod
├── keel.toml
├── application.properties
├── .env
├── .env.example
└── .air.toml
```

### Initial endpoints

With the server running:

| Endpoint | Description |
|---|---|
| `GET /hello` | Starter route (if you included the starter module) |
| `GET /health` | Health check |
| `GET /docs` | Swagger UI |
| `GET /docs/openapi.json` | OpenAPI 3.0 spec |

> `/docs` and `/docs/openapi.json` are mounted when `Env != "production"`.

## Manual path: `ss-keel-core` only

If you prefer not to use the CLI, you can start manually:

```bash
mkdir myapp && cd myapp
go mod init github.com/your-org/myapp
go get github.com/slice-soft/ss-keel-core@latest
```

Minimal `cmd/main.go`:

```go
package main

import (
	"github.com/slice-soft/ss-keel-core/config"
	"github.com/slice-soft/ss-keel-core/core"
	"github.com/slice-soft/ss-keel-core/logger"
)

func main() {
	appLogger := logger.NewLogger(config.GetEnvOrDefault("APP_ENV", "development") == "production")

	app := core.New(core.KConfig{
		Port:        config.GetEnvIntOrDefault("PORT", 7331),
		ServiceName: config.GetEnvOrDefault("SERVICE_NAME", "myapp"),
		Env:         config.GetEnvOrDefault("APP_ENV", "development"),
		Docs: core.DocsConfig{
			Title:   "myapp API",
			Version: "1.0.0",
		},
	})

	if err := app.Listen(); err != nil {
		appLogger.Error("failed to start app: %v", err)
	}
}
```

Run:

```bash
go run ./cmd/main.go
```

## What's next

- [CLI Installation](/en/cli/installation) — installation methods (`go install`, `brew`, releases)
- [generate command](/en/cli/generate) — module generation and automatic wiring
- [Configuration](/en/guides/configuration) — env vars and runtime configuration
- [Controllers](/en/guides/controllers) — route and handler design
- [Modules](/en/guides/modules) — domain-driven organization
- [Testing](/en/guides/testing) — unit and integration tests
