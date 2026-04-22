---
title: Configuracion de GORM
description: Claves generadas, defaults y flujo de bootstrap para ss-keel-gorm.
---

El bootstrap generado es intencionalmente pequeno:

```go
func setupGorm(app *core.App, log *logger.Logger) *database.DBinstance {
    dbConfig := config.MustLoadConfig[database.Config]()
    dbConfig.Logger = log

    db, err := database.New(dbConfig)
    if err != nil {
        log.Error("failed to initialize database: %v", err)
    }
    app.RegisterHealthChecker(database.NewHealthChecker(db))
    return db
}
```

## Claves generadas

| application.properties | .env | Default | Proposito |
|---|---|---|---|
| `database.engine` | `DATABASE_ENGINE` | `sqlite` | Motor usado por `database.New(...)` |
| `database.url` | `DATABASE_URL` | `./app.db` | DSN o path SQLite |

## Defaults utiles

| Setting | Default |
|---|---|
| `Engine` | `sqlite` |
| `DSN` | `./app.db` |
| `MaxOpenConns` | `25` |
| `MaxIdleConns` | `5` |
| `ConnMaxLifetime` | `30m` |
| `ConnMaxIdleTime` | `15m` |
| `SSLMode` | `disable` |
| `TimeZone` | `UTC` |

Para produccion, prefiere un DSN completo en `DATABASE_URL`. Usa `database.RegisterDialector(...)` cuando necesites un motor personalizado.
