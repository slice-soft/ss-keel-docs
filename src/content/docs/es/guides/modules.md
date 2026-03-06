---
title: Módulos
description: Organiza tu aplicación en módulos autocontenidos y reutilizables.
---

Un **módulo** es una unidad autocontenida que registra sus rutas, controllers y servicios. Los módulos separan responsabilidades y permiten componer aplicaciones grandes de forma limpia.

## Interfaz Module

```go
type Module interface {
    Register(app *core.App)
}
```

Cualquier struct que implemente `Register(app *core.App)` es un módulo.

## Crear un módulo

Los módulos reciben configuración por constructor, evitando llamadas a `os.Getenv` dentro de la lógica de negocio. La configuración se carga una sola vez en `main.go` vía `config.Load()` y se propaga.

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
    // usa cfg; no os.Getenv aquí
    repo := NewRepository(m.cfg.DatabaseURL)
    service := NewService(repo)
    controller := NewController(service)

    app.RegisterController(controller)
}
```

## Registrar un módulo

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

## Módulos agrupados

Usa `Group` para montar módulos bajo un prefijo de ruta. Todos los controllers registrados dentro del grupo reciben ese prefijo.

```go
v1 := app.Group("/api/v1")

v1.Use(&users.UserModule{})
v1.Use(&auth.AuthModule{})
```

Rutas de `UserController` como `/users` pasan a `/api/v1/users`.

## Middleware de grupo

Puedes aplicar middleware a todas las rutas de un grupo:

```go
api := app.Group("/api/v1", authMiddleware, rateLimiter)
api.Use(&users.UserModule{})
```

Todas las rutas del grupo heredan esos middlewares.

## Módulo con shutdown hook

Los módulos pueden registrar funciones de limpieza para graceful shutdown:

```go
func (m *UserModule) Register(app *core.App) {
    db := connectDB()

    app.RegisterController(NewUserController(db))

    app.OnShutdown(func(ctx context.Context) error {
        return db.Close()
    })
}
```

## Ejemplo completo

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

Los paquetes addon oficiales extienden ss-keel-core con base de datos, cache, auth, mensajería y más. Cada addon implementa una interfaz del core: agrega sus campos a tu `Config` y pásalos al módulo.

Revisa [Addons](/addons) para el listado completo.

```go
// config/config.go — agrega campos de addons según necesidad
type Config struct {
    ServiceName string
    Port        int
    Env         string
    DatabaseURL string  // usado por ss-keel-gorm o ss-keel-mongo
    RedisURL    string  // usado por ss-keel-redis
    JWTSecret   string  // usado por ss-keel-jwt
}
```
