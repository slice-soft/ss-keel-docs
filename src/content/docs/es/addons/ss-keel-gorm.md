---
title: ss-keel-gorm
description: Addon oficial de persistencia relacional para Keel usando GORM y el contrato compartido de repositorio.
---

`ss-keel-gorm` es el addon oficial de persistencia relacional para Keel.

Expone `database.GormRepository[T, ID]`, que implementa el contrato de repositorio compartido usado por el runtime y los módulos de aplicación:

```go
contracts.Repository[T, ID, httpx.PageQuery, httpx.Page[T]]
```

Los motores soportados vienen del código real del addon en `ss-keel-gorm/database`:

- PostgreSQL
- MySQL
- MariaDB
- SQLite
- SQL Server
- Oracle

## Instalación

```bash
keel add gorm
```

O manualmente:

```bash
go get github.com/slice-soft/ss-keel-gorm
```

## Bootstrap

Al ejecutar `keel add gorm`, el CLI crea `cmd/setup_gorm.go` y agrega una línea en `cmd/main.go`:

```go
// cmd/setup_gorm.go — creado por keel add gorm
package main

import (
    "github.com/slice-soft/ss-keel-core/config"
    "github.com/slice-soft/ss-keel-core/core"
    "github.com/slice-soft/ss-keel-core/logger"
    "github.com/slice-soft/ss-keel-gorm/database"
)

// setupGorm inicializa la conexión a la base de datos y registra el health checker.
// SQLite se usa por defecto para que un proyecto nuevo pueda correr localmente sin infraestructura externa.
func setupGorm(app *core.App, log *logger.Logger) *database.DBinstance {
    dbConfig := config.MustLoadConfig[database.Config]()
    dbConfig.Logger = log

    db, err := database.New(dbConfig)
    if err != nil {
        log.Error("failed to initialize database: %v", err)
    }
    app.RegisterHealthChecker(database.NewHealthChecker(db))
    return db
}
```

Lo siguiente se inyecta en `cmd/main.go`:

```go
db := setupGorm(app, appLogger)
defer db.Close()
```

Esto mantiene la inicialización aislada de `cmd/main.go`. Cada addon obtiene su propio archivo de setup.

Defaults útiles del addon:

- `Engine`: `sqlite`
- `DSN`: `./app.db`
- `MaxOpenConns`: `25`
- `MaxIdleConns`: `5`
- `ConnMaxLifetime`: `30m`
- `ConnMaxIdleTime`: `15m`
- `SSLMode`: `disable`
- `TimeZone`: `UTC`

## Ejemplo oficial

El repositorio oficial de ejemplos incluye `ss-keel-examples/examples/08-gorm-postgres`, que demuestra:

- `database.New(...)`
- `db.AutoMigrate(...)`
- `database.NewHealthChecker(...)`
- rutas CRUD respaldadas por GORM

## EntityBase

`ss-keel-gorm` incluye un struct `EntityBase` listo para usar que puedes embeber en cualquier entidad GORM para obtener `ID`, `CreatedAt` y `UpdatedAt` con las etiquetas GORM correctas ya configuradas:

```go
// database.EntityBase
type EntityBase struct {
    ID        string `json:"id"         gorm:"primaryKey"`
    CreatedAt int64  `json:"created_at" gorm:"autoCreateTime:milli"`
    UpdatedAt int64  `json:"updated_at" gorm:"autoUpdateTime:milli"`
}
```

`CreatedAt` y `UpdatedAt` almacenan Unix en **milisegundos**. El hook `BeforeCreate` de GORM se ejecuta automáticamente antes de cada inserción y asigna un nuevo UUID v4 a `ID` si el campo está vacío — no necesitas generar IDs manualmente.

Ejemplo de uso:

```go
import "github.com/slice-soft/ss-keel-gorm/database"

type ProductEntity struct {
    database.EntityBase
    Name  string
    Price float64
}
```

Al llamar `repo.Create(ctx, &product)`, GORM ejecuta `BeforeCreate` que genera un UUID para `product.ID` (si está vacío) y luego asigna `CreatedAt` y `UpdatedAt` al tiempo actual en milisegundos.

## Wrapper de repositorio generado por el CLI

Cuando ejecutas `keel generate repository users/product --gorm`, la forma del template oficial es:

```go
type ProductEntity struct {
    database.EntityBase
    Name string `json:"name"`
}

type ProductRepository struct {
    *database.GormRepository[ProductEntity, string]
    log *logger.Logger
}

func NewProductRepository(log *logger.Logger, db *database.DBinstance) *ProductRepository {
    return &ProductRepository{
        GormRepository: database.NewGormRepository[ProductEntity, string](db),
        log:            log,
    }
}
```

Esto mantiene el comportamiento específico de GORM dentro del paquete del módulo mientras sigue exponiendo los métodos genéricos del repositorio.

## Comportamiento CRUD

`database.GormRepository[T, ID]` implementa:

```go
repo.FindByID(ctx, id)
repo.FindAll(ctx, httpx.PageQuery{Page: 1, Limit: 20})
repo.Create(ctx, &entity)
repo.Update(ctx, id, &entity)
repo.Patch(ctx, id, &entity)
repo.Delete(ctx, id)
```

Comportamiento tomado de la implementación real:

- `FindByID` devuelve `nil, nil` cuando el registro no existe
- `FindAll` cuenta el total de filas y devuelve `httpx.Page[T]`
- `Update` usa `Save` — reemplaza todos los campos (semántica HTTP PUT)
- `Patch` usa `Updates` — solo escribe los campos no-cero (semántica HTTP PATCH)
- `Delete` respeta el comportamiento soft-delete de GORM cuando el modelo lo soporta

## Consultas personalizadas

Usa `DB()` cuando el contrato genérico no sea suficiente:

```go
type UserRepository struct {
    *database.GormRepository[User, string]
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

## Migraciones y extensiones de motores

El addon también expone:

- `db.Migration(...)`
- `db.MigrationWithError(...)`
- `database.RegisterDialector(...)` para motores compatibles con GORM

## Integración con health

`database.NewHealthChecker(db)` implementa `contracts.HealthChecker` y expone la dependencia en `GET /health` como:

```json
{ "database": "UP" }
```

Consulta [Persistencia](/es/guides/persistence) para la visión oficial de persistencia.
