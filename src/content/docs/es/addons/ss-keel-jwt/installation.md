---
title: Instalacion de JWT
description: Instala ss-keel-jwt en un proyecto Keel y entiende que genera el CLI.
---

Instala el addon con el CLI de Keel:

```bash
keel add jwt
```

La instalacion manual sigue siendo valida:

```bash
go get github.com/slice-soft/ss-keel-jwt
```

## Que cambia `keel add jwt`

- Agrega `github.com/slice-soft/ss-keel-jwt` a las dependencias.
- Crea `cmd/setup_jwt.go`.
- Inyecta `jwtProvider := setupJWT(app, appLogger)` en `cmd/main.go`.
- Agrega property keys y ejemplos de `.env` para la configuracion JWT.

Claves generadas:

```properties
jwt.secret=${JWT_SECRET:change-me-in-production}
jwt.issuer=${JWT_ISSUER:}
jwt.token-ttl-hours=${JWT_TOKEN_TTL_HOURS:24}
```

Ejemplos `.env`:

```bash
JWT_SECRET=change-me-in-production
JWT_ISSUER=
JWT_TOKEN_TTL_HOURS=24
```

## Siguiente paso

Despues de instalarlo, protege rutas con `jwtProvider.Middleware()` o continua con [`ss-keel-oauth`](/es/addons/ss-keel-oauth/installation/) si quieres flujos de login con proveedores sobre JWT.
