---
title: Ejemplos de Mongo
description: Uso real de ss-keel-mongo tomado del repositorio oficial de ejemplos.
---

El proyecto ejecutable oficial es [`ss-keel-examples/examples/13-mongo`](https://github.com/slice-soft/ss-keel-examples/tree/main/examples/13-mongo).

## Conectar y crear un repositorio tipado

```go
mongoCfg := config.MustLoadConfig[mongo.Config]()
mongoCfg.Logger = log
mongoCfg.AppName = cfg.Name

client, err := mongo.New(mongoCfg)
if err != nil {
    log.Error("failed to connect to MongoDB: %v", err)
    os.Exit(1)
}
defer client.Close()

repo := mongo.NewRepository[Note, string](client, "notes")
app.RegisterHealthChecker(mongo.NewHealthChecker(client))
```

## Sellar EntityBase antes de insertar

```go
note := &Note{Title: req.Title, Body: req.Body}
note.OnCreate()
if err := repo.Create(context.Background(), note); err != nil {
    return core.Internal("could not create note", err)
}
return c.Created(note)
```

## Ejemplo de lectura paginada

```go
q := c.ParsePagination()
page, err := repo.FindAll(context.Background(), q)
if err != nil {
    return core.Internal("could not fetch notes", err)
}
return c.OK(page)
```
