---
title: GORM Configuration
description: Generated config keys, defaults, and bootstrap flow for ss-keel-gorm.
---

The generated bootstrap is intentionally thin:

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

## Generated keys

| application.properties | .env | Default | Purpose |
|---|---|---|---|
| `database.engine` | `DATABASE_ENGINE` | `sqlite` | Engine used by `database.New(...)` |
| `database.url` | `DATABASE_URL` | `./app.db` | DSN or SQLite path |

## Useful defaults

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

For production deployments, prefer a full DSN in `DATABASE_URL`. Use `database.RegisterDialector(...)` when you need a custom engine beyond the built-in set.
