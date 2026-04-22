---
title: Configuracion de Mongo
description: Claves generadas, defaults y setup runtime para ss-keel-mongo.
---

El bootstrap generado es:

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

## Claves generadas

| application.properties | .env | Default | Proposito |
|---|---|---|---|
| `mongo.uri` | `MONGO_URI` | `mongodb://localhost:27017` | URI del servidor MongoDB |
| `mongo.database` | `MONGO_DATABASE` | `app` | Nombre de la base de datos |

## Defaults utiles

| Setting | Default |
|---|---|
| `URI` | `mongodb://localhost:27017` |
| `ConnectTimeout` | `10s` |
| `PingTimeout` | `2s` |
| `DisconnectTimeout` | `5s` |
| `ServerSelectionTimeout` | `5s` |
| `MaxPoolSize` | `25` |
| `MaxConnIdleTime` | `15m` |

`EntityBase` usa IDs UUID string para que los proyectos generados sigan alineados con el resto del ecosistema Keel.
