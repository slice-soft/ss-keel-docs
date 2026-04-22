---
title: JWT Overview
description: What ss-keel-jwt adds to a Keel service and where it fits in the auth stack.
---

`ss-keel-jwt` is the official bearer-token addon for Keel.

**Current stable release:** `v1.8.0` (2026-04-22)  
**Implements:** [`Guard`](/en/reference/interfaces#guard), [`TokenSigner`](/en/reference/interfaces#tokensigner)

## What you get

- HS256 token generation, validation, and refresh.
- Route protection through `jwtProvider.Middleware()`.
- Request-scoped claim access through `jwt.ClaimsFromCtx(...)`.
- A signer that plugs directly into [`ss-keel-oauth`](/en/addons/ss-keel-oauth/).

## When to use it

- Password or API login flows that issue bearer tokens.
- Protected route groups in HTTP APIs.
- Service-to-service tokens with a stable issuer.
- OAuth callbacks that must return a signed JWT after provider login.

## Core runtime surface

The addon centers around `*jwt.JWT`:

```go
jwtProvider, err := jwt.New(jwt.Config{
    SecretKey:     "change-me-in-production",
    Issuer:        "my-app",
    TokenTTLHours: 24,
    Logger:        appLogger,
})
```

From there you can call:

- `GenerateToken(...)`
- `ValidateToken(...)`
- `RefreshToken(...)`
- `Middleware()`

## Continue with

- [Installation](/en/addons/ss-keel-jwt/installation/)
- [Configuration](/en/addons/ss-keel-jwt/configuration/)
- [Examples](/en/addons/ss-keel-jwt/examples/)
