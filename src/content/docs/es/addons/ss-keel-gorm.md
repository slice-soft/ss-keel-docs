---
title: ss-keel-gorm
description: Soporte para PostgreSQL, MySQL, MariaDB, SQLite y SQL Server via GORM con una implementacion generica de Repository.
---

`ss-keel-gorm` ofrece un `GormRepository[T, ID]` generico que implementa [`core.Repository[T, ID]`](/reference/interfaces#repository) usando [GORM](https://gorm.io/). Soporta Postgres, MySQL, MariaDB, SQLite y SQL Server con cero boilerplate para CRUD estandar.

## Instalacion

```bash
keel add gorm
```

O manualmente:

```bash
go get github.com/slice-soft/ss-keel-gorm
```

## Conexion

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

Motores soportados:

| Constante | Driver |
|---|---|
| `database.EnginePostgres` | PostgreSQL |
| `database.EngineMySQL` | MySQL |
| `database.EngineMariaDB` | MariaDB |
| `database.EngineSQLite` | SQLite |
| `database.EngineSQLServer` | SQL Server |

Tambien puedes pasar un DSN completo directamente:

```go
db, err := database.New(database.Config{
    Engine: database.EnginePostgres,
    DSN:    "postgres://user:pass@localhost:5432/mydb?sslmode=disable",
})
```

## Definicion de modelo

Los modelos siguen las convenciones estandar de GORM:

```go
type User struct {
    ID        string    `gorm:"primaryKey"  json:"id"`
    Name      string                        `json:"name"`
    Email     string    `gorm:"uniqueIndex" json:"email"`
    CreatedAt time.Time                     `json:"created_at"`
    UpdatedAt time.Time                     `json:"updated_at"`
}
```

## Repositorio generico

`GormRepository[T, ID]` cubre el CRUD estandar sin escribir codigo adicional:

```go
type UserRepository = database.GormRepository[User, string]

func NewUserRepository(db *database.DBinstance) *UserRepository {
    return database.NewGormRepository[User, string](db)
}
```

Metodos disponibles (implementa `core.Repository[T, ID]`):

```go
repo.FindByID(ctx, "abc-123")                           // *User, error
repo.FindAll(ctx, core.PageQuery{Page: 1, Limit: 20})   // core.Page[User], error
repo.Create(ctx, &user)                                  // error
repo.Update(ctx, "abc-123", &user)                       // error  (reemplazo completo via Save)
repo.Delete(ctx, "abc-123")                              // error  (respeta soft-delete)
```

## Verificacion de salud

```go
app.RegisterHealthChecker(database.NewHealthChecker(db))
// GET /health -> "database": "UP"
```

## Extender con consultas personalizadas

Embebe `GormRepository` y agrega metodos usando `r.DB()` para acceso GORM directo:

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

## Pool de conexiones

Se configura automaticamente con valores por defecto razonables. Puedes sobrescribirlos mediante `Config.Pool`:

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

## Motor personalizado

Registra cualquier dialector compatible con GORM:

```go
database.RegisterDialector("oracle", func(cfg database.Config) (gorm.Dialector, error) {
    return oracle.Open(cfg.DSN), nil
})
```

## Integracion CLI

Cuando `ss-keel-gorm` esta presente en `go.mod`, `keel generate repository` genera automaticamente un repositorio respaldado por GORM en lugar del stub por defecto:

```bash
keel generate repository users/product
# -> internal/modules/users/product_repository.go  (respaldado por GORM)
```
