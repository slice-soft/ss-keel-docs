---
title: ss-keel-redis
description: Cache Redis vía go-redis — implementa contracts.Cache con soporte de health check.
---

`ss-keel-redis` es el addon oficial de cache para Keel. Envuelve [go-redis v9](https://redis.uptrace.dev/) e implementa la interfaz `contracts.Cache` definida en `ss-keel-core`.

**Implementa:** [`contracts.Cache`](/es/reference/interfaces#cache)

## Navega este addon

- [Resumen](/es/addons/ss-keel-redis/overview/)
- [Instalacion](/es/addons/ss-keel-redis/installation/)
- [Configuracion](/es/addons/ss-keel-redis/configuration/)
- [Ejemplos](/es/addons/ss-keel-redis/examples/)

## Instalación

```bash
keel add redis
```

O manualmente:

```bash
go get github.com/slice-soft/ss-keel-redis
```

## Bootstrap

Al ejecutar `keel add redis`, el CLI crea `cmd/setup_redis.go` y agrega una línea en `cmd/main.go`:

```go
// cmd/setup_redis.go — creado por keel add redis
package main

import (
    "github.com/slice-soft/ss-keel-core/config"
    "github.com/slice-soft/ss-keel-core/core"
    "github.com/slice-soft/ss-keel-core/logger"
    ssredis "github.com/slice-soft/ss-keel-redis/redis"
)

// setupRedis inicializa la conexión a Redis y registra el health checker.
func setupRedis(app *core.App, log *logger.Logger) *ssredis.Client {
    redisConfig := config.MustLoadConfig[ssredis.Config]()
    redisConfig.Logger = log

    client, err := ssredis.New(redisConfig)
    if err != nil {
        log.Error("failed to initialize redis: %v", err)
    }
    app.RegisterHealthChecker(ssredis.NewHealthChecker(client))
    return client
}
```

Lo siguiente se inyecta en `cmd/main.go`:

```go
redisClient := setupRedis(app, appLogger)
defer redisClient.Close()
```

La variable de entorno requerida se agrega al `.env`:

```
REDIS_URL=redis://localhost:6379
```

## Configuración

```go
client, err := ssredis.New(ssredis.Config{
    URL:      "redis://localhost:6379",  // requerido
    SkipPing: false,                     // usar true en tests
    Pool: ssredis.PoolConfig{
        MaxActiveConns:  10,
        MinIdleConns:    2,
        MaxIdleConns:    5,
        ConnMaxIdleTime: 5 * time.Minute,
        ConnMaxLifetime: 30 * time.Minute,
    },
    Logger: log, // opcional — registra "redis connected [url=...]"
})
```

Valores por defecto:

- `MaxActiveConns`: `10`
- `MinIdleConns`: `2`
- `MaxIdleConns`: `5`
- `ConnMaxIdleTime`: `5m`
- `ConnMaxLifetime`: `30m`

El campo `URL` usa el formato estándar de Redis: `redis://[:password@]host[:port][/db-number]`.

## Ejemplo oficial

El repositorio oficial de ejemplos incluye `ss-keel-examples/examples/14-redis-cache`, que demuestra:

- `ssredis.New(...)` y `ssredis.NewHealthChecker(...)`
- inyección de `*ssredis.Client` en un módulo
- uso de `contracts.Cache` en la capa de servicio
- un flujo cache-aside con `GET /notes/:id`, TTL en Redis e invalidación de cache en escrituras

## Operaciones de cache

`contracts.Cache` cubre las cuatro operaciones fundamentales:

```go
import (
    "context"
    "time"
)

ctx := context.Background()

// Guardar un valor con TTL
err := redisClient.Set(ctx, "user:123", []byte(`{"name":"Alice"}`), 5*time.Minute)

// Obtener — devuelve nil, nil cuando la clave no existe
val, err := redisClient.Get(ctx, "user:123")

// Eliminar una clave
err = redisClient.Delete(ctx, "user:123")

// Verificar existencia sin leer el valor
exists, err := redisClient.Exists(ctx, "user:123")
```

Un TTL de cero en `Set` significa que la clave no expira.

## Inyectar el cache en un módulo

Pasa `*ssredis.Client` a cualquier servicio que declare `contracts.Cache`:

```go
// modules/users/module.go
package users

import (
    "github.com/slice-soft/ss-keel-core/contracts"
    "github.com/slice-soft/ss-keel-core/core"
    ssredis "github.com/slice-soft/ss-keel-redis/redis"
)

type UsersModule struct {
    cache *ssredis.Client
}

func NewUsersModule(cache *ssredis.Client) *UsersModule {
    return &UsersModule{cache: cache}
}

func (m *UsersModule) Register(app *core.App) {
    repo    := NewUserRepository(app.Logger())
    service := NewUserService(repo, m.cache)
    app.RegisterController(NewUserController(service))
}
```

En `cmd/main.go`, pasa el cliente al registrar el módulo:

```go
redisClient := setupRedis(app, appLogger)
defer redisClient.Close()

app.RegisterModule(users.NewUsersModule(redisClient))
```

## Operaciones avanzadas

Cuando la interfaz genérica `contracts.Cache` no es suficiente, usa `RDB()` para acceder al cliente completo de go-redis:

```go
pipe := redisClient.RDB().Pipeline()
pipe.Incr(ctx, "counter")
pipe.Expire(ctx, "counter", time.Hour)
_, err := pipe.Exec(ctx)
```

## Integración con health checks

`NewHealthChecker(client)` implementa `contracts.HealthChecker` y expone la dependencia en `GET /health` como:

```json
{ "redis": "UP" }
```

`setupRedis` lo registra automáticamente. Si inicializas el cliente manualmente, regístralo de forma explícita:

```go
app.RegisterHealthChecker(ssredis.NewHealthChecker(client))
```
