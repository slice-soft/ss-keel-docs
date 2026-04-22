---
title: Configuracion de JWT
description: Setup generado, claves de config, defaults y comportamiento runtime de ss-keel-jwt.
---

El setup generado usa configuracion tipada cargada desde `application.properties` con overrides por env vars:

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

## Claves generadas

| application.properties | .env | Default | Proposito |
|---|---|---|---|
| `jwt.secret` | `JWT_SECRET` | `change-me-in-production` | Secreto HMAC para firmar y verificar tokens |
| `jwt.issuer` | `JWT_ISSUER` | vacio | Override explicito del issuer |
| `jwt.token-ttl-hours` | `JWT_TOKEN_TTL_HOURS` | `24` | Vida util del token en horas |

## Defaults

| Campo | Default |
|---|---|
| `Issuer` | `app.name` cuando `jwt.issuer` esta vacio |
| `TokenTTLHours` | `24` |

El fallback del issuer ya sigue el flujo tipado nuevo: los proyectos generados usan `app.name`, no llamadas manuales a helpers de env dentro de `main.go`.
