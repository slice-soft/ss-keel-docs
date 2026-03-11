---
title: Addons
description: Paquetes addon oficiales que extienden Keel a través de la capa de contratos, incluyendo las integraciones oficiales de persistencia.
---

Los addons son módulos Go separados que implementan `ss-keel-core/contracts`.

Este es el modelo de extensión usado en todo el ecosistema Keel:

- `ss-keel-core` es dueño del runtime y del paquete `contracts`
- los repositorios addon implementan esos contratos
- las aplicaciones deciden qué addons componer en `main.go`

Consulta [Arquitectura](/guides/architecture) para los límites entre capas.

## Integraciones oficiales de persistencia

La capa de persistencia no está integrada en `core`. Vive en addons oficiales.

| Paquete | Descripción | Contrato |
|---|---|---|
| [`ss-keel-gorm`](/addons/ss-keel-gorm) | Addon oficial de persistencia relacional para PostgreSQL, MySQL, MariaDB, SQLite y SQL Server | `contracts.Repository[T, ID, httpx.PageQuery, httpx.Page[T]]` |
| [`ss-keel-mongo`](/addons/ss-keel-mongo) | Addon oficial de persistencia para MongoDB usando el driver oficial de Go | `contracts.Repository[T, ID, httpx.PageQuery, httpx.Page[T]]` |

Cobertura oficial de ejemplos hoy:

- `ss-keel-examples/examples/08-gorm-postgres` para `ss-keel-gorm`
- `ss-keel-examples/examples/10-addon-example` para patrones de consumo de addons

Los snippets de Mongo en la documentación usan ejemplos neutrales respaldados por la API oficial de `ss-keel-mongo` y los templates del CLI hasta que exista un ejemplo oficial de Mongo.

Consulta [Persistencia](/guides/persistence) para la visión oficial de persistencia.

## Ecosistema de addons

El ecosistema de addons se organiza en tres repositorios:

- `ss-keel-cli`: expone `keel add` y ejecuta los pasos de instalación del addon
- `ss-keel-addon-template`: template de GitHub para bootstrap de nuevos repositorios addon
- `ss-keel-addons`: registry oficial de aliases consumido por `keel add`

Puntos de entrada recomendados:

- Instalar addons: [Comando `add`](/cli/add/)
- Crear y publicar addons: [Ecosistema de Addons](/addons/ecosystem/)

## Categorías de addons disponibles

### Bases de datos

| Paquete | Descripción | Contrato |
|---|---|---|
| [`ss-keel-gorm`](/addons/ss-keel-gorm) | Persistencia relacional vía GORM | `Repository[T, ID, httpx.PageQuery, httpx.Page[T]]` |
| [`ss-keel-mongo`](/addons/ss-keel-mongo) | Persistencia MongoDB vía mongo-driver | `Repository[T, ID, httpx.PageQuery, httpx.Page[T]]` |

### Cache y sesiones

| Paquete | Descripción | Contrato |
|---|---|---|
| [`ss-keel-redis`](/addons/ss-keel-redis) | Redis vía go-redis para cache y sesiones | `Cache` |

### Autenticación

| Paquete | Descripción | Contrato |
|---|---|---|
| [`ss-keel-jwt`](/addons/ss-keel-jwt) | Generación, validación y guards JWT | `Guard` |
| [`ss-keel-oauth`](/addons/ss-keel-oauth) | Proveedores OAuth2 y guards | `Guard` |

### Mensajería

| Paquete | Descripción | Contrato |
|---|---|---|
| [`ss-keel-amqp`](/addons/ss-keel-amqp) | RabbitMQ vía amqp091-go | `Publisher` / `Subscriber` |
| [`ss-keel-kafka`](/addons/ss-keel-kafka) | Kafka vía franz-go | `Publisher` / `Subscriber` |

### Comunicación

| Paquete | Descripción | Contrato |
|---|---|---|
| [`ss-keel-mail`](/addons/ss-keel-mail) | Correo vía SMTP, Resend o SendGrid | `Mailer` |
| [`ss-keel-ws`](/addons/ss-keel-ws) | WebSockets sobre Fiber | — |

### Almacenamiento

| Paquete | Descripción | Contrato |
|---|---|---|
| [`ss-keel-storage`](/addons/ss-keel-storage) | S3, GCS y disco local con API unificada | `Storage` |

### Observabilidad

| Paquete | Descripción | Contrato |
|---|---|---|
| [`ss-keel-metrics`](/addons/ss-keel-metrics) | Métricas Prometheus + endpoint `/metrics` | `MetricsCollector` |
| [`ss-keel-tracing`](/addons/ss-keel-tracing) | Tracing distribuido con OpenTelemetry | `Tracer` |

### Jobs

| Paquete | Descripción | Contrato |
|---|---|---|
| [`ss-keel-cron`](/addons/ss-keel-cron) | Jobs programados con expresiones cron | `Scheduler` |

### i18n

| Paquete | Descripción | Contrato |
|---|---|---|
| [`ss-keel-i18n`](/addons/ss-keel-i18n) | Internacionalización y traducciones | `Translator` |

## Construye tu propio adapter

Cada addon es una implementación de contratos. Puedes construir uno sin cambiar el runtime:

```go
type InMemoryCache struct {
    mu    sync.RWMutex
    store map[string][]byte
}

func (c *InMemoryCache) Get(ctx context.Context, key string) ([]byte, error) {
    c.mu.RLock()
    defer c.mu.RUnlock()
    v, ok := c.store[key]
    if !ok {
        return nil, errors.New("key not found")
    }
    return v, nil
}
```

Consulta [Contratos](/reference/interfaces) para el catálogo completo de contratos.
