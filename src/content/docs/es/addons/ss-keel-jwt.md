---
title: ss-keel-jwt
description: Generación y validación de JWT con guards de autenticación listos para usar.
---

:::caution[Próximamente]
Este addon está en desarrollo. La interfaz que implementa ya es estable. Ver [Guard](/reference/interfaces#guard).
:::

`ss-keel-jwt` provee generación y validación de JWT con implementación lista de `Guard`. Firma tokens al login, protege rutas con el guard y accede al usuario autenticado en cualquier punto de la cadena de handlers.

**Implementa:** [`Guard`](/reference/interfaces#guard)

## Instalación (planificada)

```bash
go get github.com/slice-soft/ss-keel-jwt
```

## Uso (planificado)

### Configuración inicial

```go
import "github.com/slice-soft/ss-keel-jwt"

jwtService := ssjwt.New(ssjwt.Config{
    Secret:     os.Getenv("JWT_SECRET"),
    Expiration: 24 * time.Hour,
})
```

### Generar token

```go
// En login
token, err := jwtService.Sign(ssjwt.Claims{
    Subject: user.ID,
    Custom: map[string]any{
        "role":  user.Role,
        "email": user.Email,
    },
})
```

### Proteger rutas

```go
guard := jwtService.Guard()

// Por ruta
httpx.GET("/profile", profileHandler).
    Use(guard.Middleware()).
    WithSecured("bearerAuth")

// Por grupo
protected := app.Group("/api/v1", guard.Middleware())
protected.Use(&users.Module{})
```

### Acceder al usuario autenticado

```go
func profileHandler(c *httpx.Ctx) error {
    claims, ok := core.UserAs[*ssjwt.Claims](c)
    if !ok {
        return core.Unauthorized("no autenticado")
    }

    return c.OK(map[string]any{
        "id":   claims.Subject,
        "role": claims.Custom["role"],
    })
}
```

### Refresh tokens

```go
// Generar refresh token con TTL más largo
refreshToken, _ := jwtService.SignRefresh(ssjwt.Claims{
    Subject: user.ID,
})

// Validar y rotar
newToken, err := jwtService.Refresh(refreshToken)
```
