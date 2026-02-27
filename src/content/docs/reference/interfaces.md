---
title: Interfaces
description: All extension interfaces — Repository, Cache, Guard, Mailer, Storage, Scheduler, Metrics, Tracer, and Translator.
---

ss-keel-core is built around interfaces. The core package defines the contracts; you provide the implementation (or use an official addon when available).

---

## Repository

Generic CRUD contract for data access. `T` is your entity type, `ID` is the identifier type.

```go
type Repository[T any, ID any] interface {
    FindByID(ctx context.Context, id ID) (*T, error)
    FindAll(ctx context.Context, q PageQuery) (Page[T], error)
    Create(ctx context.Context, entity *T) error
    Update(ctx context.Context, id ID, entity *T) error
    Delete(ctx context.Context, id ID) error
}
```

### Example

```go
type UserRepository interface {
    core.Repository[User, string]
}

// Implementation
type PostgresUserRepository struct{ db *sql.DB }

func (r *PostgresUserRepository) FindByID(ctx context.Context, id string) (*User, error) {
    // SELECT * FROM users WHERE id = $1
}

func (r *PostgresUserRepository) FindAll(ctx context.Context, q core.PageQuery) (core.Page[User], error) {
    offset := (q.Page - 1) * q.Limit
    // SELECT * FROM users LIMIT $1 OFFSET $2
}

// ... Create, Update, Delete
```

---

## Cache

Key-value cache interface.

```go
type Cache interface {
    Get(ctx context.Context, key string) ([]byte, error)
    Set(ctx context.Context, key string, value []byte, ttl time.Duration) error
    Delete(ctx context.Context, key string) error
    Exists(ctx context.Context, key string) (bool, error)
}
```

### Example

```go
type UserService struct {
    cache core.Cache
    repo  UserRepository
}

func (s *UserService) GetByID(ctx context.Context, id string) (*User, error) {
    data, err := s.cache.Get(ctx, "user:"+id)
    if err == nil {
        var user User
        json.Unmarshal(data, &user)
        return &user, nil
    }

    user, err := s.repo.FindByID(ctx, id)
    if err != nil {
        return nil, err
    }

    b, _ := json.Marshal(user)
    s.cache.Set(ctx, "user:"+id, b, 5*time.Minute)
    return user, nil
}
```

---

## Guard

Authentication/authorization middleware.

```go
type Guard interface {
    Middleware() fiber.Handler
}
```

### Example

```go
type JWTGuard struct{ secret string }

func (g *JWTGuard) Middleware() fiber.Handler {
    return func(c *fiber.Ctx) error {
        token := c.Get("Authorization")
        claims, err := verifyJWT(token, g.secret)
        if err != nil {
            return core.Unauthorized("invalid token")
        }
        ctx := &core.Ctx{Ctx: c}
        ctx.SetUser(claims)
        return c.Next()
    }
}
```

See [Authentication](/guides/authentication) for full usage.

---

## Publisher & Subscriber

Async messaging interfaces.

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

### Example

```go
// Publishing
func (s *OrderService) Create(ctx context.Context, order *Order) error {
    if err := s.repo.Create(ctx, order); err != nil {
        return err
    }

    payload, _ := json.Marshal(order)
    return s.publisher.Publish(ctx, core.Message{
        Topic:   "orders.created",
        Key:     []byte(order.ID),
        Payload: payload,
    })
}

// Subscribing
s.subscriber.Subscribe(ctx, "orders.created", func(ctx context.Context, msg core.Message) error {
    var order Order
    json.Unmarshal(msg.Payload, &order)
    return s.sendConfirmationEmail(ctx, &order)
})
```

---

## Mailer

Email sending interface.

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

### Example

```go
func (s *AuthService) SendPasswordReset(ctx context.Context, user *User, token string) error {
    return s.mailer.Send(ctx, core.Mail{
        From:     "noreply@example.com",
        To:       []string{user.Email},
        Subject:  "Reset your password",
        HTMLBody: buildResetEmailHTML(user.Name, token),
        TextBody: buildResetEmailText(user.Name, token),
    })
}
```

---

## Storage

Object storage interface (e.g., S3, GCS, local disk).

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

### Example

```go
func (s *AvatarService) Upload(ctx context.Context, userID string, file io.Reader, size int64) (string, error) {
    key := fmt.Sprintf("avatars/%s.jpg", userID)

    if err := s.storage.Put(ctx, key, file, size, "image/jpeg"); err != nil {
        return "", core.Internal("failed to upload avatar", err)
    }

    url, err := s.storage.URL(ctx, key, 24*time.Hour)
    if err != nil {
        return "", err
    }

    return url, nil
}
```

---

## Scheduler

Cron job scheduler interface.

```go
type Job struct {
    Name     string
    Schedule string // cron expression, e.g. "*/5 * * * *"
    Handler  func(ctx context.Context) error
}

type Scheduler interface {
    Add(job Job) error
    Start()
    Stop(ctx context.Context)
}
```

### Registering a Scheduler

```go
app.RegisterScheduler(scheduler)
```

`RegisterScheduler` automatically wires `scheduler.Stop(ctx)` as a shutdown hook.

### Example

```go
scheduler.Add(core.Job{
    Name:     "cleanup-expired-sessions",
    Schedule: "0 * * * *", // every hour
    Handler: func(ctx context.Context) error {
        return sessionRepo.DeleteExpired(ctx)
    },
})

scheduler.Add(core.Job{
    Name:     "send-weekly-digest",
    Schedule: "0 9 * * 1", // every Monday at 9am
    Handler: func(ctx context.Context) error {
        return mailer.SendWeeklyDigest(ctx)
    },
})

scheduler.Start()
app.RegisterScheduler(scheduler)
```

---

## MetricsCollector

Hook into the request lifecycle to record metrics.

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
```

### Registering

```go
app.SetMetricsCollector(prometheusCollector)
```

### Example

```go
type PrometheusCollector struct {
    histogram *prometheus.HistogramVec
}

func (c *PrometheusCollector) RecordRequest(m core.RequestMetrics) {
    c.histogram.WithLabelValues(
        m.Method,
        m.Path,
        strconv.Itoa(m.StatusCode),
    ).Observe(m.Duration.Seconds())
}
```

---

## Tracer

Distributed tracing interface compatible with OpenTelemetry patterns.

```go
type Span interface {
    SetAttribute(key string, value any)
    RecordError(err error)
    End()
}

type Tracer interface {
    Start(ctx context.Context, name string) (context.Context, Span)
}
```

A no-op tracer is used by default — zero overhead if you don't set one.

### Registering

```go
app.SetTracer(otelTracer)
```

### Accessing

```go
tracer := app.Tracer()

func (s *UserService) GetByID(ctx context.Context, id string) (*User, error) {
    ctx, span := tracer.Start(ctx, "UserService.GetByID")
    defer span.End()

    user, err := s.repo.FindByID(ctx, id)
    if err != nil {
        span.RecordError(err)
        return nil, err
    }

    span.SetAttribute("user.id", id)
    return user, nil
}
```

---

## Translator

Internationalization interface for translating strings.

```go
type Translator interface {
    T(locale, key string, args ...any) string
    Locales() []string
}
```

### Registering

```go
app.SetTranslator(i18nTranslator)
```

### Using in Handlers

```go
func (c *UserController) create(ctx *core.Ctx) error {
    msg := ctx.T("users.created_successfully")
    return ctx.Created(map[string]string{"message": msg})
}
```

`ctx.T(key, args...)` reads the locale from the `Accept-Language` header automatically.

See [`Ctx.T`](/reference/context#t-key-string-args-any-string) and [`Ctx.Lang`](/reference/context#lang-string) for details.
