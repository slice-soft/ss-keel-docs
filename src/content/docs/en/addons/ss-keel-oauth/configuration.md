---
title: OAuth Configuration
description: Generated config keys, callback behavior, and setup helpers for ss-keel-oauth.
---

The generated setup file uses typed config and helper functions:

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

## Generated keys

| application.properties | .env | Purpose |
|---|---|---|
| `oauth.google.client-id` | `OAUTH_GOOGLE_CLIENT_ID` | Google client ID |
| `oauth.google.client-secret` | `OAUTH_GOOGLE_CLIENT_SECRET` | Google client secret |
| `oauth.github.client-id` | `OAUTH_GITHUB_CLIENT_ID` | GitHub client ID |
| `oauth.github.client-secret` | `OAUTH_GITHUB_CLIENT_SECRET` | GitHub client secret |
| `oauth.gitlab.client-id` | `OAUTH_GITLAB_CLIENT_ID` | GitLab app ID |
| `oauth.gitlab.client-secret` | `OAUTH_GITLAB_CLIENT_SECRET` | GitLab client secret |
| `oauth.redirect-base-url` | `OAUTH_REDIRECT_BASE_URL` | Base URL used to build callback URLs |
| `oauth.route-prefix` | `OAUTH_ROUTE_PREFIX` | Route prefix for generated handlers |
| `oauth.enabled-providers` | `OAUTH_ENABLED_PROVIDERS` | Optional provider allowlist |
| `oauth.redirect-on-success` | `OAUTH_REDIRECT_ON_SUCCESS` | Optional frontend redirect URL |
| `oauth.redirect-token-param` | `OAUTH_REDIRECT_TOKEN_PARAM` | Token query parameter name |

## Callback modes

- JSON mode returns `{ "token": "<jwt>" }`.
- Redirect mode appends the token to the configured frontend URL.

Set `OAUTH_ENABLED_PROVIDERS=google,github` when you want only a subset of configured providers exposed.
