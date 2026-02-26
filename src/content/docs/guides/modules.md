---
title: Modules
description: Organize your application into self-contained, reusable modules.
---

A **module** is a self-contained unit that registers its own routes, controllers, and services. Modules keep concerns separated and allow you to compose large applications cleanly.

## The Module Interface

```go
type Module interface {
    Register(app *core.App)
}
```

Any struct implementing `Register(app *core.App)` is a module.

## Creating a Module

Modules receive configuration through their constructor, keeping `os.Getenv` calls out of business logic. Configuration is loaded once in `main.go` via `config.Load()` and passed down.

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
    // use cfg fields — no os.Getenv here
    repo := NewRepository(m.cfg.DatabaseURL)
    service := NewService(repo)
    controller := NewController(service)

    app.RegisterController(controller)
}
```

## Registering a Module

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

## Grouped Modules

Use `Group` to mount a module under a path prefix. All controllers registered inside the group will have the prefix prepended to their routes.

```go
v1 := app.Group("/api/v1")

v1.Use(&users.UserModule{})
v1.Use(&auth.AuthModule{})
```

Routes from `UserController` with paths like `/users` will become `/api/v1/users`.

## Group Middleware

You can apply middleware to all routes in a group:

```go
api := app.Group("/api/v1", authMiddleware, rateLimiter)
api.Use(&users.UserModule{})
```

Every route registered inside the group inherits those middlewares.

## Module with Shutdown Hook

Modules can register cleanup functions that run during graceful shutdown:

```go
func (m *UserModule) Register(app *core.App) {
    db := connectDB()

    app.RegisterController(NewUserController(db))

    app.OnShutdown(func(ctx context.Context) error {
        return db.Close()
    })
}
```

## Full Example

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

Official addon packages extend ss-keel-core with databases, cache, auth, messaging, and more. Each addon implements a core interface — add it to your `Config` and pass it through the module.

See the [Addons](/addons) section for the full list.

```go
// config/config.go — add addon-specific fields as needed
type Config struct {
    ServiceName string
    Port        int
    Env         string
    DatabaseURL string  // used by ss-keel-gorm or ss-keel-mongo
    RedisURL    string  // used by ss-keel-redis
    JWTSecret   string  // used by ss-keel-jwt
}
```
