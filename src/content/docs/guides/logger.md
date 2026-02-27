---
title: Logger
description: Use the structured logger across your application — modules, services, and handlers.
---

ss-keel-core includes a structured logger that is available from the moment you create the app. This guide shows how to get it and use it throughout your application. For the full API reference see [Reference → Logger](/reference/logger).

## Getting the Logger

The logger is created internally by `core.New()`. Access it with `app.Logger()`:

```go
// main.go
cfg := config.Load()

app := core.New(core.KConfig{
    ServiceName: cfg.ServiceName,
    Port:        cfg.Port,
    Env:         cfg.Env,
})

log := app.Logger()
log.Info("App created, registering modules...")
```

The logger is automatically configured for the environment:

| `Env` | Format | Debug |
|---|---|---|
| `development` | Text (readable) | Enabled |
| `staging` / `production` | JSON (structured) | Disabled |

## Passing the Logger to Modules

Pass `app.Logger()` into your modules so services and repositories can log without importing the logger package directly:

```go
// users/module.go
package users

import (
    "myapp/config"
    "github.com/slice-soft/ss-keel-core/core"
    "github.com/slice-soft/ss-keel-core/logger"
)

type Module struct {
    cfg config.Config
}

func New(cfg config.Config) *Module {
    return &Module{cfg: cfg}
}

func (m *Module) Register(app *core.App) {
    repo    := NewRepository(m.cfg.DatabaseURL)
    service := NewService(repo, app.Logger()) // ← inject logger
    app.RegisterController(NewController(service))
}
```

## Using the Logger in Services

```go
// users/service.go
package users

import (
    "context"
    "github.com/slice-soft/ss-keel-core/core"
    "github.com/slice-soft/ss-keel-core/logger"
)

type Service struct {
    repo UserRepository
    log  *logger.Logger
}

func NewService(repo UserRepository, log *logger.Logger) *Service {
    return &Service{repo: repo, log: log}
}

func (s *Service) Create(ctx context.Context, dto *CreateUserDTO) (*User, error) {
    s.log.Debug("creating user with email %s", dto.Email)

    user, err := s.repo.Create(ctx, dto)
    if err != nil {
        s.log.Warn("failed to create user: %v", err)
        return nil, core.Internal("failed to create user", err)
    }

    s.log.Info("user created: %s", user.ID)
    return user, nil
}

func (s *Service) Delete(ctx context.Context, id string) error {
    if err := s.repo.Delete(ctx, id); err != nil {
        return core.Internal("failed to delete user", err)
    }
    s.log.Info("user deleted: %s", id)
    return nil
}
```

## Log Levels

```go
log.Info("Server started on port %d", cfg.Port)   // always shown
log.Debug("Query: %s", query)                      // dev only
log.Warn("Slow response: %dms", ms)               // always shown
log.Error("Fatal startup error: %v", err)          // logs + exits process
```

:::caution[Error exits the process]
Use `log.Error` only for unrecoverable startup failures (database unreachable, missing required config). For runtime errors in handlers, return a `*KError` instead.
:::

## Automatic Request Logging

You don't need to log HTTP requests manually. ss-keel-core logs every request automatically:

**Development (text):**
```
[INFO]  GET    /users          200  1.2ms
[INFO]  POST   /users          201  3.8ms
[WARN]  GET    /users/999      404  0.5ms
```

**Production (JSON):**
```json
{"level":"info","method":"GET","path":"/users","status":200,"duration":"1.2ms"}
{"level":"warn","method":"GET","path":"/users/999","status":404,"duration":"0.5ms"}
```

## Logging in main.go

Use the logger around startup and shutdown sequences:

```go
func main() {
    cfg := config.Load()

    app := core.New(core.KConfig{
        ServiceName: cfg.ServiceName,
        Port:        cfg.Port,
        Env:         cfg.Env,
    })

    log := app.Logger()
    log.Info("registering modules")

    app.Use(auth.New(cfg))
    app.Use(users.New(cfg))

    app.OnShutdown(func(ctx context.Context) error {
        log.Info("shutting down gracefully")
        return nil
    })

    log.Info("starting %s on port %d", cfg.ServiceName, cfg.Port)
    app.Listen()
}
```
