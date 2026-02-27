---
title: ss-keel-mongo
description: MongoDB support via the official mongo-driver with a generic Repository implementation.
---

:::caution[Coming Soon]
This addon is under development. The interface it implements is stable — see [Repository](/reference/interfaces#repository).
:::

`ss-keel-mongo` provides a generic `Repository[T, ID]` implementation backed by [mongo-driver](https://www.mongodb.com/docs/drivers/go/current/). Works with any BSON-serializable struct.

**Implements:** [`Repository[T, ID]`](/reference/interfaces#repository)

## Planned Installation

```bash
go get github.com/slice-soft/ss-keel-mongo
```

## Planned Usage

```go
import "github.com/slice-soft/ss-keel-mongo"

// Connect
client, err := ssmongo.Connect(ssmongo.Config{
    URI:      os.Getenv("MONGO_URI"),
    Database: "mydb",
})

// Generic repository
userRepo := ssmongo.NewRepository[User, string](client, "users")

// userRepo implements core.Repository[User, string]
userRepo.FindByID(ctx, "abc-123")
userRepo.FindAll(ctx, core.PageQuery{Page: 1, Limit: 20})
userRepo.Create(ctx, &user)
userRepo.Update(ctx, "abc-123", &user)
userRepo.Delete(ctx, "abc-123")
```

## Document Definition

```go
type User struct {
    ID    string `bson:"_id"`
    Name  string `bson:"name"`
    Email string `bson:"email"`
}
```

## Health Check

```go
app.RegisterHealthChecker(ssmongo.NewHealthChecker(client))
// → "mongodb": "UP" in GET /health
```

## Custom Queries

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
