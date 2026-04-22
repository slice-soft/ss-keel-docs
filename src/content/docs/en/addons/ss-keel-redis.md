---
title: ss-keel-redis
description: Redis cache via go-redis — implements contracts.Cache with health check support.
---

`ss-keel-redis` is the official cache addon for Keel. It wraps [go-redis v9](https://redis.uptrace.dev/) and implements the `contracts.Cache` interface defined in `ss-keel-core`.

**Implements:** [`contracts.Cache`](/en/reference/interfaces#cache)

## Browse this addon

- [Overview](/en/addons/ss-keel-redis/overview/)
- [Installation](/en/addons/ss-keel-redis/installation/)
- [Configuration](/en/addons/ss-keel-redis/configuration/)
- [Examples](/en/addons/ss-keel-redis/examples/)

## Installation

```bash
keel add redis
```

Or manually:

```bash
go get github.com/slice-soft/ss-keel-redis
```

## Bootstrap

When you run `keel add redis`, the CLI creates `cmd/setup_redis.go` and adds one line to `cmd/main.go`:

```go
// cmd/setup_redis.go — created by keel add redis
package main

import (
    "github.com/slice-soft/ss-keel-core/config"
    "github.com/slice-soft/ss-keel-core/core"
    "github.com/slice-soft/ss-keel-core/logger"
    ssredis "github.com/slice-soft/ss-keel-redis/redis"
)

// setupRedis initialises the Redis connection and registers a health checker.
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

The following is injected into `cmd/main.go`:

```go
redisClient := setupRedis(app, appLogger)
defer redisClient.Close()
```

The required environment variable is added to `.env`:

```
REDIS_URL=redis://localhost:6379
```

## Configuration

```go
client, err := ssredis.New(ssredis.Config{
    URL:      "redis://localhost:6379",  // required
    SkipPing: false,                     // set true in tests
    Pool: ssredis.PoolConfig{
        MaxActiveConns:  10,
        MinIdleConns:    2,
        MaxIdleConns:    5,
        ConnMaxIdleTime: 5 * time.Minute,
        ConnMaxLifetime: 30 * time.Minute,
    },
    Logger: log, // optional — logs "redis connected [url=...]"
})
```

Useful defaults:

- `MaxActiveConns`: `10`
- `MinIdleConns`: `2`
- `MaxIdleConns`: `5`
- `ConnMaxIdleTime`: `5m`
- `ConnMaxLifetime`: `30m`

The `URL` field uses the standard Redis URL format: `redis://[:password@]host[:port][/db-number]`.

## Official example

The official examples repository includes `ss-keel-examples/examples/14-redis-cache`, which demonstrates:

- `ssredis.New(...)` and `ssredis.NewHealthChecker(...)`
- injecting `*ssredis.Client` into a module
- using `contracts.Cache` in the service layer
- a cache-aside flow with `GET /notes/:id`, Redis TTL, and cache invalidation on writes

## Cache operations

`contracts.Cache` covers the four core operations:

```go
import (
    "context"
    "time"
)

ctx := context.Background()

// Store a value with a TTL
err := redisClient.Set(ctx, "user:123", []byte(`{"name":"Alice"}`), 5*time.Minute)

// Retrieve — returns nil, nil when the key does not exist
val, err := redisClient.Get(ctx, "user:123")

// Remove a key
err = redisClient.Delete(ctx, "user:123")

// Check existence without reading the value
exists, err := redisClient.Exists(ctx, "user:123")
```

A zero TTL in `Set` means no expiration.

## Injecting the cache into a module

Pass `*ssredis.Client` to any service that declares `contracts.Cache`:

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

In `cmd/main.go`, pass the client when registering the module:

```go
redisClient := setupRedis(app, appLogger)
defer redisClient.Close()

app.RegisterModule(users.NewUsersModule(redisClient))
```

## Advanced operations

When the generic `contracts.Cache` interface is not enough, use `RDB()` to access the full go-redis client:

```go
pipe := redisClient.RDB().Pipeline()
pipe.Incr(ctx, "counter")
pipe.Expire(ctx, "counter", time.Hour)
_, err := pipe.Exec(ctx)
```

## Health integration

`NewHealthChecker(client)` implements `contracts.HealthChecker` and exposes the dependency under `GET /health` as:

```json
{ "redis": "UP" }
```

`setupRedis` registers it automatically. If you initialise the client manually, register it explicitly:

```go
app.RegisterHealthChecker(ssredis.NewHealthChecker(client))
```
