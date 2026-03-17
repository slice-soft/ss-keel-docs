---
title: Addons
description: Official addon packages that extend Keel through the contracts layer, including the official persistence integrations.
---

Addons are separate Go modules that implement `ss-keel-core/contracts`.

This is the extension model used across the Keel ecosystem:

- `ss-keel-core` owns the runtime and the contracts package
- addon repositories implement those contracts
- applications decide which addons to compose in `main.go`

See [Architecture](/en/guides/architecture) for the layer boundaries.

## Official persistence integrations

The persistence layer is not built into `core`. It lives in official addons.

| Package | Description | Contract |
|---|---|---|
| [`ss-keel-gorm`](/en/addons/ss-keel-gorm) | Official relational persistence addon for PostgreSQL, MySQL, MariaDB, SQLite, and SQL Server | `contracts.Repository[T, ID, httpx.PageQuery, httpx.Page[T]]` |
| [`ss-keel-mongo`](/en/addons/ss-keel-mongo) | Official MongoDB persistence addon using the official Go driver | `contracts.Repository[T, ID, httpx.PageQuery, httpx.Page[T]]` |

Official example coverage today:

- `ss-keel-examples/examples/08-gorm-postgres` for `ss-keel-gorm`
- `ss-keel-examples/examples/13-mongo` for `ss-keel-mongo`
- `ss-keel-examples/examples/10-addon-example` for addon consumption patterns

See [Persistence](/en/guides/persistence) for the official persistence overview.

## Addon ecosystem

The addon ecosystem is organized into three repositories:

- `ss-keel-cli`: provides `keel add` and executes addon installation steps
- `ss-keel-addon-template`: GitHub template to bootstrap new addon repositories
- `ss-keel-addons`: official alias registry consumed by `keel add`

Recommended entry points:

- Install addons: [`add` command](/en/cli/add/)
- Create and publish addons: [Addon Ecosystem](/en/addons/ecosystem/)

## Available addon categories

### Databases

| Package | Description | Contract |
|---|---|---|
| [`ss-keel-gorm`](/en/addons/ss-keel-gorm) | Relational persistence via GORM | `Repository[T, ID, httpx.PageQuery, httpx.Page[T]]` |
| [`ss-keel-mongo`](/en/addons/ss-keel-mongo) | MongoDB persistence via mongo-driver | `Repository[T, ID, httpx.PageQuery, httpx.Page[T]]` |

### Cache and sessions

| Package | Description | Contract |
|---|---|---|
| [`ss-keel-redis`](/en/addons/ss-keel-redis) | Redis via go-redis for cache and sessions | `Cache` |

### Authentication

| Package | Description | Contract |
|---|---|---|
| [`ss-keel-jwt`](/en/addons/ss-keel-jwt) | JWT generation, validation, and guards | `Guard` |
| [`ss-keel-oauth`](/en/addons/ss-keel-oauth) | OAuth2 providers and guards | `Guard` |

### Messaging

| Package | Description | Contract |
|---|---|---|
| [`ss-keel-amqp`](/en/addons/ss-keel-amqp) | RabbitMQ via amqp091-go | `Publisher` / `Subscriber` |
| [`ss-keel-kafka`](/en/addons/ss-keel-kafka) | Kafka via franz-go | `Publisher` / `Subscriber` |

### Communication

| Package | Description | Contract |
|---|---|---|
| [`ss-keel-mail`](/en/addons/ss-keel-mail) | Email via SMTP, Resend, or SendGrid | `Mailer` |
| [`ss-keel-ws`](/en/addons/ss-keel-ws) | WebSockets on Fiber | — |

### Storage

| Package | Description | Contract |
|---|---|---|
| [`ss-keel-storage`](/en/addons/ss-keel-storage) | S3, GCS, and local disk with a unified API | `Storage` |

### Observability

| Package | Description | Contract |
|---|---|---|
| [`ss-keel-metrics`](/en/addons/ss-keel-metrics) | Prometheus metrics + `/metrics` endpoint | `MetricsCollector` |
| [`ss-keel-tracing`](/en/addons/ss-keel-tracing) | Distributed tracing with OpenTelemetry | `Tracer` |

### Jobs

| Package | Description | Contract |
|---|---|---|
| [`ss-keel-cron`](/en/addons/ss-keel-cron) | Scheduled jobs with cron expressions | `Scheduler` |

### i18n

| Package | Description | Contract |
|---|---|---|
| [`ss-keel-i18n`](/en/addons/ss-keel-i18n) | Internationalization and translations | `Translator` |

## Build your own adapter

Each addon is a contract implementation. You can build one without changing the runtime:

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

See [Contracts](/en/reference/interfaces) for the full contract catalog.
