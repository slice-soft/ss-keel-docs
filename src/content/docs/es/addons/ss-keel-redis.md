---
title: ss-keel-redis
description: Cache Redis y almacenamiento de sesiones vía go-redis.
---

:::caution[Próximamente]
Este addon está en desarrollo. La interfaz que implementa ya es estable. Ver [Cache](/reference/interfaces#cache).
:::

`ss-keel-redis` provee implementación de `Cache` sobre [go-redis](https://redis.uptrace.dev/). También incluye middleware opcional para sesiones.

**Implementa:** [`Cache`](/reference/interfaces#cache)

## Instalación (planificada)

```bash
go get github.com/slice-soft/ss-keel-redis
```

## Uso (planificado)

### Cache

```go
import "github.com/slice-soft/ss-keel-redis"

cache, err := ssredis.NewCache(ssredis.Config{
    URL: os.Getenv("REDIS_URL"), // redis://localhost:6379
})

// cache implementa core.Cache
cache.Set(ctx, "user:123", data, 5*time.Minute)
cache.Get(ctx, "user:123")
cache.Delete(ctx, "user:123")
cache.Exists(ctx, "user:123")
```

Inyéctalo en servicios vía módulo:

```go
type UserModule struct{}

func (m *UserModule) Register(app *core.App) {
    cache, _ := ssredis.NewCache(ssredis.Config{URL: os.Getenv("REDIS_URL")})

    service := NewUserService(repo, cache)
    app.RegisterController(NewUserController(service))

    app.OnShutdown(func(ctx context.Context) error {
        return cache.Close()
    })
}
```

### Sesiones

```go
// Middleware de sesión
app.Fiber().Use(ssredis.SessionMiddleware(cache))

// Leer/escribir sesión en handlers
func handler(c *core.Ctx) error {
    session := ssredis.GetSession(c)
    session.Set("user_id", "abc-123")
    return c.OK("ok")
}
```

## Verificación de salud

```go
app.RegisterHealthChecker(ssredis.NewHealthChecker(cache))
// → "redis": "UP" en GET /health
```
