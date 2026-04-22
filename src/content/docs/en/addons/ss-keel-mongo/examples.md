---
title: Mongo Examples
description: Real ss-keel-mongo usage from the official examples repository.
---

The official runnable project is [`ss-keel-examples/examples/13-mongo`](https://github.com/slice-soft/ss-keel-examples/tree/main/examples/13-mongo).

## Connect and create a typed repository

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

## Stamp EntityBase before insert

```go
note := &Note{Title: req.Title, Body: req.Body}
note.OnCreate()
if err := repo.Create(context.Background(), note); err != nil {
    return core.Internal("could not create note", err)
}
return c.Created(note)
```

## Paginated read example

```go
q := c.ParsePagination()
page, err := repo.FindAll(context.Background(), q)
if err != nil {
    return core.Internal("could not fetch notes", err)
}
return c.OK(page)
```
