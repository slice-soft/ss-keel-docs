---
title: ss-keel-mongo
description: Addon oficial de persistencia MongoDB para Keel usando el contrato compartido de repositorio y flujos document-first.
---

`ss-keel-mongo` es el addon oficial de persistencia MongoDB para Keel.

Implementa el mismo contrato de repositorio compartido usado por `ss-keel-gorm`:

```go
contracts.Repository[T, ID, httpx.PageQuery, httpx.Page[T]]
```

Encima de ese contrato, expone capacidades nativas de Mongo como consultas por filtro, acceso directo a colecciones y conversión de `ObjectID`.

## Instalación

```bash
keel add mongo
```

O manualmente:

```bash
go get github.com/slice-soft/ss-keel-mongo
```

## Bootstrap

```go
import (
    "github.com/slice-soft/ss-keel-core/config"
    "github.com/slice-soft/ss-keel-mongo/mongo"
)

client, err := mongo.New(mongo.Config{
    URI:      config.GetEnvOrDefault("MONGO_URI", "mongodb://localhost:27017"),
    Database: config.GetEnvOrDefault("MONGO_DATABASE", "app"),
    Logger:   appLogger,
})
if err != nil {
    appLogger.Error("failed to start app: %v", err)
    return
}
defer client.Close()

app.RegisterHealthChecker(mongo.NewHealthChecker(client))
```

Defaults útiles del addon:

- `URI`: `mongodb://localhost:27017`
- `ConnectTimeout`: `10s`
- `PingTimeout`: `2s`
- `DisconnectTimeout`: `5s`
- `ServerSelectionTimeout`: `5s`
- `MaxPoolSize`: `25`
- `MaxConnIdleTime`: `15m`

## Estado de cobertura oficial

El repositorio oficial de ejemplos todavía no incluye un ejemplo específico de Mongo.

El wrapper de repositorio de abajo viene del template oficial de repositorio Mongo en `ss-keel-cli`, y el bootstrap de runtime de esta página viene de la API real de `ss-keel-mongo`.

## Wrapper de repositorio generado por el CLI

```go
type ProductEntity struct {
    ID string `bson:"_id,omitempty" json:"id"`
}

type ProductRepository struct {
    *mongo.MongoRepository[ProductEntity, string]
    log *logger.Logger
}

func NewProductRepository(log *logger.Logger, client *mongo.Client) *ProductRepository {
    return &ProductRepository{
        MongoRepository: mongo.NewRepository[ProductEntity, string](
            client,
            "product",
            mongo.WithObjectIDHex[ProductEntity](),
        ),
        log: log,
    }
}
```

Ese wrapper se genera con:

```bash
keel generate repository product --repository-db mongo
```

## Comportamiento CRUD

`mongo.MongoRepository[T, ID]` implementa:

```go
repo.FindByID(ctx, id)
repo.FindAll(ctx, httpx.PageQuery{Page: 1, Limit: 20})
repo.Create(ctx, &entity)
repo.Update(ctx, id, &entity)
repo.Delete(ctx, id)
```

Comportamiento tomado de la implementación real:

- `FindByID` devuelve `nil, nil` cuando no existe documento
- `FindAll` pagina la colección y devuelve `httpx.Page[T]`
- `Update` aplica `$set` a todos los campos que no son ID
- `Delete` elimina un documento por el ID del repositorio

## Helpers nativos de Mongo

Cuando el contrato genérico de repositorio no alcanza, usa los helpers del addon:

```go
repo.FindOneByFilter(ctx, bson.M{"email": "ada@keel.dev"})
repo.FindMany(ctx, bson.M{"profile.country": "CO"})

coll := repo.Collection()
cursor, err := coll.Find(ctx, bson.M{"profile.country": "CO"})
```

## Estrategias de ID

Si tu API recibe hex strings pero Mongo almacena `_id` como `ObjectID`, usa:

```go
mongo.WithObjectIDHex[ProductEntity]()
```

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

Consulta [Persistencia](/guides/persistence) para la visión oficial de persistencia.
