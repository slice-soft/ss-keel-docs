---
title: Ejemplos de GORM
description: Uso real de ss-keel-gorm tomado del repositorio oficial de ejemplos.
---

El proyecto ejecutable oficial es [`ss-keel-examples/examples/08-gorm-postgres`](https://github.com/slice-soft/ss-keel-examples/tree/main/examples/08-gorm-postgres).

## Conectar y registrar health checker

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

## Ejemplo de migracion solo para desarrollo

```go
if err := db.AutoMigrate(&Product{}); err != nil {
    log.Error("migration failed: %v", err)
    os.Exit(1)
}
```

El ejemplo usa `AutoMigrate` solo como conveniencia local. Los comentarios del repo recomiendan migraciones SQL o herramientas externas para produccion.

## Ejemplo CRUD

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
