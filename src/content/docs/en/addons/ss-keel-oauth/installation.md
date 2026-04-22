---
title: OAuth Installation
description: Install ss-keel-oauth and understand the generated provider wiring.
---

Install the addon with:

```bash
keel add oauth
```

If `jwt` is not installed yet, the CLI prompts to install it first. Pressing Enter accepts the default. For scripted installs, use `--yes` or `--no-input`.

Manual install:

```bash
go get github.com/slice-soft/ss-keel-oauth
```

## What `keel add oauth` generates

- Adds `github.com/slice-soft/ss-keel-oauth` to dependencies.
- Keeps or creates the JWT provider setup.
- Creates `cmd/setup_oauth.go`.
- Replaces the standalone JWT placeholder in `cmd/main.go` with `setupOAuth(app, jwtProvider, appLogger)`.
- Adds provider config keys and `.env` examples.

The generated routes use the configured prefix and expose:

- `GET /auth/google`
- `GET /auth/google/callback`
- `GET /auth/github`
- `GET /auth/github/callback`
- `GET /auth/gitlab`
- `GET /auth/gitlab/callback`
