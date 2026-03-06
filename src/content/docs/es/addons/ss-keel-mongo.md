---
title: ss-keel-mongo
description: Soporte MongoDB vía mongo-driver oficial con implementación genérica de Repository.
---

:::caution[Próximamente]
Este addon está en desarrollo. La interfaz que implementa ya es estable. Ver [Repository](/reference/interfaces#repository).
:::

`ss-keel-mongo` provee una implementación genérica de `Repository[T, ID]` basada en [mongo-driver](https://www.mongodb.com/docs/drivers/go/current/). Funciona con cualquier struct serializable a BSON.

**Implementa:** [`Repository[T, ID]`](/reference/interfaces#repository)

## Instalación (planificada)

```bash
go get github.com/slice-soft/ss-keel-mongo
```

## Uso (planificado)

```go
import "github.com/slice-soft/ss-keel-mongo"

// Conectar
client, err := ssmongo.Connect(ssmongo.Config{
    URI:      os.Getenv("MONGO_URI"),
    Database: "mydb",
})

// Repositorio genérico
userRepo := ssmongo.NewRepository[User, string](client, "users")

// userRepo implementa core.Repository[User, string]
userRepo.FindByID(ctx, "abc-123")
userRepo.FindAll(ctx, core.PageQuery{Page: 1, Limit: 20})
userRepo.Create(ctx, &user)
userRepo.Update(ctx, "abc-123", &user)
userRepo.Delete(ctx, "abc-123")
```

## Definición de documento

```go
type User struct {
    ID    string `bson:"_id"`
    Name  string `bson:"name"`
    Email string `bson:"email"`
}
```

## Verificación de salud

```go
app.RegisterHealthChecker(ssmongo.NewHealthChecker(client))
// → "mongodb": "UP" en GET /health
```

## Consultas personalizadas

```go
type UserRepository struct {
    *ssmongo.Repository[User, string]
    coll *mongo.Collection
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*User, error) {
    var user User
    return &user, r.coll.FindOne(ctx, bson.M{"email": email}).Decode(&user)
}
```
