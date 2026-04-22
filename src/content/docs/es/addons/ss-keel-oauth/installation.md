---
title: Instalacion de OAuth
description: Instala ss-keel-oauth y entiende el wiring generado para proveedores.
---

Instala el addon con:

```bash
keel add oauth
```

Si `jwt` no esta instalado todavia, el CLI ofrece instalarlo primero. Presionar Enter acepta la opcion por defecto. Para scripts, usa `--yes` o `--no-input`.

Instalacion manual:

```bash
go get github.com/slice-soft/ss-keel-oauth
```

## Que genera `keel add oauth`

- Agrega `github.com/slice-soft/ss-keel-oauth` a las dependencias.
- Conserva o crea el setup del proveedor JWT.
- Crea `cmd/setup_oauth.go`.
- Reemplaza el placeholder standalone de JWT en `cmd/main.go` por `setupOAuth(app, jwtProvider, appLogger)`.
- Agrega property keys y ejemplos `.env` para los proveedores.

Las rutas generadas usan el prefijo configurado y exponen:

- `GET /auth/google`
- `GET /auth/google/callback`
- `GET /auth/github`
- `GET /auth/github/callback`
- `GET /auth/gitlab`
- `GET /auth/gitlab/callback`
