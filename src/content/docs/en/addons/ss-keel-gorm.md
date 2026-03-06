---
title: ss-keel-gorm
description: PostgreSQL, MySQL and SQLite support via GORM with a generic Repository implementation.
---

:::caution[Coming Soon]
This addon is under development. The interface it implements is already stable. See [Repository](/reference/interfaces#repository).
:::

`ss-keel-gorm` provides a generic `Repository[T, ID]` implementation based on [GORM](https://gorm.io/). It supports PostgreSQL, MySQL, and SQLite with zero boilerplate for standard CRUD.

**Implements:** [`Repository[T, ID]`](/reference/interfaces#repository)

## Installation (planned)

```bash
go get github.com/slice-soft/ss-keel-gorm
```

## Usage (planned)

```go
import "github.com/slice-soft/ss-keel-gorm"

// Connect
db, err := ssgorm.Connect(ssgorm.Config{
    Driver: "postgres",
    DSN:    os.Getenv("DATABASE_URL"),
})

// Generic repository with no boilerplate
userRepo := ssgorm.NewRepository[User, string](db)

// userRepo implements core.Repository[User, string]
userRepo.FindByID(ctx, "abc-123")
userRepo.FindAll(ctx, core.PageQuery{Page: 1, Limit: 20})
userRepo.Create(ctx, &user)
userRepo.Update(ctx, "abc-123", &user)
userRepo.Delete(ctx, "abc-123")
```

## Model definition

Models follow standard GORM conventions:

```go
type User struct {
    ID        string    `gorm:"primaryKey"`
    Name      string
    Email     string    `gorm:"uniqueIndex"`
    CreatedAt time.Time
    UpdatedAt time.Time
}
```

## Health check

```go
app.RegisterHealthChecker(ssgorm.NewHealthChecker(db))
// → "database": "UP" in GET /health
```

## Extending the generic repository

The generic repository covers standard CRUD. For custom queries, embed it:

```go
type UserRepository struct {
    *ssgorm.Repository[User, string]
    db *gorm.DB
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*User, error) {
    var user User
    return &user, r.db.WithContext(ctx).Where("email = ?", email).First(&user).Error
}
```
