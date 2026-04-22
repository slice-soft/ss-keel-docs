---
title: Mongo Configuration
description: Generated keys, defaults, and runtime setup for ss-keel-mongo.
---

The generated bootstrap is:

```go
func setupMongo(app *core.App, log *logger.Logger) *mongo.Client {
    mongoConfig := config.MustLoadConfig[mongo.Config]()
    mongoConfig.Logger = log

    mongoClient, err := mongo.New(mongoConfig)
    if err != nil {
        log.Error("failed to initialize MongoDB: %v", err)
    }
    app.RegisterHealthChecker(mongo.NewHealthChecker(mongoClient))
    return mongoClient
}
```

## Generated keys

| application.properties | .env | Default | Purpose |
|---|---|---|---|
| `mongo.uri` | `MONGO_URI` | `mongodb://localhost:27017` | MongoDB server URI |
| `mongo.database` | `MONGO_DATABASE` | `app` | Database name |

## Useful defaults

| Setting | Default |
|---|---|
| `URI` | `mongodb://localhost:27017` |
| `ConnectTimeout` | `10s` |
| `PingTimeout` | `2s` |
| `DisconnectTimeout` | `5s` |
| `ServerSelectionTimeout` | `5s` |
| `MaxPoolSize` | `25` |
| `MaxConnIdleTime` | `15m` |

`EntityBase` uses UUID string IDs so generated Mongo projects stay aligned with the rest of the Keel ecosystem.
