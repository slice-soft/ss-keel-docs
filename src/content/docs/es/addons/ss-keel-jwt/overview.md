---
title: Resumen de JWT
description: Que agrega ss-keel-jwt a un servicio Keel y donde encaja en la capa de autenticacion.
---

`ss-keel-jwt` es el addon oficial de bearer tokens para Keel.

**Release estable actual:** `v1.8.0` (2026-04-22)  
**Implementa:** [`Guard`](/es/reference/interfaces#guard), [`TokenSigner`](/es/reference/interfaces#tokensigner)

## Que obtienes

- Generacion, validacion y refresh de tokens HS256.
- Proteccion de rutas mediante `jwtProvider.Middleware()`.
- Acceso a claims por request con `jwt.ClaimsFromCtx(...)`.
- Un signer reutilizable directamente desde [`ss-keel-oauth`](/es/addons/ss-keel-oauth/).

## Cuando usarlo

- Flujos de login por password o API que entregan bearer tokens.
- Grupos de rutas protegidas en APIs HTTP.
- Tokens entre servicios con issuer estable.
- Callbacks OAuth que necesitan devolver un JWT firmado.

## Superficie principal

El addon gira alrededor de `*jwt.JWT`:

```go
jwtProvider, err := jwt.New(jwt.Config{
    SecretKey:     "change-me-in-production",
    Issuer:        "my-app",
    TokenTTLHours: 24,
    Logger:        appLogger,
})
```

Desde ahi puedes usar:

- `GenerateToken(...)`
- `ValidateToken(...)`
- `RefreshToken(...)`
- `Middleware()`

## Continua con

- [Instalacion](/es/addons/ss-keel-jwt/installation/)
- [Configuracion](/es/addons/ss-keel-jwt/configuration/)
- [Ejemplos](/es/addons/ss-keel-jwt/examples/)
