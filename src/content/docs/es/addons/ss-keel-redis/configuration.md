---
title: Configuracion de Redis
description: Configuracion runtime y defaults de ss-keel-redis.
---

El setup generado usa config tipada del addon:

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

## Superficie de configuracion

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

## Defaults utiles

| Setting | Default |
|---|---|
| `MaxActiveConns` | `10` |
| `MinIdleConns` | `2` |
| `MaxIdleConns` | `5` |
| `ConnMaxIdleTime` | `5m` |
| `ConnMaxLifetime` | `30m` |

`URL` usa el formato estandar de Redis: `redis://[:password@]host[:port][/db-number]`.
