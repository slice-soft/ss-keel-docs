---
title: GORM Examples
description: Real ss-keel-gorm usage from the official examples repository.
---

The official runnable project is [`ss-keel-examples/examples/08-gorm-postgres`](https://github.com/slice-soft/ss-keel-examples/tree/main/examples/08-gorm-postgres).

## Connect and register the health checker

```go
dbCfg := config.MustLoadConfig[database.Config]()
dbCfg.Logger = log
dbInstance, err := database.New(dbCfg)
if err != nil {
    log.Error("failed to connect to database: %v", err)
    os.Exit(1)
}

app.RegisterHealthChecker(database.NewHealthChecker(dbInstance))
```

## Development-only migration example

```go
if err := db.AutoMigrate(&Product{}); err != nil {
    log.Error("migration failed: %v", err)
    os.Exit(1)
}
```

The example uses `AutoMigrate` for local development convenience only. The repo comments explicitly recommend SQL migrations or external migration tooling for production.

## CRUD route example

```go
httpx.POST("/products", func(c *httpx.Ctx) error {
    var req CreateProductRequest
    if err := c.ParseBody(&req); err != nil {
        return err
    }
    product := Product{Name: req.Name, Description: req.Description, Price: req.Price, Stock: req.Stock}
    if err := db.Create(&product).Error; err != nil {
        return core.Internal("could not create product", err)
    }
    return c.Created(product)
})
```
