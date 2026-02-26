---
title: ss-keel-jwt
description: JWT generation, validation, and ready-to-use authentication guards.
---

:::caution[Coming Soon]
This addon is under development. The interface it implements is stable — see [Guard](/reference/interfaces#guard).
:::

`ss-keel-jwt` provides JWT generation and validation with a ready-to-use `Guard` implementation. Sign tokens at login, protect routes with the guard, and access the authenticated user anywhere in the handler chain.

**Implements:** [`Guard`](/reference/interfaces#guard)

## Planned Installation

```bash
go get github.com/slice-soft/ss-keel-jwt
```

## Planned Usage

### Setup

```go
import "github.com/slice-soft/ss-keel-jwt"

jwtService := ssjwt.New(ssjwt.Config{
    Secret:     os.Getenv("JWT_SECRET"),
    Expiration: 24 * time.Hour,
})
```

### Generating a Token

```go
// On login
token, err := jwtService.Sign(ssjwt.Claims{
    Subject: user.ID,
    Custom: map[string]any{
        "role":  user.Role,
        "email": user.Email,
    },
})
```

### Protecting Routes

```go
guard := jwtService.Guard()

// Per-route
core.GET("/profile", profileHandler).
    Use(guard.Middleware()).
    WithSecured("bearerAuth")

// Per-group
protected := app.Group("/api/v1", guard.Middleware())
protected.Use(&users.Module{})
```

### Accessing the Authenticated User

```go
func profileHandler(c *core.Ctx) error {
    claims, ok := core.UserAs[*ssjwt.Claims](c)
    if !ok {
        return core.Unauthorized("not authenticated")
    }

    return c.OK(map[string]any{
        "id":   claims.Subject,
        "role": claims.Custom["role"],
    })
}
```

### Refresh Tokens

```go
// Generate a refresh token with longer TTL
refreshToken, _ := jwtService.SignRefresh(ssjwt.Claims{
    Subject: user.ID,
})

// Validate and rotate
newToken, err := jwtService.Refresh(refreshToken)
```
