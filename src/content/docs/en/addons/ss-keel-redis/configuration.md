---
title: Redis Configuration
description: Runtime config and defaults for ss-keel-redis.
---

The generated setup uses typed addon config:

```go
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

## Config surface

```go
client, err := ssredis.New(ssredis.Config{
    URL:      "redis://localhost:6379",
    SkipPing: false,
    Pool: ssredis.PoolConfig{
        MaxActiveConns:  10,
        MinIdleConns:    2,
        MaxIdleConns:    5,
        ConnMaxIdleTime: 5 * time.Minute,
        ConnMaxLifetime: 30 * time.Minute,
    },
    Logger: log,
})
```

## Useful defaults

| Setting | Default |
|---|---|
| `MaxActiveConns` | `10` |
| `MinIdleConns` | `2` |
| `MaxIdleConns` | `5` |
| `ConnMaxIdleTime` | `5m` |
| `ConnMaxLifetime` | `30m` |

`URL` uses the standard Redis connection string format: `redis://[:password@]host[:port][/db-number]`.
