---
title: ss-keel-oauth
description: Addon de autenticación OAuth2 para Keel — proveedores Google, GitHub y GitLab con emisión de JWT en el callback.
---

`ss-keel-oauth` agrega autenticación OAuth2 a cualquier aplicación Keel.
Tras un flujo exitoso con el proveedor, el addon firma un JWT y lo devuelve al cliente —
como JSON o como redirect con el token en el query string.

**Proveedores soportados:** Google · GitHub · GitLab

## Instalación

```bash
keel add oauth
```

Si `jwt` todavía no está instalado, el CLI ofrece instalarlo primero:

```text
Install "jwt" now? [Y/n]
```

Presionar Enter acepta el default e instala la dependencia automáticamente antes de `oauth`.

O de forma manual:

```bash
go get github.com/slice-soft/ss-keel-oauth
```

## Bootstrap

Cuando ejecutas `keel add oauth`, el CLI crea `cmd/setup_oauth.go`, conserva el binding `jwtProvider := setupJWT(app, appLogger)` del addon JWT e inyecta `setupOAuth(app, jwtProvider, appLogger)` en `cmd/main.go`.

El archivo generado usa configuración tipada cargada desde `application.properties`:

```go
package main

import (
    "strings"

    "github.com/slice-soft/ss-keel-core/config"
    "github.com/slice-soft/ss-keel-core/core"
    "github.com/slice-soft/ss-keel-core/logger"
    "github.com/slice-soft/ss-keel-jwt/jwt"
    "github.com/slice-soft/ss-keel-oauth/oauth"
)

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

func setupOAuth(app *core.App, jwtProvider *jwt.JWT, log *logger.Logger) {
    oauthConfig := config.MustLoadConfig[oauthSetupConfig]()
    routePrefix := normalizeOAuthRoutePrefix(oauthConfig.RoutePrefix)
    redirectBase := normalizeOAuthRedirectBase(oauthConfig.RedirectBaseURL)
    redirectOnSuccess := normalizeOAuthSuccessRedirect(oauthConfig.RedirectOnSuccess)
    redirectTokenParam := normalizeOAuthRedirectTokenParam(oauthConfig.RedirectTokenParam)
    enabledProviders := parseOAuthEnabledProviders(oauthConfig.EnabledProviders)

    oauthManager := oauth.New(oauth.Config{
        Google: oauthProviderConfig(redirectBase, routePrefix, enabledProviders, oauth.ProviderGoogle, oauthConfig.GoogleClientID, oauthConfig.GoogleClientSecret),
        GitHub: oauthProviderConfig(redirectBase, routePrefix, enabledProviders, oauth.ProviderGitHub, oauthConfig.GitHubClientID, oauthConfig.GitHubClientSecret),
        GitLab: oauthProviderConfig(redirectBase, routePrefix, enabledProviders, oauth.ProviderGitLab, oauthConfig.GitLabClientID, oauthConfig.GitLabClientSecret),
        Signer:             jwtProvider,
        Logger:             log,
        RedirectOnSuccess:  redirectOnSuccess,
        RedirectTokenParam: redirectTokenParam,
    })
    app.RegisterController(oauth.NewController(oauthManager, routePrefix))
}
```

El mismo archivo generado también incluye `oauthProviderConfig`, `parseOAuthEnabledProviders`, `normalizeOAuthRoutePrefix`, `normalizeOAuthRedirectBase`, `normalizeOAuthSuccessRedirect` y `normalizeOAuthRedirectTokenParam`. La base de redirect usa `http://127.0.0.1:7331` por defecto cuando queda vacía.

`NewController` sigue aceptando un prefijo opcional si cableas el addon manualmente:

```go
app.RegisterController(oauth.NewController(oauthManager, "/sign-in"))
// → GET /sign-in/google, GET /sign-in/google/callback, ...
```

Si necesitas rutas personalizadas para proveedores individuales, usa los handlers directamente:

```go
httpx.GET("/login/google",          oauthManager.LoginHandler(oauth.ProviderGoogle))
httpx.GET("/login/google/callback", oauthManager.CallbackHandler(oauth.ProviderGoogle))
```

## Proveedores

Configura solo los proveedores que necesitas — un proveedor se omite cuando su `ProviderConfig` es `nil` o está incompleto.

### Google

```go
Google: &oauth.ProviderConfig{
    ClientID:     os.Getenv("OAUTH_GOOGLE_CLIENT_ID"),
    ClientSecret: os.Getenv("OAUTH_GOOGLE_CLIENT_SECRET"),
    RedirectURL:  "https://miapp.com/auth/google/callback",
    // Scopes por defecto: ["openid", "email", "profile"]
},
```

Credenciales: [console.cloud.google.com → APIs y Servicios → Credenciales](https://console.cloud.google.com/apis/credentials)

### GitHub

```go
GitHub: &oauth.ProviderConfig{
    ClientID:     os.Getenv("OAUTH_GITHUB_CLIENT_ID"),
    ClientSecret: os.Getenv("OAUTH_GITHUB_CLIENT_SECRET"),
    RedirectURL:  "https://miapp.com/auth/github/callback",
    // Scopes por defecto: ["read:user", "user:email"]
},
```

Credenciales: [github.com/settings/developers → OAuth Apps](https://github.com/settings/developers)

Cuando el email del usuario está configurado como privado en GitHub, el addon llama
automáticamente a `/user/emails` para obtener la dirección primaria verificada.

### GitLab

```go
GitLab: &oauth.ProviderConfig{
    ClientID:     os.Getenv("OAUTH_GITLAB_CLIENT_ID"),
    ClientSecret: os.Getenv("OAUTH_GITLAB_CLIENT_SECRET"),
    RedirectURL:  "https://miapp.com/auth/gitlab/callback",
    // Scopes por defecto: ["read_user"]
},
```

Credenciales: [gitlab.com/-/user_settings/applications](https://gitlab.com/-/user_settings/applications)

> Las instancias de GitLab auto-alojadas no están soportadas en el proveedor por defecto.

## Variables de entorno

| Variable | Descripción |
|---|---|
| `OAUTH_GOOGLE_CLIENT_ID` | Client ID de Google |
| `OAUTH_GOOGLE_CLIENT_SECRET` | Client secret de Google |
| `OAUTH_GITHUB_CLIENT_ID` | Client ID de GitHub |
| `OAUTH_GITHUB_CLIENT_SECRET` | Client secret de GitHub |
| `OAUTH_GITLAB_CLIENT_ID` | Application ID de GitLab |
| `OAUTH_GITLAB_CLIENT_SECRET` | Client secret de GitLab |
| `OAUTH_REDIRECT_BASE_URL` | URL base para construir las callback URLs (valor dev por defecto: `http://127.0.0.1:7331`) |
| `OAUTH_ROUTE_PREFIX` | Prefijo de ruta usado por el controller OAuth generado (default: `/auth`) |
| `OAUTH_ENABLED_PROVIDERS` | Lista opcional separada por comas para permitir proveedores (`google,github,gitlab`) |
| `OAUTH_REDIRECT_ON_SUCCESS` | URL opcional del frontend usada para el modo redirect después de firmar el JWT |
| `OAUTH_REDIRECT_TOKEN_PARAM` | Nombre del query parameter usado cuando `OAUTH_REDIRECT_ON_SUCCESS` está activo (default: `token`) |

El `cmd/setup_oauth.go` generado por `keel add oauth` lee credenciales de los tres proveedores, construye las callback URLs desde `OAUTH_REDIRECT_BASE_URL`, soporta el modo redirect vía variables de entorno y solo activa los providers con credenciales completas. `OAUTH_ENABLED_PROVIDERS` permite restringir aún más qué rutas se exponen. Cuando `jwt` se instaló antes de forma standalone, el CLI también reemplaza la línea placeholder `_ = jwtProvider` por `setupOAuth(app, jwtProvider, appLogger)` e imprime un snippet de seguimiento para una ruta protegida `/api/me` que consume claims JWT.

## Interfaz TokenSigner

`ss-keel-oauth` **no** importa `ss-keel-jwt` directamente.
Depende de la interfaz `contracts.TokenSigner` definida en `ss-keel-core`:

```go
// contracts.TokenSigner
type TokenSigner interface {
    Sign(subject string, data map[string]any) (string, error)
}
```

`ss-keel-jwt` satisface esta interfaz — pasa `jwtProvider` directamente:

```go
oauth.New(oauth.Config{
    Signer: jwtProvider, // *jwt.JWT implementa contracts.TokenSigner
    ...
})
```

El `subject` tiene el formato `"<proveedor>:<user-id>"` (p.ej. `"google:1234567890"`).
El mapa `data` que envía el callback incluye:

| Clave | Valor |
|---|---|
| `email` | Email primario verificado |
| `name` | Nombre de visualización |
| `avatar_url` | URL de la foto de perfil |
| `provider` | Nombre del proveedor: `"google"`, `"github"` o `"gitlab"` |

También puedes proveer una implementación personalizada:

```go
type miJwtSigner struct{}

func (s *miJwtSigner) Sign(subject string, data map[string]any) (string, error) {
    // tu lógica de firma JWT
}
```

## Struct UserInfo

Tras un callback exitoso el proveedor devuelve un `UserInfo` normalizado:

```go
type UserInfo struct {
    Provider  oauth.ProviderName // "google", "github", "gitlab"
    ID        string             // ID único del usuario en el proveedor
    Email     string             // email primario verificado, o vacío
    Name      string             // nombre de visualización
    AvatarURL string             // URL de la foto de perfil, o vacío
}
```

## Respuesta del callback

El addon soporta dos modos de entrega. Elige según tu arquitectura.

### Modo 1 — JSON (recomendado para APIs y móvil)

`RedirectOnSuccess` está vacío (por defecto). El callback handler devuelve:

```json
{ "token": "<jwt-firmado>" }
```

El cliente (SPA, app móvil u otro backend) llama a `GET /auth/google/callback?code=...`
y lee el token del cuerpo de la respuesta. El navegador nunca ve el token en la URL.

```go
oauth.New(oauth.Config{
    Google:  &oauth.ProviderConfig{...},
    Signer:  jwtSigner,
})
```

### Modo 2 — Redirect backend → frontend (flujo OAuth en navegador)

Configura `RedirectOnSuccess` con la URL de tu frontend. Tras firmar el JWT, el backend
redirige el navegador a esa URL con el token como query parameter.

Si usas el `cmd/setup_oauth.go` generado, esto se controla directamente con `OAUTH_REDIRECT_ON_SUCCESS` y `OAUTH_REDIRECT_TOKEN_PARAM`.

```
Navegador → GET /auth/google           (login)
          → Google → GET /auth/google/callback?code=...  (proveedor redirige al backend)
          → Backend firma el JWT
          → 302 → https://miapp.com/auth/done?token=<jwt>  (backend redirige al frontend)
Frontend lee el token de la URL, lo almacena y lo elimina del historial.
```

```go
oauth.New(oauth.Config{
    Google:             &oauth.ProviderConfig{...},
    Signer:             jwtSigner,
    RedirectOnSuccess:  "https://miapp.com/auth/done",
    RedirectTokenParam: "token", // opcional, "token" es el valor por defecto
})
```

Cambia el nombre del query parameter para que coincida con lo que espera tu frontend:

```go
RedirectOnSuccess:  "https://miapp.com/auth/done",
RedirectTokenParam: "access_token",
// → https://miapp.com/auth/done?access_token=<jwt-firmado>
```

:::caution[Nota de seguridad]
Los tokens en query strings pueden aparecer en logs de acceso del servidor, historial
del navegador y cabeceras `Referer`. Tras leer el token, el frontend debe eliminarlo
de la URL con `history.replaceState(null, '', window.location.pathname)`.
El Modo 1 (JSON) evita completamente esta exposición y es preferible cuando el cliente
puede llamar al endpoint de callback directamente.
:::

## Rutas

`NewController` registra automáticamente las siguientes rutas para cada proveedor habilitado:

| Ruta | Descripción |
|---|---|
| `GET /auth/google` | Redirige a la página de autorización de Google |
| `GET /auth/google/callback` | Intercambia código, firma JWT y devuelve token o redirige al frontend |
| `GET /auth/github` | Redirige a la página de autorización de GitHub |
| `GET /auth/github/callback` | Intercambia código, firma JWT y devuelve token o redirige al frontend |
| `GET /auth/gitlab` | Redirige a la página de autorización de GitLab |
| `GET /auth/gitlab/callback` | Intercambia código, firma JWT y devuelve token o redirige al frontend |

Los proveedores con credenciales incompletas se omiten silenciosamente — solo se registran rutas para los providers habilitados con configuración completa.

## Wiring generado

```go
// cmd/main.go
jwtProvider := setupJWT(app, appLogger)
setupOAuth(app, jwtProvider, appLogger)

protected := app.Group("/api", jwtProvider.Middleware())
// registra aquí tus rutas protegidas
```
