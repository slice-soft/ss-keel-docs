---
title: Instalacion de Redis
description: Instala ss-keel-redis y entiende el flujo de setup generado.
---

Instala el addon con:

```bash
keel add redis
```

Instalacion manual:

```bash
go get github.com/slice-soft/ss-keel-redis
```

## Que genera `keel add redis`

- Agrega `github.com/slice-soft/ss-keel-redis` a las dependencias.
- Crea `cmd/setup_redis.go`.
- Inyecta `redisClient := setupRedis(app, appLogger)` en `cmd/main.go`.
- Agrega el ejemplo requerido de conexion Redis a `.env`.

Ejemplo `.env` generado:

```bash
REDIS_URL=redis://localhost:6379
```

El bootstrap generado registra automaticamente el health checker Redis.
