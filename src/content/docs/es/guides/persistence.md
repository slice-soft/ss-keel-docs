---
title: Persistencia
description: Integraciones oficiales de persistencia en Keel a través de addons, con ejemplos de repos oficiales y ejemplos neutrales donde aún no existe un ejemplo oficial.
---

La persistencia en Keel es basada en addons. El runtime no trae una capa de base de datos integrada. En cambio, las aplicaciones componen addons oficiales de persistencia y los inyectan en los módulos que los necesitan.

Hoy las integraciones oficiales de persistencia son:

| Addon | Backend | Implementa | Capacidades extra |
|---|---|---|---|
| `ss-keel-gorm` | PostgreSQL, MySQL, MariaDB, SQLite, SQL Server, Oracle | `contracts.Repository[T, ID, httpx.PageQuery, httpx.Page[T]]` | Acceso GORM, motores SQL, helpers de migración, DB health checker |
| `ss-keel-mongo` | MongoDB | `contracts.Repository[T, ID, httpx.PageQuery, httpx.Page[T]]` | Consultas por filtro, acceso directo a colecciones, conversión de ObjectID, Mongo health checker |

## Cobertura de ejemplos oficiales

Los ejemplos oficiales actualmente cubren:

- `ss-keel-examples/examples/08-gorm-postgres` para persistencia relacional con `ss-keel-gorm`

Todavía no existe un ejemplo oficial de Mongo en `ss-keel-examples`, así que los snippets de Mongo más abajo son ejemplos neutrales derivados de la API real de `ss-keel-mongo` y de los templates oficiales del CLI.

## Integración GORM desde el repositorio oficial de ejemplos

`ss-keel-examples/examples/08-gorm-postgres` demuestra el wiring oficial del addon relacional:

```go
dbInstance, err := database.New(database.Config{
    Engine:   database.EnginePostgres,
    Host:     dbHost,
    Port:     dbPort,
    User:     dbUser,
    Password: dbPassword,
    Database: dbName,
    SSLMode:  dbSSLMode,
})
if err != nil {
    log.Error("failed to connect to database: %v", err)
}

app.RegisterHealthChecker(database.NewHealthChecker(dbInstance))
```

Ese ejemplo también muestra:

- `db.AutoMigrate(...)`
- rutas CRUD respaldadas por GORM
- `/health` exponiendo el estado de la base de datos

## Wrappers de repositorio generados por el CLI

Cuando quieres repositorios a nivel de módulo en lugar de llamar al driver o al ORM directamente desde los handlers, los templates oficiales del CLI generan wrappers como estos.

Forma del template GORM en `ss-keel-cli`:

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

Forma del template Mongo en `ss-keel-cli`:

El template Mongo genera un tipo de documento interno separado (`ProductMongoDocument`) que mapea `primitive.ObjectID` hacia y desde el `string` ID de la entidad. Los timestamps se sellan automáticamente mediante `entity.OnCreate()` / `entity.OnUpdate()` en cada método CRUD.

```go
type ProductMongoDocument struct {
    ID        primitive.ObjectID `bson:"_id,omitempty"`
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
        repo: mongo.NewRepository[ProductMongoDocument, string](
            client, "product", mongo.WithObjectIDHex[ProductMongoDocument](),
        ),
        log: log,
    }
}
```

Esos wrappers se generan con:

```bash
keel generate repository users/product --gorm
keel generate repository users/product --mongo
```

Ambos addons incluyen también un struct `EntityBase` que puedes embeber en cualquier entidad para obtener `ID`, `CreatedAt` y `UpdatedAt` con las etiquetas correctas ya configuradas. Ver [ss-keel-gorm](/es/addons/ss-keel-gorm#entitybase) y [ss-keel-mongo](/es/addons/ss-keel-mongo#entitybase) para detalles.

## Ejemplo neutral de composición con múltiples addons

El siguiente es un ejemplo neutral basado en las APIs oficiales. Muestra cómo un servicio puede componer ambos addons de persistencia sin convertir ninguno en parte del runtime del core:

```go
app := core.New(core.KConfig{ ... })

mongoClient, err := mongo.New(mongo.Config{ ... })
if err != nil {
    appLogger.Error("failed to connect to mongodb: %v", err)
    return
}
app.RegisterHealthChecker(mongo.NewHealthChecker(mongoClient))
app.Use(catalog.NewModule(appLogger, mongoClient))

sqlDB, err := database.New(database.Config{
    Engine: database.EnginePostgres,
    DSN:    config.GetEnvOrDefault("DATABASE_URL", ""),
    Logger: appLogger,
})
if err != nil {
    appLogger.Error("failed to connect to database: %v", err)
    return
}
app.RegisterHealthChecker(database.NewHealthChecker(sqlDB))
app.Use(billing.NewModule(appLogger, sqlDB))
```

Esto mantiene la arquitectura limpia:

- el runtime del core es dueño de la composición
- los addons son dueños de las implementaciones de persistencia
- cada módulo recibe solo la dependencia que necesita

## Estructura del proyecto

Los proyectos creados con `keel new` comienzan con el scaffold del CLI:

```text
my-app/
├── cmd/
│   └── main.go
├── internal/
│   └── modules/
│       └── starter/
│           ├── module.go
│           ├── controller.go
│           ├── service.go
│           └── dto.go
├── go.mod
├── keel.toml
└── .gitignore
```

A medida que la aplicación crece, los módulos con persistencia siguen la misma estructura `internal/modules/<name>/...`, sin importar si el repositorio está respaldado por GORM o Mongo.

## Workflow del CLI para persistencia

```bash
keel add gorm
keel add mongo

keel generate repository users/product --gorm
keel generate repository billing/audit-log --mongo
```

`keel add` instala e integra el addon. `keel generate repository` usa el template oficial de repositorio para el backend seleccionado.

## Cómo elegir un addon

- Usa `ss-keel-gorm` para modelos relacionales y persistencia SQL-first.
- Usa `ss-keel-mongo` para persistencia document-first y patrones de consulta nativos de Mongo.
- Usa ambos en el mismo servicio cuando distintos módulos tienen modelos de almacenamiento distintos.

Consulta [Arquitectura](/es/guides/architecture) para la vista general del ecosistema y [ss-keel-gorm](/es/addons/ss-keel-gorm) / [ss-keel-mongo](/es/addons/ss-keel-mongo) para detalles específicos de cada addon.
