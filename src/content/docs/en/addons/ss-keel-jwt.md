---
title: ss-keel-jwt
description: JWT generation and validation with ready-to-use authentication guards.
---

:::caution[Coming Soon]
This addon is under development. The interface it implements is already stable. See [Guard](/en/reference/interfaces#guard).
:::

`ss-keel-jwt` provides JWT generation and validation with a ready-to-use `Guard` implementation. Sign tokens at login, protect routes with the guard, and access the authenticated user at any point in the handler chain.

**Implements:** [`Guard`](/en/reference/interfaces#guard)

## Installation (planned)

```bash
go get github.com/slice-soft/ss-keel-jwt
```

## Usage (planned)

### Initial setup

```go
import "github.com/slice-soft/ss-keel-jwt"

jwtService := ssjwt.New(ssjwt.Config{
    Secret:     os.Getenv("JWT_SECRET"),
    Expiration: 24 * time.Hour,
})
```

### Generate a token

```go
// At login
token, err := jwtService.Sign(ssjwt.Claims{
    Subject: user.ID,
    Custom: map[string]any{
        "role":  user.Role,
        "email": user.Email,
    },
})
```

### Protect routes

```go
guard := jwtService.Guard()

// Per route
httpx.GET("/profile", profileHandler).
    Use(guard.Middleware()).
    WithSecured("bearerAuth")

// Per group
protected := app.Group("/api/v1", guard.Middleware())
protected.Use(&users.Module{})
```

### Access the authenticated user

```go
func profileHandler(c *httpx.Ctx) error {
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

### Refresh tokens

```go
// Generate refresh token with longer TTL
refreshToken, _ := jwtService.SignRefresh(ssjwt.Claims{
    Subject: user.ID,
})

// Validate and rotate
newToken, err := jwtService.Refresh(refreshToken)
```
