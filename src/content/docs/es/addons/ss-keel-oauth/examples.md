---
title: Ejemplos de OAuth
description: Ejemplos reales de login con proveedores y rutas protegidas usando ss-keel-oauth.
---

El proyecto ejecutable oficial es [`ss-keel-examples/examples/12-oauth`](https://github.com/slice-soft/ss-keel-examples/tree/main/examples/12-oauth).

## Construir el manager desde config tipada

```go
oauthManager := oauth.New(oauth.Config{
    Signer: jwtProvider,
    Logger: log,
    Google: oauthProviderConfig(redirectBase, routePrefix, enabledProviders, oauth.ProviderGoogle,
        cfg.OAuthGoogleClientID,
        cfg.OAuthGoogleSecret,
    ),
    GitHub: oauthProviderConfig(redirectBase, routePrefix, enabledProviders, oauth.ProviderGitHub,
        cfg.OAuthGitHubClientID,
        cfg.OAuthGitHubSecret,
    ),
    GitLab: oauthProviderConfig(redirectBase, routePrefix, enabledProviders, oauth.ProviderGitLab,
        cfg.OAuthGitLabClientID,
        cfg.OAuthGitLabSecret,
    ),
    RedirectOnSuccess:  redirectOnSuccess,
    RedirectTokenParam: redirectTokenParam,
})
```

## Registrar el controller y proteger una ruta

```go
app.RegisterController(oauth.NewController(oauthManager, routePrefix))

api := app.Group("/api", jwtProvider.Middleware())
api.RegisterController(contracts.ControllerFunc[httpx.Route](func() []httpx.Route {
    return []httpx.Route{
        httpx.GET("/me", func(c *httpx.Ctx) error {
            claims, ok := jwt.ClaimsFromCtx(c.Ctx)
            if !ok {
                return core.Unauthorized("missing claims")
            }
            return c.OK(map[string]any{
                "subject": claims["sub"],
                "data":    claims["data"],
            })
        }).WithSecured("bearerAuth"),
    }
}))
```

## Helper para desarrollo

El mismo ejemplo incluye `POST /auth/verify`, que valida un JWT crudo y devuelve los claims decodificados para inspeccion.
