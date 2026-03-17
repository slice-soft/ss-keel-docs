---
title: Authentication & Authorization
description: Protect routes with Guards and access the authenticated user inside handlers.
---

ss-keel-core provides a `Guard` interface for authentication middleware and a typed way to access the authenticated user inside handlers.

## Guard interface

```go
type Guard interface {
    Middleware() fiber.Handler
}
```

A `Guard` encapsulates authentication logic in a Fiber middleware. When authentication fails, the guard should return an error or call `ctx.Next()` depending on your flow.

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

        // Store the user in context for subsequent handlers
        ctx := &httpx.Ctx{Ctx: c}
        ctx.SetUser(user)

        return c.Next()
    }
}
```

## Applying a Guard

### Per route

Attach a guard to specific routes with `.Use()`. The secret should come from `config.Config`, not directly from `os.Getenv`:

```go
// cfg is config.Config loaded in main.go
guard := auth.NewJWTGuard(cfg.JWTSecret)

httpx.GET("/profile", profileHandler).
    Use(guard.Middleware()).
    WithSecured("bearerAuth")
```

### Per group

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

## Accessing the authenticated user

### Storing the user

Inside the guard middleware, use `SetUser` on `Ctx`:

```go
ctx.SetUser(user) // user can be any type
```

### Reading the user

Use the generic helper `UserAs[T]` in your handler:

```go
func (c *UserController) profile(ctx *httpx.Ctx) error {
    user, ok := core.UserAs[*User](ctx)
    if !ok {
        return core.Unauthorized("not authenticated")
    }

    return ctx.OK(user)
}
```

`UserAs[T]` performs typed extraction and returns `(T, bool)`, where `ok` is `false` if there is no user or the type doesn't match.

## OpenAPI security schemes

Mark a route as secured and declare the scheme in the docs configuration:

```go
httpx.DELETE("/users/:id", deleteHandler).
    WithSecured("bearerAuth").
    WithResponse(httpx.WithResponse[struct{}](204))
```

The scheme is declared in `DocsConfig` (applied globally):

```go
core.KConfig{
    Docs: core.DocsConfig{
        // Bearer auth is automatically recognized by the name "bearerAuth"
    },
}
```

## Full example

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

        ctx := &httpx.Ctx{Ctx: c}
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
    // JWTSecret comes from config, not from os.Getenv
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

## Role-based authorization

Build authorization on top of `UserAs`:

```go
func RequireRole(role string) fiber.Handler {
    return func(c *fiber.Ctx) error {
        ctx := &httpx.Ctx{Ctx: c}
        user, ok := core.UserAs[*AuthUser](ctx)
        if !ok || user.Role != role {
            return core.Forbidden("insufficient permissions")
        }
        return c.Next()
    }
}

// Usage
httpx.DELETE("/users/:id", deleteHandler).
    Use(RequireRole("admin")).
    WithResponse(httpx.WithResponse[struct{}](204))
```
