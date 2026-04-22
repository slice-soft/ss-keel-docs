---
title: Configuracion de OAuth
description: Claves generadas, comportamiento del callback y helpers de setup para ss-keel-oauth.
---

El archivo generado usa configuracion tipada y funciones helper:

```go
type oauthSetupConfig struct {
    GoogleClientID     string `keel:"oauth.google.client-id"`
    GoogleClientSecret string `keel:"oauth.google.client-secret"`
    GitHubClientID     string `keel:"oauth.github.client-id"`
    GitHubClientSecret string `keel:"oauth.github.client-secret"`
    GitLabClientID     string `keel:"oauth.gitlab.client-id"`
    GitLabClientSecret string `keel:"oauth.gitlab.client-secret"`
    RedirectBaseURL    string `keel:"oauth.redirect-base-url,required"`
    RoutePrefix        string `keel:"oauth.route-prefix,required"`
    EnabledProviders   string `keel:"oauth.enabled-providers"`
    RedirectOnSuccess  string `keel:"oauth.redirect-on-success"`
    RedirectTokenParam string `keel:"oauth.redirect-token-param,required"`
}
```

## Claves generadas

| application.properties | .env | Proposito |
|---|---|---|
| `oauth.google.client-id` | `OAUTH_GOOGLE_CLIENT_ID` | Client ID de Google |
| `oauth.google.client-secret` | `OAUTH_GOOGLE_CLIENT_SECRET` | Client secret de Google |
| `oauth.github.client-id` | `OAUTH_GITHUB_CLIENT_ID` | Client ID de GitHub |
| `oauth.github.client-secret` | `OAUTH_GITHUB_CLIENT_SECRET` | Client secret de GitHub |
| `oauth.gitlab.client-id` | `OAUTH_GITLAB_CLIENT_ID` | App ID de GitLab |
| `oauth.gitlab.client-secret` | `OAUTH_GITLAB_CLIENT_SECRET` | Client secret de GitLab |
| `oauth.redirect-base-url` | `OAUTH_REDIRECT_BASE_URL` | URL base para construir callbacks |
| `oauth.route-prefix` | `OAUTH_ROUTE_PREFIX` | Prefijo de rutas del controller generado |
| `oauth.enabled-providers` | `OAUTH_ENABLED_PROVIDERS` | Allowlist opcional de providers |
| `oauth.redirect-on-success` | `OAUTH_REDIRECT_ON_SUCCESS` | URL opcional del frontend |
| `oauth.redirect-token-param` | `OAUTH_REDIRECT_TOKEN_PARAM` | Nombre del query param del token |

## Modos de callback

- El modo JSON devuelve `{ "token": "<jwt>" }`.
- El modo redirect agrega el token a la URL del frontend configurada.

Configura `OAUTH_ENABLED_PROVIDERS=google,github` cuando quieras exponer solo un subconjunto de providers configurados.
