---
title: Contracts
description: The shared contracts in ss-keel-core/contracts used by the runtime, addons, and application modules.
---

`ss-keel-core/contracts` is the stable boundary between the Keel runtime and infrastructure integrations.

The runtime depends on contracts, official addons implement contracts, and applications can build their own adapters on top of the same interfaces. This is the layer that keeps Keel modular without leaking infrastructure details into `ss-keel-core`.

## Why the contracts layer exists

The contracts package exists to:

- keep `core.App` independent from database, cache, auth, and broker implementations
- let addons depend on stable abstractions instead of application packages
- give generated and hand-written modules a shared abstraction surface
- keep clear boundaries between the core runtime, contracts, and addons

The official persistence addons prove compatibility against the shared repository contract at compile time:

```go
var _ contracts.Repository[any, any, httpx.PageQuery, httpx.Page[any]] =
    (*database.GormRepository[any, any])(nil)

var _ contracts.Repository[any, any, httpx.PageQuery, httpx.Page[any]] =
    (*mongo.MongoRepository[any, any])(nil)
```

## Module

Basic application registration unit.

```go
type Module[A any] interface {
    Register(app A)
}
```

`core.App.Use(...)` and `core.Group.Use(...)` both accept `contracts.Module[*core.App]`.

## Controller

Route provider used by the runtime.

```go
type Controller[R any] interface {
    Routes() []R
}
```

Helper:

```go
type ControllerFunc[R any] func() []R
```

Keel uses `contracts.Controller[httpx.Route]`.

## Repository

Generic persistence contract.

```go
type Repository[T any, ID any, Q any, P any] interface {
    FindByID(ctx context.Context, id ID) (*T, error)
    FindAll(ctx context.Context, q Q) (P, error)
    Create(ctx context.Context, entity *T) error
    Update(ctx context.Context, id ID, entity *T) error
    Delete(ctx context.Context, id ID) error
}
```

The official persistence addons both implement:

```go
contracts.Repository[T, ID, httpx.PageQuery, httpx.Page[T]]
```

## Cache

```go
type Cache interface {
    Get(ctx context.Context, key string) ([]byte, error)
    Set(ctx context.Context, key string, value []byte, ttl time.Duration) error
    Delete(ctx context.Context, key string) error
    Exists(ctx context.Context, key string) (bool, error)
}
```

## Guard

Authentication and authorization middleware contract.

```go
type Guard interface {
    Middleware() fiber.Handler
}
```

## Publisher and Subscriber

Messaging contracts.

```go
type Message struct {
    Topic   string
    Key     []byte
    Payload []byte
    Headers map[string]string
}

type MessageHandler func(ctx context.Context, msg Message) error

type Publisher interface {
    Publish(ctx context.Context, msg Message) error
    Close() error
}

type Subscriber interface {
    Subscribe(ctx context.Context, topic string, handler MessageHandler) error
    Close() error
}
```

## Mailer

```go
type MailAttachment struct {
    Filename    string
    ContentType string
    Data        []byte
}

type Mail struct {
    From        string
    To          []string
    CC          []string
    BCC         []string
    Subject     string
    HTMLBody    string
    TextBody    string
    Attachments []MailAttachment
}

type Mailer interface {
    Send(ctx context.Context, mail Mail) error
}
```

## Storage

```go
type StorageObject struct {
    Key          string
    Size         int64
    ContentType  string
    LastModified time.Time
}

type Storage interface {
    Put(ctx context.Context, key string, r io.Reader, size int64, contentType string) error
    Get(ctx context.Context, key string) (io.ReadCloser, error)
    Delete(ctx context.Context, key string) error
    URL(ctx context.Context, key string, expiry time.Duration) (string, error)
    Stat(ctx context.Context, key string) (*StorageObject, error)
}
```

## Scheduler

```go
type Job struct {
    Name     string
    Schedule string
    Handler  func(ctx context.Context) error
}

type Scheduler interface {
    Add(job Job) error
    Start()
    Stop(ctx context.Context)
}
```

## HealthChecker

Contract used by `/health`.

```go
type HealthChecker interface {
    Name() string
    Check(ctx context.Context) error
}
```

`database.NewHealthChecker(...)` and `mongo.NewHealthChecker(...)` are the current official persistence implementations.

## MetricsCollector and Tracer

```go
type RequestMetrics struct {
    Method     string
    Path       string
    StatusCode int
    Duration   time.Duration
}

type MetricsCollector interface {
    RecordRequest(m RequestMetrics)
}

type Span interface {
    SetAttribute(key string, value any)
    RecordError(err error)
    End()
}

type Tracer interface {
    Start(ctx context.Context, name string) (context.Context, Span)
}
```

## Translator

```go
type Translator interface {
    T(locale, key string, args ...any) string
    Locales() []string
}
```

## Logger

Addon-facing logging contract.

```go
type Logger interface {
    Info(format string, args ...interface{})
    Warn(format string, args ...interface{})
    Error(format string, args ...interface{})
    Debug(format string, args ...interface{})
}
```

The built-in `logger.Logger` in `ss-keel-core/logger` satisfies this contract and can be passed into addon configs such as `database.Config.Logger` and `mongo.Config.Logger`.

See [Architecture](/guides/architecture) for the ecosystem layout and [Persistence](/guides/persistence) for the official persistence integrations.
