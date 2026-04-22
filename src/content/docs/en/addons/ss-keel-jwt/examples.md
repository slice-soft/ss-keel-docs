---
title: JWT Examples
description: Real JWT addon examples for login, route protection, and token refresh.
---

The official runnable project is [`ss-keel-examples/examples/11-jwt-addon`](https://github.com/slice-soft/ss-keel-examples/tree/main/examples/11-jwt-addon).

## Issue a token from a login endpoint

```go
token, err := jwtProvider.GenerateToken(map[string]any{
    "user_id": entry.user.ID,
    "name":    entry.user.Name,
    "email":   entry.user.Email,
    "role":    entry.user.Role,
})
if err != nil {
    return core.Internal("could not issue token", err)
}
return c.OK(TokenResponse{Token: token, TokenType: "Bearer"})
```

## Protect a route group

```go
api := app.Group("/api", jwtProvider.Middleware())
api.RegisterController(contracts.ControllerFunc[httpx.Route](func() []httpx.Route {
    return []httpx.Route{
        httpx.GET("/me", func(c *httpx.Ctx) error {
            claims, _ := jwt.ClaimsFromCtx(c.Ctx)
            data, _ := claims["data"].(map[string]any)
            return c.OK(data)
        }).WithSecured("bearerAuth"),
    }
}))
```

## Refresh an existing token

```go
newToken, err := jwtProvider.RefreshToken(body.Token)
if err != nil {
    return core.Unauthorized("invalid or expired token")
}
return c.OK(TokenResponse{Token: newToken, TokenType: "Bearer"})
```

## Related example

[`ss-keel-oauth`](/en/addons/ss-keel-oauth/examples/) builds on the same signer by passing `jwtProvider` into the OAuth manager.
