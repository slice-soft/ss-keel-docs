---
title: ss-keel-oauth
description: OAuth2 authentication with Google, GitHub, and other providers.
---

:::caution[Coming Soon]
This addon is under development. The interface it implements is stable — see [Guard](/reference/interfaces#guard).
:::

`ss-keel-oauth` provides OAuth2 authentication middleware with support for popular providers. After a successful OAuth flow, the authenticated user profile is stored in the request context via `SetUser`, compatible with `UserAs[T]`.

**Implements:** [`Guard`](/reference/interfaces#guard)

## Planned Installation

```bash
go get github.com/slice-soft/ss-keel-oauth
```

## Planned Providers

| Provider | Status |
|---|---|
| Google | Planned |
| GitHub | Planned |
| Microsoft | Planned |
| Discord | Planned |
| Custom (any OAuth2) | Planned |

## Planned Usage

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

// Register OAuth routes (redirects + callbacks)
app.Use(oauth)
```

### Accessing the OAuth User

```go
func callbackHandler(c *core.Ctx) error {
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

## Generated Routes

The addon auto-registers:

| Route | Description |
|---|---|
| `GET /auth/{provider}` | Redirect to provider |
| `GET /auth/{provider}/callback` | Handle OAuth callback |
