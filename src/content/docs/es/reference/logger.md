---
title: Logger
description: Logger estructurado con modos de salida texto/JSON, niveles de log y writers personalizados.
---

El paquete `logger` provee un logger estructurado usado internamente por ss-keel-core y accesible desde tu código de aplicación.

## Importación

```go
import "github.com/slice-soft/ss-keel-core/logger"
```

## Crear un logger

```go
// Selecciona formato automáticamente según entorno
log := logger.NewLogger(isProduction bool)

// Formato explícito
log := logger.NewLoggerWithFormat(isProduction bool, format logger.LogFormat)
```

| Parámetro | `false` (desarrollo) | `true` (producción) |
|---|---|---|
| Formato | Texto | JSON |
| Logs debug | Habilitados | Deshabilitados |

```go
// Desarrollo
log := logger.NewLogger(false)

// Producción
log := logger.NewLogger(true)

// Forzar JSON en desarrollo (por ejemplo para agregación de logs)
log := logger.NewLoggerWithFormat(false, logger.LogFormatJSON)
```

## Constantes de formato

```go
logger.LogFormatText // "text"
logger.LogFormatJSON // "json"
```

## Niveles de log

### Info

Mensajes informativos generales.

```go
log.Info("Servidor iniciado en puerto %d", 3000)
log.Info("Usuario %s registrado", userID)
```

**Salida texto:**
```
[INFO]  2024-01-15 10:23:45 Server started on port 3000
```

**Salida JSON:**
```json
{"level":"info","time":"2024-01-15T10:23:45Z","message":"Server started on port 3000"}
```

### Debug

Salida de diagnóstico detallada. **Deshabilitada en producción.**

```go
log.Debug("Cache miss para key %s", key)
log.Debug("SQL: %s | args: %v", query, args)
```

### Warn

Condiciones no fatales que merecen atención.

```go
log.Warn("Rate limit cercano para IP %s", ip)
log.Warn("Query lenta detectada: %dms", duration.Milliseconds())
```

### Error

:::caution[Error termina la aplicación]
`Error` registra el mensaje y **ejecuta `os.Exit(1)`**. Úsalo solo para fallos irrecuperables de arranque. Para errores de runtime, devuelve `*KError` en handlers.
:::

```go
// Solo en arranque, para errores fatales de configuración:
db, err := sql.Open("postgres", dsn)
if err != nil {
    log.Error("falló conexión a base de datos: %v", err)
    // el proceso termina aquí
}
```

## Writer personalizado

Redirige salida a cualquier `io.Writer`; útil para pruebas o envío a agregadores:

```go
// Escribir en archivo
f, _ := os.OpenFile("app.log", os.O_APPEND|os.O_CREATE|os.O_WRONLY, 0644)
log := logger.NewLogger(true).WithWriter(f)

// Capturar en tests
var buf bytes.Buffer
log := logger.NewLogger(false).WithWriter(&buf)
```

`WithWriter` devuelve un **nuevo Logger** (no muta el original).

## Acceder al logger de App

`App` expone el logger que usa internamente:

```go
app := core.New(cfg)
log := app.Logger()

log.Info("Iniciando worker en background")
log.Debug("Config worker: %+v", workerCfg)
```

Pásalo a módulos y servicios:

```go
func (m *UserModule) Register(app *core.App) {
    log := app.Logger()
    service := NewUserService(repo, log)
    app.RegisterController(NewUserController(service))
}
```

## Logging automático de requests

ss-keel-core loguea cada request HTTP automáticamente. No debes configurarlo: ya viene en el stack de middleware de Fiber que crea `core.New()`.

Ejemplo (formato texto):
```
[INFO]  2024-01-15 10:23:45 GET /users 200 1.2ms
[INFO]  2024-01-15 10:23:46 POST /users 201 3.4ms
[WARN]  2024-01-15 10:23:47 GET /users/999 404 0.8ms
```

Ejemplo (formato JSON):
```json
{"level":"info","time":"2024-01-15T10:23:45Z","method":"GET","path":"/users","status":200,"duration":"1.2ms"}
{"level":"warn","time":"2024-01-15T10:23:47Z","method":"GET","path":"/users/999","status":404,"duration":"0.8ms"}
```

## Uso en servicios

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
        s.log.Warn("falló creación de usuario: %v", err)
        return nil, core.Internal("falló creación de usuario", err)
    }
    s.log.Info("usuario creado: %s", user.ID)
    return user, nil
}
```
