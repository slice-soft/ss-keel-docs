---
title: JWT Installation
description: Install ss-keel-jwt into a Keel project and understand what the CLI generates.
---

Install the addon with the Keel CLI:

```bash
keel add jwt
```

Manual install is still possible:

```bash
go get github.com/slice-soft/ss-keel-jwt
```

## What `keel add jwt` changes

- Adds `github.com/slice-soft/ss-keel-jwt` to the project dependencies.
- Creates `cmd/setup_jwt.go`.
- Injects `jwtProvider := setupJWT(app, appLogger)` into `cmd/main.go`.
- Adds config-facing property keys and `.env` examples for the JWT settings.

Generated config keys:

```properties
jwt.secret=${JWT_SECRET:change-me-in-production}
jwt.issuer=${JWT_ISSUER:}
jwt.token-ttl-hours=${JWT_TOKEN_TTL_HOURS:24}
```

Generated env examples:

```bash
JWT_SECRET=change-me-in-production
JWT_ISSUER=
JWT_TOKEN_TTL_HOURS=24
```

## Next step

After installation, wire route protection with `jwtProvider.Middleware()` or continue to [`ss-keel-oauth`](/en/addons/ss-keel-oauth/installation/) if you want provider login flows on top of JWT issuance.
