---
title: ss-keel-oauth
description: OAuth2 authentication addon for Keel — Google, GitHub, and GitLab providers with JWT issuance on callback.
---

`ss-keel-oauth` adds OAuth2 authentication to any Keel application.
After a successful provider flow the addon signs a JWT and returns it to the client —
either as JSON or as a redirect with the token in the query string.

**Supported providers:** Google · GitHub · GitLab

## Installation

```bash
keel add oauth
```

If `jwt` is not installed yet, the CLI prompts to install it first:

```text
Install "jwt" now? [Y/n]
```

Pressing Enter accepts the default and installs the dependency automatically before `oauth`.

For scripted installs, use `keel add oauth --yes` to auto-accept the dependency prompt, or `keel add oauth --no-input` to run without blocking on stdin while still accepting the default dependency answer.

Or manually:

```bash
go get github.com/slice-soft/ss-keel-oauth
```

## Bootstrap

When you run `keel add oauth`, the CLI creates `cmd/setup_oauth.go`, keeps the `jwtProvider := setupJWT(app, appLogger)` binding from the JWT addon, and injects `setupOAuth(app, jwtProvider, appLogger)` into `cmd/main.go`.

The generated provider file uses typed config loaded from `application.properties`:

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

The same generated file also includes `oauthProviderConfig`, `parseOAuthEnabledProviders`, `normalizeOAuthRoutePrefix`, `normalizeOAuthRedirectBase`, `normalizeOAuthSuccessRedirect`, and `normalizeOAuthRedirectTokenParam`. The redirect base defaults to `http://127.0.0.1:7331` when left empty.

`NewController` still accepts an optional prefix if you wire the addon manually:

```go
app.RegisterController(oauth.NewController(oauthManager, "/sign-in"))
// → GET /sign-in/google, GET /sign-in/google/callback, ...
```

If you need custom paths for individual providers, use the handlers directly:

```go
httpx.GET("/login/google",          oauthManager.LoginHandler(oauth.ProviderGoogle))
httpx.GET("/login/google/callback", oauthManager.CallbackHandler(oauth.ProviderGoogle))
```

## Providers

Configure only the providers you need — a provider is skipped when its `ProviderConfig` is `nil` or incomplete.

### Google

```go
Google: &oauth.ProviderConfig{
    ClientID:     os.Getenv("OAUTH_GOOGLE_CLIENT_ID"),
    ClientSecret: os.Getenv("OAUTH_GOOGLE_CLIENT_SECRET"),
    RedirectURL:  "https://myapp.com/auth/google/callback",
    // Scopes defaults to: ["openid", "email", "profile"]
},
```

Credentials: [console.cloud.google.com → APIs & Services → Credentials](https://console.cloud.google.com/apis/credentials)

### GitHub

```go
GitHub: &oauth.ProviderConfig{
    ClientID:     os.Getenv("OAUTH_GITHUB_CLIENT_ID"),
    ClientSecret: os.Getenv("OAUTH_GITHUB_CLIENT_SECRET"),
    RedirectURL:  "https://myapp.com/auth/github/callback",
    // Scopes defaults to: ["read:user", "user:email"]
},
```

Credentials: [github.com/settings/developers → OAuth Apps](https://github.com/settings/developers)

When the user's email is set to private on GitHub, the addon automatically
calls `/user/emails` to retrieve the verified primary address.

### GitLab

```go
GitLab: &oauth.ProviderConfig{
    ClientID:     os.Getenv("OAUTH_GITLAB_CLIENT_ID"),
    ClientSecret: os.Getenv("OAUTH_GITLAB_CLIENT_SECRET"),
    RedirectURL:  "https://myapp.com/auth/gitlab/callback",
    // Scopes defaults to: ["read_user"]
},
```

Credentials: [gitlab.com/-/user_settings/applications](https://gitlab.com/-/user_settings/applications)

> Self-hosted GitLab instances are not supported in the default provider.
> Override the endpoint by implementing the `TokenSigner` interface with a custom provider.

## Environment variables

| Variable | Description |
|---|---|
| `OAUTH_GOOGLE_CLIENT_ID` | Google client ID |
| `OAUTH_GOOGLE_CLIENT_SECRET` | Google client secret |
| `OAUTH_GITHUB_CLIENT_ID` | GitHub client ID |
| `OAUTH_GITHUB_CLIENT_SECRET` | GitHub client secret |
| `OAUTH_GITLAB_CLIENT_ID` | GitLab application ID |
| `OAUTH_GITLAB_CLIENT_SECRET` | GitLab client secret |
| `OAUTH_REDIRECT_BASE_URL` | Base URL for building callback URLs (default dev value: `http://127.0.0.1:7331`) |
| `OAUTH_ROUTE_PREFIX` | Route prefix used for the generated OAuth controller (default: `/auth`) |
| `OAUTH_ENABLED_PROVIDERS` | Optional comma-separated provider allowlist (`google,github,gitlab`) |
| `OAUTH_REDIRECT_ON_SUCCESS` | Optional frontend URL used for browser redirect mode after the JWT is signed |
| `OAUTH_REDIRECT_TOKEN_PARAM` | Query parameter name used when `OAUTH_REDIRECT_ON_SUCCESS` is enabled (default: `token`) |

The `cmd/setup_oauth.go` generated by `keel add oauth` reads credentials for all three providers, builds callback URLs from `OAUTH_REDIRECT_BASE_URL`, supports redirect delivery mode through environment variables, and only activates providers that have complete credentials. `OAUTH_ENABLED_PROVIDERS` can further restrict which routes are exposed. When `jwt` was installed standalone first, the CLI also replaces the placeholder `_ = jwtProvider` line with `setupOAuth(app, jwtProvider, appLogger)` and prints a follow-up snippet for a protected `/api/me` route that consumes JWT claims.

## TokenSigner interface

`ss-keel-oauth` does **not** import `ss-keel-jwt` directly.
It depends on the `contracts.TokenSigner` interface defined in `ss-keel-core`:

```go
// contracts.TokenSigner
type TokenSigner interface {
    Sign(subject string, data map[string]any) (string, error)
}
```

`ss-keel-jwt` satisfies this interface — pass `jwtProvider` directly:

```go
oauth.New(oauth.Config{
    Signer: jwtProvider, // *jwt.JWT implements contracts.TokenSigner
    ...
})
```

The `subject` is formatted as `"<provider>:<user-id>"` (e.g. `"google:1234567890"`).
The `data` map passed by the callback handler includes:

| Key | Value |
|---|---|
| `email` | Verified primary email |
| `name` | Display name |
| `avatar_url` | Profile picture URL |
| `provider` | Provider name: `"google"`, `"github"`, or `"gitlab"` |

You can also provide a custom implementation:

```go
type myJwtSigner struct{}

func (s *myJwtSigner) Sign(subject string, data map[string]any) (string, error) {
    // your JWT signing logic
}
```

## UserInfo struct

After a successful OAuth callback the provider returns a normalized `UserInfo`:

```go
type UserInfo struct {
    Provider  oauth.ProviderName // "google", "github", "gitlab"
    ID        string             // provider-specific user ID
    Email     string             // verified primary email, or empty
    Name      string             // display name
    AvatarURL string             // profile picture URL, or empty
}
```

## Callback response

The addon supports two delivery modes. Choose based on your architecture.

### Mode 1 — JSON (recommended for APIs and mobile)

`RedirectOnSuccess` is empty (default). The callback handler returns:

```json
{ "token": "<signed-jwt>" }
```

The client (SPA, mobile app, or another backend) calls `GET /auth/google/callback?code=...`
and reads the token from the response body. The browser never sees the token in the URL.

```go
oauth.New(oauth.Config{
    Google:  &oauth.ProviderConfig{...},
    Signer:  jwtSigner,
})
```

### Mode 2 — Backend-to-frontend redirect (browser OAuth flow)

Set `RedirectOnSuccess` to your frontend URL. After signing the JWT, the backend
redirects the browser to that URL with the token as a query parameter.

When you use the generated `cmd/setup_oauth.go`, this maps directly to `OAUTH_REDIRECT_ON_SUCCESS` and `OAUTH_REDIRECT_TOKEN_PARAM`.

```
Browser → GET /auth/google          (login)
       → Google → GET /auth/google/callback?code=... (provider redirects back to backend)
       → Backend signs JWT
       → 302 → https://myapp.com/auth/done?token=<jwt>  (backend redirects to frontend)
Frontend reads token from URL, stores it, removes it from history.
```

```go
oauth.New(oauth.Config{
    Google:             &oauth.ProviderConfig{...},
    Signer:             jwtSigner,
    RedirectOnSuccess:  "https://myapp.com/auth/done",
    RedirectTokenParam: "token", // optional, "token" is the default
})
```

Override the query parameter name to match your frontend's expectation:

```go
RedirectOnSuccess:  "https://myapp.com/auth/done",
RedirectTokenParam: "access_token",
// → https://myapp.com/auth/done?access_token=<signed-jwt>
```

:::caution[Security note]
Tokens in query strings can appear in server access logs, browser history, and
`Referer` headers. After reading the token the frontend should immediately remove
it from the URL using `history.replaceState(null, '', window.location.pathname)`.
Mode 1 (JSON) avoids this exposure entirely and is preferred when the client can
call the callback endpoint directly.
:::

## Routes

`NewController` registers the following routes automatically for every enabled provider:

| Route | Description |
|---|---|
| `GET /auth/google` | Redirects to Google's authorization page |
| `GET /auth/google/callback` | Exchanges code, signs JWT, returns token or redirects to the frontend |
| `GET /auth/github` | Redirects to GitHub's authorization page |
| `GET /auth/github/callback` | Exchanges code, signs JWT, returns token or redirects to the frontend |
| `GET /auth/gitlab` | Redirects to GitLab's authorization page |
| `GET /auth/gitlab/callback` | Exchanges code, signs JWT, returns token or redirects to the frontend |

Providers with incomplete credentials are silently skipped — only routes for enabled providers with complete config are registered.

## Generated wiring

```go
// cmd/main.go
jwtProvider := setupJWT(app, appLogger)
setupOAuth(app, jwtProvider, appLogger)

protected := app.Group("/api", jwtProvider.Middleware())
// register protected routes here
```
