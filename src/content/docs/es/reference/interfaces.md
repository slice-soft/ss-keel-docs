---
title: Contratos
description: Los contratos compartidos en ss-keel-core/contracts usados por el runtime, los addons y los módulos de aplicación.
---

`ss-keel-core/contracts` es el límite estable entre el runtime de Keel y las integraciones de infraestructura.
Esta referencia sigue `ss-keel-core` `v0.11.0`.

El runtime depende de contratos, los addons oficiales implementan contratos y las aplicaciones pueden construir sus propios adapters sobre las mismas interfaces. Esta es la capa que mantiene a Keel modular sin filtrar detalles de infraestructura dentro de `ss-keel-core`.

## Por qué existe la capa de contratos

El paquete `contracts` existe para:

- mantener a `core.App` independiente de implementaciones de base de datos, cache, auth y brokers
- permitir que los addons dependan de abstracciones estables en lugar de paquetes de aplicación
- dar a los módulos generados y escritos a mano una superficie compartida de abstracción
- mantener límites claros entre el runtime del core, los contratos y los addons

Los addons oficiales de persistencia prueban compatibilidad con el contrato compartido en tiempo de compilación:

```go
var _ contracts.Repository[any, any, httpx.PageQuery, httpx.Page[any]] =
    (*database.GormRepository[any, any])(nil)

var _ contracts.Repository[any, any, httpx.PageQuery, httpx.Page[any]] =
    (*mongo.MongoRepository[any, any])(nil)
```

## Module

Unidad básica de registro de la aplicación.

```go
type Module[A any] interface {
    Register(app A)
}
```

`core.App.Use(...)` y `core.Group.Use(...)` aceptan `contracts.Module[*core.App]`.

## Controller

Proveedor de rutas usado por el runtime.

```go
type Controller[R any] interface {
    Routes() []R
}
```

Helper:

```go
type ControllerFunc[R any] func() []R
```

Keel usa `contracts.Controller[httpx.Route]`.

## Repository

Contrato genérico de persistencia.

```go
type Repository[T any, ID any, Q any, P any] interface {
    FindByID(ctx context.Context, id ID) (*T, error)
    FindAll(ctx context.Context, q Q) (P, error)
    Create(ctx context.Context, entity *T) error
    Update(ctx context.Context, id ID, entity *T) error
    Patch(ctx context.Context, id ID, patch *T) error
    Delete(ctx context.Context, id ID) error
}
```

Ambos addons oficiales de persistencia implementan:

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

Contrato de middleware para autenticación y autorización.

```go
type Guard interface {
    Middleware() fiber.Handler
}
```

**Implementado por:** `ss-keel-jwt`

## TokenSigner

Contrato para firmar un JWT tras un flujo de autenticación exitoso (p.ej. callback OAuth).

```go
type TokenSigner interface {
    Sign(subject string, data map[string]any) (string, error)
}
```

`subject` es un identificador único del usuario, típicamente `"<proveedor>:<user-id>"` (p.ej. `"google:1234567890"`).
`data` es un mapa arbitrario de claims que se almacena en el payload del token bajo la clave `"data"`.

**Implementado por:** `ss-keel-jwt` · **Usado por:** `ss-keel-oauth`

## Addon

Contrato base implementado por cualquier addon.

```go
type Addon interface {
    ID() string
}
```

`ID()` devuelve el identificador estable del addon usado por el runtime, el CLI y la documentación, por ejemplo `gorm`, `redis` o `devpanel`.

## Manifestable

Contrato para addons que exponen metadata legible por maquina al CLI y al panel.

```go
type EnvVar struct {
    Key         string
    ConfigKey   string
    Description string
    Required    bool
    Secret      bool
    Default     string
    Source      string
}

type AddonManifest struct {
    ID           string
    Version      string
    Capabilities []string
    Resources    []string
    EnvVars      []EnvVar
}

type Manifestable interface {
    Manifest() AddonManifest
}
```

Usa `Manifest()` cuando un addon necesita publicar sus capacidades, recursos y variables de entorno visibles para la configuracion.

## Debuggable y PanelRegistry

Contratos usados por `ss-keel-devpanel` para recopilar eventos en vivo de los addons.

```go
type PanelEvent struct {
    Timestamp time.Time
    AddonID   string
    Label     string
    Detail    map[string]any
    Level     string
}

type Debuggable interface {
    PanelID() string
    PanelLabel() string
    PanelEvents() <-chan PanelEvent
}

type PanelRegistry interface {
    RegisterAddon(d Debuggable)
}
```

Los addons `Debuggable` transmiten eventos al panel, mientras que `PanelRegistry` es el contrato implementado por el propio panel para que los addons se registren durante su setup.

## PanelComponent y DebuggableWithView

Contratos opcionales para addons que quieren una vista personalizada en el panel en vez de la tabla generica de eventos.

```go
type PanelComponent interface {
    Render(ctx context.Context, w io.Writer) error
}

type DebuggableWithView interface {
    Debuggable
    PanelView() PanelComponent
}
```

`PanelComponent` es intencionalmente minimo para que `ss-keel-core` no dependa de un paquete UI concreto. Cualquier renderer compatible puede satisfacerlo mediante el tipado estructural de Go.

## Publisher y Subscriber

Contratos de mensajería.

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

Contrato usado por `/health`.

```go
type HealthChecker interface {
    Name() string
    Check(ctx context.Context) error
}
```

`database.NewHealthChecker(...)` y `mongo.NewHealthChecker(...)` son las implementaciones oficiales actuales de persistencia.

## MetricsCollector y Tracer

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

Contrato de logging orientado a addons.

```go
type Logger interface {
    Info(format string, args ...interface{})
    Warn(format string, args ...interface{})
    Error(format string, args ...interface{})
    Debug(format string, args ...interface{})
}
```

El `logger.Logger` integrado en `ss-keel-core/logger` satisface este contrato y puede pasarse a configuraciones de addons como `database.Config.Logger` y `mongo.Config.Logger`.

Consulta [Arquitectura](/es/guides/architecture) para la vista general del ecosistema y [Persistencia](/es/guides/persistence) para las integraciones oficiales de persistencia.
