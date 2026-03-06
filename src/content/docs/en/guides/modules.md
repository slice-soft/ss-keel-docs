---
title: Modules
description: Organize your application into self-contained, reusable modules.
---

A **module** is a self-contained unit that registers its routes, controllers, and services. Modules separate concerns and allow composing large applications cleanly.

## Module interface

```go
type Module interface {
    Register(app *core.App)
}
```

Any struct that implements `Register(app *core.App)` is a module.

## Creating a module

Modules receive configuration via a constructor, avoiding `os.Getenv` calls inside business logic. Configuration is loaded once in `main.go` via `config.Load()` and propagated.

```go
package users

import (
    "myapp/config"
    "github.com/slice-soft/ss-keel-core/core"
)

type Module struct {
    cfg config.Config
}

func New(cfg config.Config) *Module {
    return &Module{cfg: cfg}
}

func (m *Module) Register(app *core.App) {
    // uses cfg; no os.Getenv here
    repo := NewRepository(m.cfg.DatabaseURL)
    service := NewService(repo)
    controller := NewController(service)

    app.RegisterController(controller)
}
```

## Registering a module

```go
// main.go
cfg := config.Load()

app := core.New(core.KConfig{
    ServiceName: cfg.ServiceName,
    Port:        cfg.Port,
    Env:         cfg.Env,
})

app.Use(users.New(cfg))
app.Use(auth.New(cfg))

app.Listen()
```

## Grouped modules

Use `Group` to mount modules under a route prefix. All controllers registered inside the group receive that prefix.

```go
v1 := app.Group("/api/v1")

v1.Use(&users.UserModule{})
v1.Use(&auth.AuthModule{})
```

Routes from `UserController` like `/users` become `/api/v1/users`.

## Group middleware

You can apply middleware to all routes in a group:

```go
api := app.Group("/api/v1", authMiddleware, rateLimiter)
api.Use(&users.UserModule{})
```

All routes in the group inherit those middlewares.

## Module with shutdown hook

Modules can register cleanup functions for graceful shutdown:

```go
func (m *UserModule) Register(app *core.App) {
    db := connectDB()

    app.RegisterController(NewUserController(db))

    app.OnShutdown(func(ctx context.Context) error {
        return db.Close()
    })
}
```

## Full example

```
myapp/
├── main.go
├── config/
│   └── config.go
├── users/
│   ├── module.go
│   ├── controller.go
│   ├── service.go
│   └── repository.go
└── auth/
    ├── module.go
    ├── controller.go
    └── guard.go
```

```go
// config/config.go
package config

import "os"

type Config struct {
    ServiceName string
    Port        int
    Env         string
    DatabaseURL string
    JWTSecret   string
}

func Load() Config {
    return Config{
        ServiceName: getEnv("SERVICE_NAME", "my-api"),
        Port:        3000,
        Env:         getEnv("ENV", "development"),
        DatabaseURL: mustGetEnv("DATABASE_URL"),
        JWTSecret:   mustGetEnv("JWT_SECRET"),
    }
}
```

```go
// users/module.go
package users

import (
    "myapp/config"
    "github.com/slice-soft/ss-keel-core/core"
)

type Module struct {
    cfg config.Config
}

func New(cfg config.Config) *Module {
    return &Module{cfg: cfg}
}

func (m *Module) Register(app *core.App) {
    repo := NewRepository(m.cfg.DatabaseURL)
    service := NewService(repo, app.Logger())
    app.RegisterController(NewController(service))

    app.OnShutdown(func(ctx context.Context) error {
        return repo.Close(ctx)
    })
}
```

```go
// main.go
package main

import (
    "myapp/config"
    "myapp/auth"
    "myapp/users"
    "github.com/slice-soft/ss-keel-core/core"
)

func main() {
    cfg := config.Load()

    app := core.New(core.KConfig{
        ServiceName: cfg.ServiceName,
        Port:        cfg.Port,
        Env:         cfg.Env,
    })

    v1 := app.Group("/api/v1")
    v1.Use(auth.New(cfg))
    v1.Use(users.New(cfg))

    app.Listen()
}
```

## Addons

Official addon packages extend ss-keel-core with databases, cache, auth, messaging, and more. Each addon implements a core interface: add its fields to your `Config` and pass them to the module.

See [Addons](/addons) for the full list.

```go
// config/config.go — add addon fields as needed
type Config struct {
    ServiceName string
    Port        int
    Env         string
    DatabaseURL string  // used by ss-keel-gorm or ss-keel-mongo
    RedisURL    string  // used by ss-keel-redis
    JWTSecret   string  // used by ss-keel-jwt
}
```
