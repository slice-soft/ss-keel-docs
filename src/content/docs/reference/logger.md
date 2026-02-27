---
title: Logger
description: Structured logger with text and JSON output modes, log levels, and custom writers.
---

The `logger` package provides a structured logger used internally by ss-keel-core and accessible from your application code.

## Import

```go
import "github.com/slice-soft/ss-keel-core/logger"
```

## Creating a Logger

```go
// Auto-selects format based on environment
log := logger.NewLogger(isProduction bool)

// Explicit format
log := logger.NewLoggerWithFormat(isProduction bool, format logger.LogFormat)
```

| Parameter | `false` (development) | `true` (production) |
|---|---|---|
| Format | Text | JSON |
| Debug logs | Enabled | Disabled |

```go
// Development
log := logger.NewLogger(false)

// Production
log := logger.NewLogger(true)

// Force JSON in development (e.g. for log aggregation)
log := logger.NewLoggerWithFormat(false, logger.LogFormatJSON)
```

## Log Format Constants

```go
logger.LogFormatText // "text"
logger.LogFormatJSON // "json"
```

## Log Levels

### Info

General informational messages.

```go
log.Info("Server started on port %d", 3000)
log.Info("User %s registered", userID)
```

**Text output:**
```
[INFO]  2024-01-15 10:23:45 Server started on port 3000
```

**JSON output:**
```json
{"level":"info","time":"2024-01-15T10:23:45Z","message":"Server started on port 3000"}
```

### Debug

Detailed diagnostic output. **Disabled in production.**

```go
log.Debug("Cache miss for key %s", key)
log.Debug("SQL: %s | args: %v", query, args)
```

### Warn

Non-fatal conditions worth attention.

```go
log.Warn("Rate limit approaching for IP %s", ip)
log.Warn("Slow query detected: %dms", duration.Milliseconds())
```

### Error

:::caution[Error exits the application]
`Error` logs the message and **calls `os.Exit(1)`**. Use it only for unrecoverable startup failures. For runtime errors, return a `*KError` from handlers instead.
:::

```go
// Only at startup, for fatal configuration errors:
db, err := sql.Open("postgres", dsn)
if err != nil {
    log.Error("failed to connect to database: %v", err)
    // process exits here
}
```

## Custom Writer

Redirect output to any `io.Writer` — useful for testing or forwarding to a log aggregator:

```go
// Write to a file
f, _ := os.OpenFile("app.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
log := logger.NewLogger(true).WithWriter(f)

// Capture in tests
var buf bytes.Buffer
log := logger.NewLogger(false).WithWriter(&buf)
```

`WithWriter` returns a **new Logger** — the original is not modified.

## Accessing the App Logger

The `App` exposes the logger it uses internally:

```go
app := core.New(cfg)
log := app.Logger()

log.Info("Starting background worker")
log.Debug("Worker config: %+v", workerCfg)
```

Pass it to modules and services:

```go
func (m *UserModule) Register(app *core.App) {
    log := app.Logger()
    service := NewUserService(repo, log)
    app.RegisterController(NewUserController(service))
}
```

## Automatic Request Logging

ss-keel-core automatically logs every HTTP request. You don't need to configure this — it's included in the Fiber middleware stack set up by `core.New()`.

Example output (text format):
```
[INFO]  2024-01-15 10:23:45 GET /users 200 1.2ms
[INFO]  2024-01-15 10:23:46 POST /users 201 3.4ms
[WARN]  2024-01-15 10:23:47 GET /users/999 404 0.8ms
```

Example output (JSON format):
```json
{"level":"info","time":"2024-01-15T10:23:45Z","method":"GET","path":"/users","status":200,"duration":"1.2ms"}
{"level":"warn","time":"2024-01-15T10:23:47Z","method":"GET","path":"/users/999","status":404,"duration":"0.8ms"}
```

## Using in Services

```go
type UserService struct {
    repo UserRepository
    log  *logger.Logger
}

func NewUserService(repo UserRepository, log *logger.Logger) *UserService {
    return &UserService{repo: repo, log: log}
}

func (s *UserService) Create(ctx context.Context, dto *CreateUserDTO) (*User, error) {
    user, err := s.repo.Create(ctx, dto)
    if err != nil {
        s.log.Warn("failed to create user: %v", err)
        return nil, core.Internal("failed to create user", err)
    }
    s.log.Info("user created: %s", user.ID)
    return user, nil
}
```
