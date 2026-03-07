---
title: Addons
description: Paquetes addon oficiales que extienden ss-keel-core con base de datos, cache, auth, mensajería y más.
---

:::caution[Próximamente]
Todos los addons oficiales están en desarrollo activo. Las interfaces que implementan ya son **estables hoy**, así que puedes construir tus propios adapters mientras salen los paquetes oficiales.
:::

Los addons son módulos Go separados que implementan las [interfaces del core](/reference/interfaces). Instala solo lo que necesitas.

## Ecosistema de addons

El ecosistema de addons se organiza en tres repositorios:

- `ss-keel-cli`: expone `keel add` y ejecuta los pasos de instalación del addon.
- `ss-keel-addon-template`: template de GitHub para crear repositorios de addons.
- `ss-keel-addons`: registry oficial de aliases consumido por `keel add`.

Puntos de entrada recomendados:

- Instalar addons: [Comando `add`](/cli/add/)
- Crear/publicar addons: [Ecosistema de Addons](/addons/ecosystem/)

## Bases de datos

| Paquete | Descripción | Interfaz |
|---|---|---|
| [`ss-keel-gorm`](/addons/ss-keel-gorm) | PostgreSQL, MySQL, SQLite vía GORM | `Repository[T, ID]` |
| [`ss-keel-mongo`](/addons/ss-keel-mongo) | MongoDB vía mongo-driver | `Repository[T, ID]` |

## Cache y sesiones

| Paquete | Descripción | Interfaz |
|---|---|---|
| [`ss-keel-redis`](/addons/ss-keel-redis) | Redis vía go-redis para cache y sesiones | `Cache` |

## Autenticación

| Paquete | Descripción | Interfaz |
|---|---|---|
| [`ss-keel-jwt`](/addons/ss-keel-jwt) | Generación/validación JWT y guards listos para usar | `Guard` |
| [`ss-keel-oauth`](/addons/ss-keel-oauth) | OAuth2 con Google, GitHub y más | `Guard` |

## Mensajería

| Paquete | Descripción | Interfaz |
|---|---|---|
| [`ss-keel-amqp`](/addons/ss-keel-amqp) | RabbitMQ vía amqp091-go | `Publisher` / `Subscriber` |
| [`ss-keel-kafka`](/addons/ss-keel-kafka) | Kafka vía franz-go | `Publisher` / `Subscriber` |

## Comunicación

| Paquete | Descripción | Interfaz |
|---|---|---|
| [`ss-keel-mail`](/addons/ss-keel-mail) | Correo vía SMTP, Resend o SendGrid | `Mailer` |
| [`ss-keel-ws`](/addons/ss-keel-ws) | WebSockets sobre Fiber | — |

## Almacenamiento

| Paquete | Descripción | Interfaz |
|---|---|---|
| [`ss-keel-storage`](/addons/ss-keel-storage) | S3, GCS y disco local con API unificada | `Storage` |

## Observabilidad

| Paquete | Descripción | Interfaz |
|---|---|---|
| [`ss-keel-metrics`](/addons/ss-keel-metrics) | Métricas Prometheus + endpoint `/metrics` | `MetricsCollector` |
| [`ss-keel-tracing`](/addons/ss-keel-tracing) | Tracing distribuido con OpenTelemetry | `Tracer` |

## Jobs

| Paquete | Descripción | Interfaz |
|---|---|---|
| [`ss-keel-cron`](/addons/ss-keel-cron) | Jobs programados con expresiones cron | `Scheduler` |

## i18n

| Paquete | Descripción | Interfaz |
|---|---|---|
| [`ss-keel-i18n`](/addons/ss-keel-i18n) | Internacionalización y traducciones | `Translator` |

---

## Crear tu propio adapter

Cada addon es, en esencia, un struct que implementa una interfaz del core. Puedes construir uno hoy mismo:

```go
// Implementa Cache con almacenamiento en memoria
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

// ... implementar Set, Delete, Exists
```

Consulta [Referencia de Interfaces](/reference/interfaces) para todos los contratos.
