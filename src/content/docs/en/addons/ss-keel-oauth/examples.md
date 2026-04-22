---
title: OAuth Examples
description: Real provider login and JWT-protected route examples using ss-keel-oauth.
---

The official runnable project is [`ss-keel-examples/examples/12-oauth`](https://github.com/slice-soft/ss-keel-examples/tree/main/examples/12-oauth).

## Build the manager from typed config

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

## Register the OAuth controller and protect a route

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

## Development helper

The same example also includes `POST /auth/verify`, which validates a raw JWT and returns the decoded claims for inspection.
