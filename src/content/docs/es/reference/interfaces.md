---
title: Interfaces
description: "Todas las interfaces de extensión: Repository, Cache, Guard, Mailer, Storage, Scheduler, Metrics, Tracer y Translator."
---

ss-keel-core está construido alrededor de interfaces. El paquete core define contratos; tú provees implementaciones (o usas addons oficiales cuando estén disponibles).

---

## Repository

Contrato CRUD genérico para acceso a datos. `T` es el tipo de entidad y `ID` el tipo del identificador.

```go
type Repository[T any, ID any] interface {
    FindByID(ctx context.Context, id ID) (*T, error)
    FindAll(ctx context.Context, q PageQuery) (Page[T], error)
    Create(ctx context.Context, entity *T) error
    Update(ctx context.Context, id ID, entity *T) error
    Delete(ctx context.Context, id ID) error
}
```

### Ejemplo

```go
type UserRepository interface {
    core.Repository[User, string]
}

// Implementación
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

Interfaz de cache clave-valor.

```go
type Cache interface {
    Get(ctx context.Context, key string) ([]byte, error)
    Set(ctx context.Context, key string, value []byte, ttl time.Duration) error
    Delete(ctx context.Context, key string) error
    Exists(ctx context.Context, key string) (bool, error)
}
```

### Ejemplo

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

Middleware de autenticación/autorización.

```go
type Guard interface {
    Middleware() fiber.Handler
}
```

### Ejemplo

```go
type JWTGuard struct{ secret string }

func (g *JWTGuard) Middleware() fiber.Handler {
    return func(c *fiber.Ctx) error {
        token := c.Get("Authorization")
        claims, err := verifyJWT(token, g.secret)
        if err != nil {
            return core.Unauthorized("token inválido")
        }
        ctx := &core.Ctx{Ctx: c}
        ctx.SetUser(claims)
        return c.Next()
    }
}
```

Consulta [Autenticación](/guides/authentication) para el uso completo.

---

## Publisher y Subscriber

Interfaces para mensajería asíncrona.

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

### Ejemplo

```go
// Publicar
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

// Suscribirse
s.subscriber.Subscribe(ctx, "orders.created", func(ctx context.Context, msg core.Message) error {
    var order Order
    json.Unmarshal(msg.Payload, &order)
    return s.sendConfirmationEmail(ctx, &order)
})
```

---

## Mailer

Interfaz de envío de correos.

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

### Ejemplo

```go
func (s *AuthService) SendPasswordReset(ctx context.Context, user *User, token string) error {
    return s.mailer.Send(ctx, core.Mail{
        From:     "noreply@example.com",
        To:       []string{user.Email},
        Subject:  "Restablece tu contraseña",
        HTMLBody: buildResetEmailHTML(user.Name, token),
        TextBody: buildResetEmailText(user.Name, token),
    })
}
```

---

## Storage

Interfaz de almacenamiento de objetos (S3, GCS, disco local, etc.).

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

### Ejemplo

```go
func (s *AvatarService) Upload(ctx context.Context, userID string, file io.Reader, size int64) (string, error) {
    key := fmt.Sprintf("avatars/%s.jpg", userID)

    if err := s.storage.Put(ctx, key, file, size, "image/jpeg"); err != nil {
        return "", core.Internal("falló carga de avatar", err)
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

Interfaz para planificador de jobs tipo cron.

```go
type Job struct {
    Name     string
    Schedule string // expresión cron, por ejemplo "*/5 * * * *"
    Handler  func(ctx context.Context) error
}

type Scheduler interface {
    Add(job Job) error
    Start()
    Stop(ctx context.Context)
}
```

### Registrar un Scheduler

```go
app.RegisterScheduler(scheduler)
```

`RegisterScheduler` conecta automáticamente `scheduler.Stop(ctx)` como shutdown hook.

### Ejemplo

```go
scheduler.Add(core.Job{
    Name:     "cleanup-expired-sessions",
    Schedule: "0 * * * *", // cada hora
    Handler: func(ctx context.Context) error {
        return sessionRepo.DeleteExpired(ctx)
    },
})

scheduler.Add(core.Job{
    Name:     "send-weekly-digest",
    Schedule: "0 9 * * 1", // cada lunes a las 9am
    Handler: func(ctx context.Context) error {
        return mailer.SendWeeklyDigest(ctx)
    },
})

scheduler.Start()
app.RegisterScheduler(scheduler)
```

---

## MetricsCollector

Hook para registrar métricas durante el ciclo de vida del request.

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

### Registrar

```go
app.SetMetricsCollector(prometheusCollector)
```

### Ejemplo

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

Interfaz de tracing distribuido compatible con patrones OpenTelemetry.

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

Por defecto se usa un tracer no-op, con overhead cero si no configuras uno.

### Registrar

```go
app.SetTracer(otelTracer)
```

### Acceder

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

Interfaz de internacionalización para traducir cadenas.

```go
type Translator interface {
    T(locale, key string, args ...any) string
    Locales() []string
}
```

### Registrar

```go
app.SetTranslator(i18nTranslator)
```

### Usar en handlers

```go
func (c *UserController) create(ctx *core.Ctx) error {
    msg := ctx.T("users.created_successfully")
    return ctx.Created(map[string]string{"message": msg})
}
```

`ctx.T(key, args...)` detecta locale desde `Accept-Language` automáticamente.

Consulta [`Ctx.T`](/reference/context/) y [`Ctx.Lang`](/reference/context/) para más detalles.
