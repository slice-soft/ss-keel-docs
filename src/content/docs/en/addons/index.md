---
title: Addons
description: Official addon packages that extend ss-keel-core with databases, cache, auth, messaging, and more.
---

:::caution[Coming Soon]
All official addons are under active development. The interfaces they implement are already **stable today**, so you can build your own adapters while the official packages are released.
:::

Addons are separate Go modules that implement the [core interfaces](/reference/interfaces). Install only what you need.

## Databases

| Package | Description | Interface |
|---|---|---|
| [`ss-keel-gorm`](/addons/ss-keel-gorm) | PostgreSQL, MySQL, SQLite via GORM | `Repository[T, ID]` |
| [`ss-keel-mongo`](/addons/ss-keel-mongo) | MongoDB via mongo-driver | `Repository[T, ID]` |

## Cache and sessions

| Package | Description | Interface |
|---|---|---|
| [`ss-keel-redis`](/addons/ss-keel-redis) | Redis via go-redis for cache and sessions | `Cache` |

## Authentication

| Package | Description | Interface |
|---|---|---|
| [`ss-keel-jwt`](/addons/ss-keel-jwt) | JWT generation/validation and ready-to-use guards | `Guard` |
| [`ss-keel-oauth`](/addons/ss-keel-oauth) | OAuth2 with Google, GitHub and more | `Guard` |

## Messaging

| Package | Description | Interface |
|---|---|---|
| [`ss-keel-amqp`](/addons/ss-keel-amqp) | RabbitMQ via amqp091-go | `Publisher` / `Subscriber` |
| [`ss-keel-kafka`](/addons/ss-keel-kafka) | Kafka via franz-go | `Publisher` / `Subscriber` |

## Communication

| Package | Description | Interface |
|---|---|---|
| [`ss-keel-mail`](/addons/ss-keel-mail) | Email via SMTP, Resend or SendGrid | `Mailer` |
| [`ss-keel-ws`](/addons/ss-keel-ws) | WebSockets on Fiber | — |

## Storage

| Package | Description | Interface |
|---|---|---|
| [`ss-keel-storage`](/addons/ss-keel-storage) | S3, GCS and local disk with unified API | `Storage` |

## Observability

| Package | Description | Interface |
|---|---|---|
| [`ss-keel-metrics`](/addons/ss-keel-metrics) | Prometheus metrics + `/metrics` endpoint | `MetricsCollector` |
| [`ss-keel-tracing`](/addons/ss-keel-tracing) | Distributed tracing with OpenTelemetry | `Tracer` |

## Jobs

| Package | Description | Interface |
|---|---|---|
| [`ss-keel-cron`](/addons/ss-keel-cron) | Scheduled jobs with cron expressions | `Scheduler` |

## i18n

| Package | Description | Interface |
|---|---|---|
| [`ss-keel-i18n`](/addons/ss-keel-i18n) | Internationalization and translations | `Translator` |

---

## Build your own adapter

Each addon is, at its core, a struct that implements a core interface. You can build one today:

```go
// Implements Cache with in-memory storage
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

// ... implement Set, Delete, Exists
```

See [Interfaces Reference](/reference/interfaces) for all contracts.
