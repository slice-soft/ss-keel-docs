---
title: Logger
description: "Use the structured logger throughout your application: modules, services, and handlers."
---

ss-keel-core includes a structured logger available from the moment you create the app. This guide shows how to obtain it and use it throughout the application. For the full API, see [Reference → Logger](/en/reference/logger).

## Getting the Logger

The logger is created internally in `core.New()`. Access it with `app.Logger()`:

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

The logger is automatically configured based on environment:

| `Env` | Format | Debug |
|---|---|---|
| `development` | Text (readable) | Enabled |
| `staging` / `production` | JSON (structured) | Disabled |

## Passing the logger to modules

Pass `app.Logger()` to your modules so services and repositories can log events without importing the `logger` package directly:

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

## Using the logger in services

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
        s.log.Warn("user creation failed: %v", err)
        return nil, core.Internal("user creation failed", err)
    }

    s.log.Info("user created: %s", user.ID)
    return user, nil
}

func (s *Service) Delete(ctx context.Context, id string) error {
    if err := s.repo.Delete(ctx, id); err != nil {
        return core.Internal("user deletion failed", err)
    }
    s.log.Info("user deleted: %s", id)
    return nil
}
```

## Log levels

```go
log.Info("Server started on port %d", cfg.Port)   // always visible
log.Debug("Query: %s", query)                      // development only
log.Warn("Slow response: %dms", ms)                // always visible
log.Error("Fatal startup error: %v", err)          // log + terminates process
```

:::caution[Error terminates the process]
Use `log.Error` only for unrecoverable startup failures (DB unreachable, missing required config). For runtime errors in handlers, return a `*KError`.
:::

## Automatic request logging

You don't need to log HTTP requests manually. ss-keel-core logs every request automatically.

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

Use the logger around startup and shutdown:

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
