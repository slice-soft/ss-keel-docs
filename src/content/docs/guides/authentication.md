---
title: Authentication & Authorization
description: Protect routes with Guards and access the authenticated user in handlers.
---

ss-keel-core provides a `Guard` interface for authentication middleware, and a type-safe way to access the authenticated user inside handlers.

## The Guard Interface

```go
type Guard interface {
    Middleware() fiber.Handler
}
```

A `Guard` wraps any authentication logic into a Fiber middleware. When authentication fails, the guard should call `ctx.Next()` or return an error.

## Implementing a Guard

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
            return core.Unauthorized("missing authorization header")
        }

        user, err := parseJWT(token, g.secret)
        if err != nil {
            return core.Unauthorized("invalid token")
        }

        // Store the user in context for downstream handlers
        ctx := &core.Ctx{Ctx: c}
        ctx.SetUser(user)

        return c.Next()
    }
}
```

## Applying a Guard

### Per-Route

Attach a guard to individual routes with `.Use()`. The secret comes from your `config.Config`, not from `os.Getenv` directly:

```go
// cfg is config.Config loaded in main.go
guard := auth.NewJWTGuard(cfg.JWTSecret)

core.GET("/profile", profileHandler).
    Use(guard.Middleware()).
    WithSecured("bearerAuth")
```

### Per-Group

Apply a guard to all routes in a group:

```go
protected := app.Group("/api", guard.Middleware())
protected.Use(&users.Module{})
```

### Global (all routes)

You can apply middleware at the Fiber level via `app.Fiber()`:

```go
app.Fiber().Use(guard.Middleware())
```

## Accessing the Authenticated User

### Setting the User

Inside your guard middleware, call `SetUser` on the `Ctx`:

```go
ctx.SetUser(user) // user can be any type
```

### Reading the User

Use the generic `UserAs[T]` helper inside your handler:

```go
func (c *UserController) profile(ctx *core.Ctx) error {
    user, ok := core.UserAs[*User](ctx)
    if !ok {
        return core.Unauthorized("not authenticated")
    }

    return ctx.OK(user)
}
```

`UserAs[T]` performs a type-safe extraction — it returns `(T, bool)`, where `ok` is `false` if the user was not set or the type doesn't match.

## OpenAPI Security Schemes

Mark a route as secured and declare the scheme in your docs config:

```go
core.DELETE("/users/:id", deleteHandler).
    WithSecured("bearerAuth")
```

The security scheme is declared in `DocsConfig` (applied globally):

```go
core.KConfig{
    Docs: core.DocsConfig{
        // Bearer auth is automatically recognized by "bearerAuth" name
    },
}
```

## Full Example

```go
// auth/guard.go
type JWTGuard struct{ secret string }

func (g *JWTGuard) Middleware() fiber.Handler {
    return func(c *fiber.Ctx) error {
        raw := c.Get("Authorization") // "Bearer <token>"
        token := strings.TrimPrefix(raw, "Bearer ")

        claims, err := verifyJWT(token, g.secret)
        if err != nil {
            return core.Unauthorized("invalid or expired token")
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
    // JWTSecret comes from config, not os.Getenv
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

## Role-Based Authorization

Build authorization on top of `UserAs`:

```go
func RequireRole(role string) fiber.Handler {
    return func(c *fiber.Ctx) error {
        ctx := &core.Ctx{Ctx: c}
        user, ok := core.UserAs[*AuthUser](ctx)
        if !ok || user.Role != role {
            return core.Forbidden("insufficient permissions")
        }
        return c.Next()
    }
}

// Usage
core.DELETE("/users/:id", deleteHandler).
    Use(RequireRole("admin"))
```
