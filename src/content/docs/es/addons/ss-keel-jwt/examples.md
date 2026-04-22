---
title: Ejemplos de JWT
description: Ejemplos reales del addon JWT para login, proteccion de rutas y refresh de tokens.
---

El proyecto ejecutable oficial es [`ss-keel-examples/examples/11-jwt-addon`](https://github.com/slice-soft/ss-keel-examples/tree/main/examples/11-jwt-addon).

## Emitir un token desde login

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

## Proteger un grupo de rutas

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

## Refrescar un token existente

```go
newToken, err := jwtProvider.RefreshToken(body.Token)
if err != nil {
    return core.Unauthorized("invalid or expired token")
}
return c.OK(TokenResponse{Token: newToken, TokenType: "Bearer"})
```

## Ejemplo relacionado

[`ss-keel-oauth`](/es/addons/ss-keel-oauth/examples/) reutiliza el mismo signer pasando `jwtProvider` al manager OAuth.
