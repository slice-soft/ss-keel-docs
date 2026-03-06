---
title: ss-keel-gorm
description: PostgreSQL, MySQL, SQLite and SQL Server support via GORM with a generic Repository implementation.
---

`ss-keel-gorm` provides a generic `GormRepository[T, ID]` that implements [`core.Repository[T, ID]`](/reference/interfaces#repository) using [GORM](https://gorm.io/). Supports Postgres, MySQL, MariaDB, SQLite and SQL Server with zero boilerplate for standard CRUD.

## Installation

```bash
keel add gorm
```

Or manually:

```bash
go get github.com/slice-soft/ss-keel-gorm
```

## Connecting

```go
import "github.com/slice-soft/ss-keel-gorm/database"

db, err := database.New(database.Config{
    Engine: database.EnginePostgres,
    DSN:    os.Getenv("DATABASE_URL"),
})
if err != nil {
    log.Fatal(err)
}
defer db.Close()
```

Supported engines:

| Constant | Driver |
|---|---|
| `database.EnginePostgres` | PostgreSQL |
| `database.EngineMySQL` | MySQL |
| `database.EngineMariaDB` | MariaDB |
| `database.EngineSQLite` | SQLite |
| `database.EngineSQLServer` | SQL Server |

You can also pass a full DSN directly:

```go
db, err := database.New(database.Config{
    Engine: database.EnginePostgres,
    DSN:    "postgres://user:pass@localhost:5432/mydb?sslmode=disable",
})
```

## Model definition

Models follow standard GORM conventions:

```go
type User struct {
    ID        string    `gorm:"primaryKey"  json:"id"`
    Name      string                        `json:"name"`
    Email     string    `gorm:"uniqueIndex" json:"email"`
    CreatedAt time.Time                     `json:"created_at"`
    UpdatedAt time.Time                     `json:"updated_at"`
}
```

## Generic repository

`GormRepository[T, ID]` covers standard CRUD with no code to write:

```go
type UserRepository = database.GormRepository[User, string]

func NewUserRepository(db *database.DBinstance) *UserRepository {
    return database.NewGormRepository[User, string](db)
}
```

Available methods (implements `core.Repository[T, ID]`):

```go
repo.FindByID(ctx, "abc-123")                           // *User, error
repo.FindAll(ctx, core.PageQuery{Page: 1, Limit: 20})   // core.Page[User], error
repo.Create(ctx, &user)                                  // error
repo.Update(ctx, "abc-123", &user)                       // error  (full replace via Save)
repo.Delete(ctx, "abc-123")                              // error  (respects soft-delete)
```

## Health check

```go
app.RegisterHealthChecker(database.NewHealthChecker(db))
// GET /health → "database": "UP"
```

## Extending with custom queries

Embed `GormRepository` and add methods using `r.DB()` for raw GORM access:

```go
type UserRepository struct {
    *database.GormRepository[User, string]
}

func NewUserRepository(db *database.DBinstance) *UserRepository {
    return &UserRepository{
        GormRepository: database.NewGormRepository[User, string](db),
    }
}

func (r *UserRepository) FindByEmail(ctx context.Context, email string) (*User, error) {
    var user User
    err := r.DB().WithContext(ctx).Where("email = ?", email).First(&user).Error
    if errors.Is(err, gorm.ErrRecordNotFound) {
        return nil, nil
    }
    return &user, err
}
```

## Connection pool

Configured automatically with sensible defaults. Override via `Config.Pool`:

```go
database.New(database.Config{
    Engine: database.EnginePostgres,
    DSN:    os.Getenv("DATABASE_URL"),
    Pool: database.PoolConfig{
        MaxOpenConns:    25,
        MaxIdleConns:    5,
        ConnMaxLifetime: 30 * time.Minute,
        ConnMaxIdleTime: 15 * time.Minute,
    },
})
```

## Custom engine

Register any GORM-compatible dialector:

```go
database.RegisterDialector("oracle", func(cfg database.Config) (gorm.Dialector, error) {
    return oracle.Open(cfg.DSN), nil
})
```

## CLI integration

When `ss-keel-gorm` is present in `go.mod`, `keel generate repository` automatically generates a GORM-backed repository instead of the default stub:

```bash
keel generate repository users/product
# → internal/modules/users/product_repository.go  (GORM-backed)
```
