---
title: ss-keel-jwt
description: Guard de generación, validación y protección de rutas con JWT para Keel.
---

`ss-keel-jwt` es el addon oficial de autenticación JWT para Keel.
Provee generación de tokens, validación, renovación y un `Guard` listo para proteger rutas mediante el header `Authorization`.

**Implementa:** [`Guard`](/es/reference/interfaces#guard), [`TokenSigner`](/es/reference/interfaces#tokensigner)

## Instalación

```bash
keel add jwt
```

O manualmente:

```bash
go get github.com/slice-soft/ss-keel-jwt
```

## Bootstrap

Al ejecutar `keel add jwt`, el CLI crea `cmd/setup_jwt.go` e inyecta una línea en `cmd/main.go`:

```go
// cmd/setup_jwt.go — creado por keel add jwt
package main

import (
    "strings"

    "github.com/slice-soft/ss-keel-core/config"
    "github.com/slice-soft/ss-keel-core/core"
    "github.com/slice-soft/ss-keel-core/logger"
    "github.com/slice-soft/ss-keel-jwt/jwt"
)

type jwtSetupConfig struct {
    AppName       string `keel:"app.name,required"`
    SecretKey     string `keel:"jwt.secret,required"`
    Issuer        string `keel:"jwt.issuer"`
    TokenTTLHours uint   `keel:"jwt.token-ttl-hours,required"`
}

// setupJWT inicializa el proveedor JWT para firmar tokens y proteger rutas.
// El issuer usa app.name por defecto para que los tokens estén namespaciados por servicio.
func setupJWT(app *core.App, log *logger.Logger) *jwt.JWT {
    _ = app // reservado para soporte futuro de health checker

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

Lo siguiente se inyecta en `cmd/main.go`:

```go
jwtProvider := setupJWT(app, appLogger)
// TODO: usa jwtProvider.Middleware() para proteger rutas
// Ejemplo: protected := app.Group("/api", jwtProvider.Middleware())
_ = jwtProvider
```

Defaults aplicados cuando los campos no están configurados:

| Campo | Default |
|---|---|
| `Issuer` | `app.name` desde `application.properties` |
| `TokenTTLHours` | `24` |

## Generar un token

```go
token, err := jwtProvider.GenerateToken(map[string]any{
    "userID": user.ID,
    "role":   user.Role,
})
```

El payload se almacena en el claim `"data"`. Los claims estándar (`iss`, `iat`, `exp`) se asignan automáticamente.

## Proteger rutas

`jwt.JWT` implementa `contracts.Guard`. Pasa `Middleware()` a cualquier ruta:

```go
httpx.GET("/profile", profileHandler).
    Use(jwtProvider.Middleware()).
    WithSecured("bearerAuth")
```

El middleware lee el header `Authorization`, valida el token (con o sin prefijo `Bearer `) y almacena los claims en el contexto de la petición. Devuelve `401` si el token está ausente o es inválido.

## Acceder al payload autenticado

```go
func profileHandler(c *httpx.Ctx) error {
    claims, ok := jwt.ClaimsFromCtx(c.Ctx)
    if !ok {
        return c.Status(401).JSON(fiber.Map{"error": "no autenticado"})
    }

    data := claims["data"].(map[string]any)
    return c.OK(fiber.Map{
        "userID": data["userID"],
        "role":   data["role"],
    })
}
```

`ClaimsFromCtx` devuelve `(nil, false)` cuando la ruta no está protegida por el guard JWT.

## Renovar tokens

```go
newToken, err := jwtProvider.RefreshToken(oldToken)
```

`RefreshToken` valida el token dado, renueva `iat` y `exp` y devuelve un nuevo token firmado. El payload `"data"` se preserva sin cambios.

## Validar un token manualmente

```go
claims, err := jwtProvider.ValidateToken(tokenString)
```

Útil en contextos no-HTTP como handshakes de WebSocket o jobs en background que reciben un token como entrada.

## Uso con ss-keel-oauth

`*jwt.JWT` implementa `contracts.TokenSigner`, por lo que puede pasarse directamente al addon OAuth como firmador de tokens:

```go
oauthProvider := oauth.New(oauth.Config{
    Google: &oauth.ProviderConfig{...},
    Signer: jwtProvider, // satisface contracts.TokenSigner
    Logger: appLogger,
})
```

Al completarse el flujo OAuth, el callback llama internamente a `jwtProvider.Sign(subject, claims)`, que produce un token HS256 estándar con:
- `sub` — ID de usuario con prefijo del proveedor (ej. `"google:1234567890"`)
- `data` — claims del usuario (`email`, `name`, `avatar_url`, `provider`)
- `iss`, `iat`, `exp` — asignados automáticamente desde la configuración JWT

El token resultante puede validarse con `jwtProvider.ValidateToken` y su payload accederse con `jwt.ClaimsFromCtx` en rutas protegidas.

## Variables de entorno

| Variable | Ejemplo | Descripción |
|---|---|---|
| `JWT_SECRET` | `change-me-in-production` | Secreto HMAC usado para firmar y verificar tokens |
| `JWT_ISSUER` | `my-app` | Claim del emisor del token (`iss`). El setup generado por Keel usa `app.name` cuando queda vacío |
| `JWT_TOKEN_TTL_HOURS` | `24` | Tiempo de vida del token en horas |

Consulta [Autenticación](/es/guides/authentication) para la visión general de autenticación.
