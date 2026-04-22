---
title: JWT Configuration
description: Generated setup, config keys, defaults, and runtime behavior for ss-keel-jwt.
---

The generated setup file uses typed config loaded from `application.properties` with env overrides:

```go
type jwtSetupConfig struct {
    AppName       string `keel:"app.name,required"`
    SecretKey     string `keel:"jwt.secret,required"`
    Issuer        string `keel:"jwt.issuer"`
    TokenTTLHours uint   `keel:"jwt.token-ttl-hours,required"`
}

func setupJWT(app *core.App, log *logger.Logger) *jwt.JWT {
    _ = app

    jwtConfig := config.MustLoadConfig[jwtSetupConfig]()
    issuer := strings.TrimSpace(jwtConfig.Issuer)
    if issuer == "" {
        issuer = jwtConfig.AppName
    }

    jwtProvider, err := jwt.New(jwt.Config{
        SecretKey:     jwtConfig.SecretKey,
        Issuer:        issuer,
        TokenTTLHours: jwtConfig.TokenTTLHours,
        Logger:        log,
    })
    if err != nil {
        log.Error("failed to initialize JWT: %v", err)
    }
    return jwtProvider
}
```

## Generated keys

| application.properties | .env | Default | Purpose |
|---|---|---|---|
| `jwt.secret` | `JWT_SECRET` | `change-me-in-production` | HMAC secret used to sign and verify tokens |
| `jwt.issuer` | `JWT_ISSUER` | empty | Explicit issuer override |
| `jwt.token-ttl-hours` | `JWT_TOKEN_TTL_HOURS` | `24` | Token lifetime in hours |

## Defaults

| Field | Default |
|---|---|
| `Issuer` | `app.name` when `jwt.issuer` is empty |
| `TokenTTLHours` | `24` |

The issuer fallback changed with the newer typed setup flow: generated projects now derive it from `app.name`, not from ad-hoc env helper calls in `main.go`.
