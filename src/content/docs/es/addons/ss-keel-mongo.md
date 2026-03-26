---
title: ss-keel-mongo
description: Addon oficial de persistencia MongoDB para Keel usando el contrato compartido de repositorio y flujos document-first.
---

`ss-keel-mongo` es el addon oficial de persistencia MongoDB para Keel.

Implementa el mismo contrato de repositorio compartido usado por `ss-keel-gorm`:

```go
contracts.Repository[T, ID, httpx.PageQuery, httpx.Page[T]]
```

Encima de ese contrato, expone capacidades nativas de Mongo como consultas por filtro, acceso directo a colecciones y conversión personalizada de IDs.

## Instalación

```bash
keel add mongo
```

O manualmente:

```bash
go get github.com/slice-soft/ss-keel-mongo
```

## Bootstrap

Al ejecutar `keel add mongo`, el CLI crea `cmd/setup_mongo.go` y agrega una línea en `cmd/main.go`:

```go
// cmd/setup_mongo.go — creado por keel add mongo
package main

import (
    "github.com/slice-soft/ss-keel-core/config"
    "github.com/slice-soft/ss-keel-core/core"
    "github.com/slice-soft/ss-keel-core/logger"
    "github.com/slice-soft/ss-keel-mongo/mongo"
)

// setupMongo inicializa el cliente MongoDB y registra el health checker.
func setupMongo(app *core.App, log *logger.Logger) *mongo.Client {
    mongoConfig := config.MustLoadConfig[mongo.Config]()
    mongoConfig.Logger = log

    mongoClient, err := mongo.New(mongoConfig)
    if err != nil {
        log.Error("failed to initialize MongoDB: %v", err)
    }
    app.RegisterHealthChecker(mongo.NewHealthChecker(mongoClient))
    return mongoClient
}
```

Lo siguiente se inyecta en `cmd/main.go`:

```go
mongoClient := setupMongo(app, appLogger)
defer mongoClient.Close()
```

Esto mantiene la inicialización aislada de `cmd/main.go`. Cada addon obtiene su propio archivo de setup.

Defaults útiles del addon:

- `URI`: `mongodb://localhost:27017`
- `ConnectTimeout`: `10s`
- `PingTimeout`: `2s`
- `DisconnectTimeout`: `5s`
- `ServerSelectionTimeout`: `5s`
- `MaxPoolSize`: `25`
- `MaxConnIdleTime`: `15m`

## Ejemplo oficial

El repositorio oficial de ejemplos incluye `ss-keel-examples/examples/13-mongo`, que demuestra:

- `mongo.New(...)`
- `mongo.NewRepository[Note, string](...)`
- `mongo.NewHealthChecker(...)`
- rutas CRUD con paginación, `EntityBase` y `OnCreate()` / `OnUpdate()`

El wrapper de repositorio de abajo viene del template oficial de repositorio Mongo en `keel`, y el bootstrap de runtime de esta página viene de la API real de `ss-keel-mongo`.

## EntityBase

`ss-keel-mongo` incluye un struct `EntityBase` listo para usar que puedes embeber en cualquier entidad de documento para obtener `ID`, `CreatedAt` y `UpdatedAt` con las etiquetas BSON correctas ya configuradas:

```go
// mongo.EntityBase
type EntityBase struct {
    ID        string `json:"id"         bson:"_id,omitempty"`
    CreatedAt int64  `json:"created_at" bson:"created_at,omitempty"`
    UpdatedAt int64  `json:"updated_at" bson:"updated_at,omitempty"`
}
```

Ejemplo de uso:

```go
import "github.com/slice-soft/ss-keel-mongo/mongo"

type ProductEntity struct {
    mongo.EntityBase
    Name  string  `bson:"name"`
    Price float64 `bson:"price"`
}
```

A diferencia de GORM, Mongo no puebla `CreatedAt`/`UpdatedAt` automáticamente. `EntityBase` incluye dos helpers para esto:

```go
entity.OnCreate() // asigna CreatedAt y UpdatedAt al timestamp Unix actual en milisegundos
entity.OnUpdate() // asigna solo UpdatedAt; CreatedAt queda sin cambios
```

El repositorio generado los llama automáticamente — `OnCreate()` antes de insertar y `OnUpdate()` antes de actualizar.

## Wrapper de repositorio generado por el CLI

El template Mongo genera un tipo de documento interno separado (`ProductMongoDocument`) que conserva IDs UUID string y separa la entidad de dominio de la representación BSON almacenada. La entidad y el documento Mongo se mantienen separados para que la capa de dominio nunca dependa de detalles específicos de Mongo.

Ese wrapper se genera con:

```bash
keel generate repository users/product --mongo
```

La forma generada es:

```go
// ProductMongoDocument es la representación interna de Mongo.
// Nunca se expone fuera del repositorio.
type ProductMongoDocument struct {
    ID        string             `bson:"_id,omitempty"`
    CreatedAt int64              `bson:"created_at"`
    UpdatedAt int64              `bson:"updated_at"`
    Name      string             `bson:"name"`
}

type ProductRepository struct {
    repo *mongo.MongoRepository[ProductMongoDocument, string]
    log  *logger.Logger
}

func NewProductRepository(log *logger.Logger, client *mongo.Client) *ProductRepository {
    return &ProductRepository{
        repo: mongo.NewRepository[ProductMongoDocument, string](client, "product"),
        log: log,
    }
}

// Create sella los timestamps con OnCreate y persiste el documento basado en UUID sin conversiones extra.
func (r *ProductRepository) Create(ctx context.Context, entity *ProductEntity) error {
    entity.OnCreate()
    document := toProductMongoDocument(entity)
    if err := r.repo.Create(ctx, &document); err != nil {
        return err
    }
    entity.ID = document.ID
    return nil
}

// Update reemplaza todos los campos del documento (semántica HTTP PUT).
func (r *ProductRepository) Update(ctx context.Context, id string, entity *ProductEntity) error {
    entity.OnUpdate()
    // normaliza el ID recibido, convierte a documento y delega a r.repo.Update
    ...
}

// Patch aplica una actualización parcial — solo escribe los campos presentes en entity (semántica HTTP PATCH).
func (r *ProductRepository) Patch(ctx context.Context, id string, entity *ProductEntity) error {
    entity.OnUpdate()
    normalizedID, err := normalizeProductID(id)
    if err != nil {
        return err
    }
    document := toProductMongoDocument(entity)
    return r.repo.Patch(ctx, normalizedID, &document)
}

// FindByID, FindAll y Delete siguen el mismo patrón de conversión documento↔entidad.
```

## Comportamiento CRUD

`mongo.MongoRepository[T, ID]` implementa:

```go
repo.FindByID(ctx, id)
repo.FindAll(ctx, httpx.PageQuery{Page: 1, Limit: 20})
repo.Create(ctx, &entity)
repo.Update(ctx, id, &entity)
repo.Patch(ctx, id, &entity)
repo.Delete(ctx, id)
```

Comportamiento tomado de la implementación real:

- `FindByID` devuelve `nil, nil` cuando no existe documento
- `FindAll` pagina la colección y devuelve `httpx.Page[T]`
- `Update` aplica `$set` a todos los campos que no son ID — reemplaza el documento completo (semántica HTTP PUT)
- `Patch` aplica `$set` solo a los campos explícitamente provistos en el patch document (semántica HTTP PATCH)
- `Delete` elimina un documento por el ID del repositorio

## Helpers nativos de Mongo

`mongo.MongoRepository[T, ID]` expone métodos adicionales más allá del contrato compartido. Agrega métodos personalizados a tu wrapper de repositorio para llamarlos:

```go
func (r *ProductRepository) FindByEmail(ctx context.Context, email string) (*ProductEntity, error) {
    doc, err := r.repo.FindOneByFilter(ctx, bson.M{"email": email})
    if err != nil || doc == nil {
        return nil, err
    }
    entity := toProductEntity(*doc)
    return &entity, nil
}

func (r *ProductRepository) FindByCountry(ctx context.Context, country string) ([]ProductEntity, error) {
    docs, err := r.repo.FindMany(ctx, bson.M{"profile.country": country})
    // ...
}

// Para control total, accede directamente a la colección:
coll := r.repo.Collection()
cursor, err := coll.Find(ctx, bson.M{"profile.country": "CO"})
```

## Estrategias de ID

También puedes personalizar el campo ID o la lógica de conversión:

```go
mongo.NewRepository[User, string](
    client,
    "users",
    mongo.WithIDField[User, string]("slug"),
    mongo.WithIDConverter[User, string](func(id string) (interface{}, error) {
        return strings.ToLower(id), nil
    }),
)
```

## Integración con health

`mongo.NewHealthChecker(client)` expone la dependencia en `GET /health` como:

```json
{ "mongodb": "UP" }
```

## Cuándo usarlo

- Usa `ss-keel-mongo` para módulos document-first.
- Úsalo cuando las consultas por filtro y los campos BSON anidados forman parte del modelo de dominio.
- Úsalo junto con `ss-keel-gorm` cuando distintos módulos necesitan modelos de persistencia distintos.

Consulta [Persistencia](/es/guides/persistence) para la visión oficial de persistencia.
