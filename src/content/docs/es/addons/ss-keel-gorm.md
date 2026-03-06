---
title: ss-keel-gorm
description: Soporte PostgreSQL, MySQL y SQLite vía GORM con implementación genérica de Repository.
---

:::caution[Próximamente]
Este addon está en desarrollo. La interfaz que implementa ya es estable. Ver [Repository](/reference/interfaces#repository).
:::

`ss-keel-gorm` provee una implementación genérica de `Repository[T, ID]` basada en [GORM](https://gorm.io/). Soporta PostgreSQL, MySQL y SQLite con cero boilerplate para CRUD estándar.

**Implementa:** [`Repository[T, ID]`](/reference/interfaces#repository)

## Instalación (planificada)

```bash
go get github.com/slice-soft/ss-keel-gorm
```

## Uso (planificado)

```go
import "github.com/slice-soft/ss-keel-gorm"

// Conectar
db, err := ssgorm.Connect(ssgorm.Config{
    Driver: "postgres",
    DSN:    os.Getenv("DATABASE_URL"),
})

// Repositorio genérico sin boilerplate
userRepo := ssgorm.NewRepository[User, string](db)

// userRepo implementa core.Repository[User, string]
userRepo.FindByID(ctx, "abc-123")
userRepo.FindAll(ctx, core.PageQuery{Page: 1, Limit: 20})
userRepo.Create(ctx, &user)
userRepo.Update(ctx, "abc-123", &user)
userRepo.Delete(ctx, "abc-123")
```

## Definición de modelo

Los modelos siguen convenciones estándar de GORM:

```go
type User struct {
    ID        string    `gorm:"primaryKey"`
    Name      string
    Email     string    `gorm:"uniqueIndex"`
    CreatedAt time.Time
    UpdatedAt time.Time
}
```

## Verificación de salud

```go
app.RegisterHealthChecker(ssgorm.NewHealthChecker(db))
// → "database": "UP" en GET /health
```

## Extender el repositorio genérico

El repositorio genérico cubre CRUD estándar. Para consultas personalizadas, embébelo:

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
