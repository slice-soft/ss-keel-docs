---
title: ss-keel-jwt
description: JWT generation, validation, and route protection guard for Keel.
---

`ss-keel-jwt` is the official JWT authentication addon for Keel.
It provides token generation, validation, token refresh, and a ready-to-use `Guard` that protects routes via the `Authorization` header.

**Implements:** [`Guard`](/en/reference/interfaces#guard), [`TokenSigner`](/en/reference/interfaces#tokensigner)
**Current stable release:** `v1.8.0` (2026-04-22)

## Browse this addon

- [Overview](/en/addons/ss-keel-jwt/overview/)
- [Installation](/en/addons/ss-keel-jwt/installation/)
- [Configuration](/en/addons/ss-keel-jwt/configuration/)
- [Examples](/en/addons/ss-keel-jwt/examples/)

## Installation

```bash
keel add jwt
```

Or manually:

```bash
go get github.com/slice-soft/ss-keel-jwt
```

## Bootstrap

When you run `keel add jwt`, the CLI creates `cmd/setup_jwt.go` and adds one line to `cmd/main.go`:

```go
// cmd/setup_jwt.go — created by keel add jwt
package main

import (
    "strings"

    "github.com/slice-soft/ss-keel-core/config"
    "github.com/slice-soft/ss-keel-core/core"
    "github.com/slice-soft/ss-keel-core/logger"
    "github.com/slice-soft/ss-keel-jwt/jwt"
)

type jwtSetupConfig struct {
    AppName       string `keel:"app.name,required"`
    SecretKey     string `keel:"jwt.secret,required"`
    Issuer        string `keel:"jwt.issuer"`
    TokenTTLHours uint   `keel:"jwt.token-ttl-hours,required"`
}

// setupJWT initialises the JWT provider used for token signing and route protection.
// The issuer defaults to app.name so tokens are namespaced per service.
func setupJWT(app *core.App, log *logger.Logger) *jwt.JWT {
    _ = app // reserved for future health checker support

    jwtConfig := config.MustLoadConfig[jwtSetupConfig]()
    issuer := strings.TrimSpace(jwtConfig.Issuer)
    if issuer == "" {
        issuer = jwtConfig.AppName
    }

    jwtProvider, err := jwt.New(jwt.Config{
        SecretKey:     jwtConfig.SecretKey,
        Issuer:        issuer,
        TokenTTLHours: jwtConfig.TokenTTLHours,
        Logger:        log,
    })
    if err != nil {
        log.Error("failed to initialize JWT: %v", err)
    }
    return jwtProvider
}
```

The following is injected into `cmd/main.go`:

```go
jwtProvider := setupJWT(app, appLogger)
_ = jwtProvider
```

`_ = jwtProvider` is a placeholder that keeps the code compilable until you wire a protected route or install the OAuth addon. Replace it with your actual usage — for example:

```go
protected := app.Group("/api", jwtProvider.Middleware())
```

Defaults applied when fields are not set:

| Field | Default |
|---|---|
| `Issuer` | `app.name` from `application.properties` |
| `TokenTTLHours` | `24` |

## Generate a token

```go
token, err := jwtProvider.GenerateToken(map[string]any{
    "userID": user.ID,
    "role":   user.Role,
})
```

The payload is stored in the `"data"` claim. Standard claims (`iss`, `iat`, `exp`) are set automatically.

## Protect routes

`jwt.JWT` implements `contracts.Guard`. Pass `Middleware()` to any route:

```go
httpx.GET("/profile", profileHandler).
    Use(jwtProvider.Middleware()).
    WithSecured("bearerAuth")
```

The middleware reads the `Authorization` header, validates the token (with or without the `Bearer ` prefix), and stores the parsed claims in the request context. It returns `401` on missing or invalid tokens.

## Access the authenticated payload

```go
func profileHandler(c *httpx.Ctx) error {
    claims, ok := jwt.ClaimsFromCtx(c.Ctx)
    if !ok {
        return c.Status(401).JSON(fiber.Map{"error": "not authenticated"})
    }

    data := claims["data"].(map[string]any)
    return c.OK(fiber.Map{
        "userID": data["userID"],
        "role":   data["role"],
    })
}
```

`ClaimsFromCtx` returns `(nil, false)` when the route is not protected by the JWT guard.

## Refresh tokens

```go
newToken, err := jwtProvider.RefreshToken(oldToken)
```

`RefreshToken` validates the given token, resets `iat` and `exp`, and returns a new signed token. The `"data"` payload is preserved unchanged.

## Validate a token manually

```go
claims, err := jwtProvider.ValidateToken(tokenString)
```

Useful in non-HTTP contexts such as WebSocket handshakes or background jobs that receive a token as input.

## Use with ss-keel-oauth

`*jwt.JWT` implements `contracts.TokenSigner`, so it can be passed directly to the OAuth addon as the token signer:

```go
oauthProvider := oauth.New(oauth.Config{
    Google: &oauth.ProviderConfig{...},
    Signer: jwtProvider, // satisfies contracts.TokenSigner
    Logger: appLogger,
})
```

After a successful OAuth flow, the callback handler calls `jwtProvider.Sign(subject, claims)` internally, which produces a standard HS256 token with:
- `sub` — provider-scoped user ID (e.g. `"google:1234567890"`)
- `data` — user claims (`email`, `name`, `avatar_url`, `provider`)
- `iss`, `iat`, `exp` — set automatically from the JWT config

The resulting token can be validated with `jwtProvider.ValidateToken` and its payload accessed via `jwt.ClaimsFromCtx` in protected routes.

## Environment variables

| Variable | Example | Description |
|---|---|---|
| `JWT_SECRET` | `change-me-in-production` | HMAC secret used to sign and verify tokens |
| `JWT_ISSUER` | `my-app` | Token issuer claim (`iss`). The generated Keel setup falls back to `app.name` when empty |
| `JWT_TOKEN_TTL_HOURS` | `24` | Token time-to-live in hours |

See [Authentication](/en/guides/authentication) for the authentication overview.
