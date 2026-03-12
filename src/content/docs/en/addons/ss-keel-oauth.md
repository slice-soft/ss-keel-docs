---
title: ss-keel-oauth
description: OAuth2 authentication with Google, GitHub and other providers.
---

:::caution[Coming Soon]
This addon is under development. The interface it implements is already stable. See [Guard](/en/reference/interfaces#guard).
:::

`ss-keel-oauth` provides OAuth2 authentication middleware with support for popular providers. After a successful OAuth flow, the authenticated profile is stored in the request context with `SetUser`, compatible with `UserAs[T]`.

**Implements:** [`Guard`](/en/reference/interfaces#guard)

## Installation (planned)

```bash
go get github.com/slice-soft/ss-keel-oauth
```

## Providers (planned)

| Provider | Status |
|---|---|
| Google | Planned |
| GitHub | Planned |
| Microsoft | Planned |
| Discord | Planned |
| Custom (any OAuth2) | Planned |

## Usage (planned)

```go
import "github.com/slice-soft/ss-keel-oauth"

oauth := ssoauth.New(ssoauth.Config{
    Google: &ssoauth.ProviderConfig{
        ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
        ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
        RedirectURL:  "https://myapp.com/auth/google/callback",
        Scopes:       []string{"email", "profile"},
    },
    GitHub: &ssoauth.ProviderConfig{
        ClientID:     os.Getenv("GITHUB_CLIENT_ID"),
        ClientSecret: os.Getenv("GITHUB_CLIENT_SECRET"),
        RedirectURL:  "https://myapp.com/auth/github/callback",
    },
})

// Registers OAuth routes (redirect + callbacks)
app.Use(oauth)
```

### Access the OAuth user

```go
func callbackHandler(c *httpx.Ctx) error {
    profile, ok := core.UserAs[*ssoauth.Profile](c)
    if !ok {
        return core.Unauthorized("oauth failed")
    }

    // profile.Provider — "google", "github"
    // profile.ID
    // profile.Email
    // profile.Name
    // profile.AvatarURL
}
```

## Generated routes

The addon automatically registers:

| Route | Description |
|---|---|
| `GET /auth/{provider}` | Redirects to the provider |
| `GET /auth/{provider}/callback` | Processes the OAuth callback |
