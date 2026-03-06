---
title: Autenticación y Autorización
description: Protege rutas con Guards y accede al usuario autenticado dentro de los handlers.
---

ss-keel-core provee una interfaz `Guard` para middleware de autenticación y una forma tipada de acceder al usuario autenticado dentro de los handlers.

## Interfaz Guard

```go
type Guard interface {
    Middleware() fiber.Handler
}
```

Un `Guard` encapsula la lógica de autenticación en un middleware de Fiber. Cuando la autenticación falla, el guard debe devolver un error o continuar con `ctx.Next()` según tu flujo.

## Implementar un Guard

```go
package auth

import (
    "github.com/gofiber/fiber/v2"
    "github.com/slice-soft/ss-keel-core/core"
)

type JWTGuard struct {
    secret string
}

func NewJWTGuard(secret string) *JWTGuard {
    return &JWTGuard{secret: secret}
}

func (g *JWTGuard) Middleware() fiber.Handler {
    return func(c *fiber.Ctx) error {
        token := c.Get("Authorization")
        if token == "" {
            return core.Unauthorized("falta el header de autorización")
        }

        user, err := parseJWT(token, g.secret)
        if err != nil {
            return core.Unauthorized("token inválido")
        }

        // Guarda el usuario en el contexto para handlers posteriores
        ctx := &core.Ctx{Ctx: c}
        ctx.SetUser(user)

        return c.Next()
    }
}
```

## Aplicar un Guard

### Por ruta

Adjunta un guard a rutas puntuales con `.Use()`. El secreto debe venir de `config.Config`, no de `os.Getenv` directamente:

```go
// cfg es config.Config cargado en main.go
guard := auth.NewJWTGuard(cfg.JWTSecret)

core.GET("/profile", profileHandler).
    Use(guard.Middleware()).
    WithSecured("bearerAuth")
```

### Por grupo

Aplica un guard a todas las rutas de un grupo:

```go
protected := app.Group("/api", guard.Middleware())
protected.Use(&users.Module{})
```

### Global (todas las rutas)

Puedes aplicar middleware a nivel Fiber vía `app.Fiber()`:

```go
app.Fiber().Use(guard.Middleware())
```

## Acceder al usuario autenticado

### Guardar el usuario

Dentro del middleware del guard, usa `SetUser` sobre `Ctx`:

```go
ctx.SetUser(user) // user puede ser cualquier tipo
```

### Leer el usuario

Usa el helper genérico `UserAs[T]` en tu handler:

```go
func (c *UserController) profile(ctx *core.Ctx) error {
    user, ok := core.UserAs[*User](ctx)
    if !ok {
        return core.Unauthorized("no autenticado")
    }

    return ctx.OK(user)
}
```

`UserAs[T]` hace extracción tipada y devuelve `(T, bool)`, donde `ok` es `false` si no hay usuario o el tipo no coincide.

## Esquemas de seguridad OpenAPI

Marca una ruta como protegida y declara el esquema en la configuración de docs:

```go
core.DELETE("/users/:id", deleteHandler).
    WithSecured("bearerAuth")
```

El esquema se declara en `DocsConfig` (aplicado globalmente):

```go
core.KConfig{
    Docs: core.DocsConfig{
        // Bearer auth es reconocido automáticamente por el nombre "bearerAuth"
    },
}
```

## Ejemplo completo

```go
// auth/guard.go
type JWTGuard struct{ secret string }

func (g *JWTGuard) Middleware() fiber.Handler {
    return func(c *fiber.Ctx) error {
        raw := c.Get("Authorization") // "Bearer <token>"
        token := strings.TrimPrefix(raw, "Bearer ")

        claims, err := verifyJWT(token, g.secret)
        if err != nil {
            return core.Unauthorized("token inválido o expirado")
        }

        ctx := &core.Ctx{Ctx: c}
        ctx.SetUser(&AuthUser{ID: claims.Subject, Role: claims.Role})
        return c.Next()
    }
}

// auth/module.go
package auth

import (
    "myapp/config"
    "github.com/slice-soft/ss-keel-core/core"
)

type Module struct {
    cfg   config.Config
    guard *JWTGuard
}

func New(cfg config.Config) *Module {
    return &Module{cfg: cfg}
}

func (m *Module) Register(app *core.App) {
    // JWTSecret viene de config, no de os.Getenv
    m.guard = NewJWTGuard(m.cfg.JWTSecret)
    app.RegisterController(NewAuthController())
}

func (m *Module) Guard() *JWTGuard {
    return m.guard
}

// main.go
cfg := config.Load()

authModule := auth.New(cfg)
app.Use(authModule)

protected := app.Group("/api/v1", authModule.Guard().Middleware())
protected.Use(users.New(cfg))
```

## Autorización por roles

Construye autorización encima de `UserAs`:

```go
func RequireRole(role string) fiber.Handler {
    return func(c *fiber.Ctx) error {
        ctx := &core.Ctx{Ctx: c}
        user, ok := core.UserAs[*AuthUser](ctx)
        if !ok || user.Role != role {
            return core.Forbidden("permisos insuficientes")
        }
        return c.Next()
    }
}

// Uso
core.DELETE("/users/:id", deleteHandler).
    Use(RequireRole("admin"))
```
