---
title: App
description: App struct reference — constructor, configuration, and all methods.
---

The `App` struct is the central piece of ss-keel-core. It wraps a Fiber app and adds structured routing, logging, OpenAPI generation, graceful shutdown, and optional integrations.

## Constructor

```go
func core.New(cfg KConfig) *App
```

Creates a new `App` instance. Sets up Fiber with:
- Request logging middleware
- CORS middleware
- Panic recovery middleware
- Error handler (`*KError` → JSON response)
- `GET /health` endpoint (unless `DisableHealth: true`)
- `GET /docs` and `GET /docs/openapi.json` (unless `Env: "production"`)

## KConfig

```go
type KConfig struct {
    ServiceName   string
    Port          int        // default: 3000
    Env           string     // "development" | "staging" | "production"
    DisableHealth bool
    Docs          DocsConfig
}
```

### DocsConfig

```go
type DocsConfig struct {
    Path        string     // default: "/docs"
    Title       string
    Version     string     // default: "1.0.0"
    Description string
    Contact     *DocsContact
    License     *DocsLicense
    Servers     []string   // format: "url - description"
    Tags        []DocsTag
}

type DocsContact struct {
    Name  string
    URL   string
    Email string
}

type DocsLicense struct {
    Name string
    URL  string
}

type DocsTag struct {
    Name        string
    Description string
}
```

## Methods

### Registering Routes & Modules

```go
func (a *App) RegisterController(c Controller)
func (a *App) Use(m Module)
func (a *App) Group(prefix string, middlewares ...fiber.Handler) *Group
```

### Starting the Server

```go
func (a *App) Listen() error
```

Starts the HTTP server in a goroutine, then blocks waiting for `SIGINT` or `SIGTERM`. On signal:
1. Stops accepting new connections
2. Runs all registered shutdown hooks with a 10-second timeout
3. Exits

### Shutdown Hooks

```go
func (a *App) OnShutdown(fn func(context.Context) error)
```

Registers a function to be called during graceful shutdown. Hooks are run in registration order with a shared 10-second context.

```go
app.OnShutdown(func(ctx context.Context) error {
    return db.Close()
})
```

### Accessing Internals

```go
func (a *App) Logger() *logger.Logger
func (a *App) Fiber() *fiber.App   // access underlying Fiber instance
func (a *App) Tracer() Tracer      // returns configured tracer (never nil)
```

### Observability

```go
func (a *App) SetMetricsCollector(mc MetricsCollector)
func (a *App) SetTracer(t Tracer)
func (a *App) SetTranslator(t Translator)
```

### Scheduler

```go
func (a *App) RegisterScheduler(s Scheduler)
```

Registers a scheduler and automatically wires up a shutdown hook that calls `s.Stop(ctx)`.

### Health Checks

```go
func (a *App) RegisterHealthChecker(h HealthChecker)
```

Adds a health checker. All checkers are run in parallel when `GET /health` is called. If any fails, the endpoint returns `503`. See [Health Checks](/reference/health).

## Full Example

```go
package main

import (
    "context"
    "log"
    "github.com/slice-soft/ss-keel-core/core"
)

func main() {
    app := core.New(core.KConfig{
        ServiceName: "users-api",
        Port:        8080,
        Env:         "development",
        Docs: core.DocsConfig{
            Title:       "Users API",
            Version:     "1.0.0",
            Description: "Manages user accounts",
            Contact: &core.DocsContact{
                Name:  "Support",
                Email: "dev@example.com",
            },
            Servers: []string{
                "http://localhost:8080 - Local",
                "https://api.example.com - Production",
            },
            Tags: []core.DocsTag{
                {Name: "users", Description: "User management"},
            },
        },
    })

    app.Use(&users.Module{})

    app.OnShutdown(func(ctx context.Context) error {
        log.Println("shutting down...")
        return nil
    })

    if err := app.Listen(); err != nil {
        log.Fatal(err)
    }
}
```
