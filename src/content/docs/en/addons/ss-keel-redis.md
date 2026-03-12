---
title: ss-keel-redis
description: Redis cache and session storage via go-redis.
---

:::caution[Coming Soon]
This addon is under development. The interface it implements is already stable. See [Cache](/en/reference/interfaces#cache).
:::

`ss-keel-redis` provides a `Cache` implementation on top of [go-redis](https://redis.uptrace.dev/). It also includes optional session middleware.

**Implements:** [`Cache`](/en/reference/interfaces#cache)

## Installation (planned)

```bash
go get github.com/slice-soft/ss-keel-redis
```

## Usage (planned)

### Cache

```go
import "github.com/slice-soft/ss-keel-redis"

cache, err := ssredis.NewCache(ssredis.Config{
    URL: os.Getenv("REDIS_URL"), // redis://localhost:6379
})

// cache implements core.Cache
cache.Set(ctx, "user:123", data, 5*time.Minute)
cache.Get(ctx, "user:123")
cache.Delete(ctx, "user:123")
cache.Exists(ctx, "user:123")
```

Inject it into services via module:

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

### Sessions

```go
// Session middleware
app.Fiber().Use(ssredis.SessionMiddleware(cache))

// Read/write session in handlers
func handler(c *httpx.Ctx) error {
    session := ssredis.GetSession(c)
    session.Set("user_id", "abc-123")
    return c.OK("ok")
}
```

## Health check

```go
app.RegisterHealthChecker(ssredis.NewHealthChecker(cache))
// → "redis": "UP" in GET /health
```
