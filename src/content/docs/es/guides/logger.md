---
title: Logger
description: "Usa el logger estructurado en toda tu aplicación: módulos, servicios y handlers."
---

ss-keel-core incluye un logger estructurado disponible desde que creas la app. Esta guía muestra cómo obtenerlo y usarlo en toda la aplicación. Para la API completa, revisa [Referencia → Logger](/reference/logger).

## Obtener el Logger

El logger se crea internamente en `core.New()`. Accede con `app.Logger()`:

```go
// main.go
cfg := config.Load()

app := core.New(core.KConfig{
    ServiceName: cfg.ServiceName,
    Port:        cfg.Port,
    Env:         cfg.Env,
})

log := app.Logger()
log.Info("App creada, registrando módulos...")
```

El logger se configura automáticamente según entorno:

| `Env` | Formato | Debug |
|---|---|---|
| `development` | Texto (legible) | Habilitado |
| `staging` / `production` | JSON (estructurado) | Deshabilitado |

## Pasar el logger a módulos

Pasa `app.Logger()` a tus módulos para que servicios y repositorios registren eventos sin importar el paquete `logger` directamente:

```go
// users/module.go
package users

import (
    "myapp/config"
    "github.com/slice-soft/ss-keel-core/core"
    "github.com/slice-soft/ss-keel-core/logger"
)

type Module struct {
    cfg config.Config
}

func New(cfg config.Config) *Module {
    return &Module{cfg: cfg}
}

func (m *Module) Register(app *core.App) {
    repo    := NewRepository(m.cfg.DatabaseURL)
    service := NewService(repo, app.Logger()) // ← inyecta logger
    app.RegisterController(NewController(service))
}
```

## Usar el logger en servicios

```go
// users/service.go
package users

import (
    "context"
    "github.com/slice-soft/ss-keel-core/core"
    "github.com/slice-soft/ss-keel-core/logger"
)

type Service struct {
    repo UserRepository
    log  *logger.Logger
}

func NewService(repo UserRepository, log *logger.Logger) *Service {
    return &Service{repo: repo, log: log}
}

func (s *Service) Create(ctx context.Context, dto *CreateUserDTO) (*User, error) {
    s.log.Debug("creando usuario con email %s", dto.Email)

    user, err := s.repo.Create(ctx, dto)
    if err != nil {
        s.log.Warn("falló creación de usuario: %v", err)
        return nil, core.Internal("falló creación de usuario", err)
    }

    s.log.Info("usuario creado: %s", user.ID)
    return user, nil
}

func (s *Service) Delete(ctx context.Context, id string) error {
    if err := s.repo.Delete(ctx, id); err != nil {
        return core.Internal("falló eliminación de usuario", err)
    }
    s.log.Info("usuario eliminado: %s", id)
    return nil
}
```

## Niveles de log

```go
log.Info("Servidor iniciado en puerto %d", cfg.Port)   // siempre visible
log.Debug("Query: %s", query)                          // solo desarrollo
log.Warn("Respuesta lenta: %dms", ms)                  // siempre visible
log.Error("Error fatal de arranque: %v", err)          // log + termina proceso
```

:::caution[Error termina el proceso]
Usa `log.Error` solo en fallos irrecuperables de arranque (BD inaccesible, config obligatoria ausente). Para errores en runtime de handlers, devuelve un `*KError`.
:::

## Logging automático de requests

No necesitas registrar los requests HTTP manualmente. ss-keel-core registra cada request automáticamente.

**Desarrollo (texto):**
```
[INFO]  GET    /users          200  1.2ms
[INFO]  POST   /users          201  3.8ms
[WARN]  GET    /users/999      404  0.5ms
```

**Producción (JSON):**
```json
{"level":"info","method":"GET","path":"/users","status":200,"duration":"1.2ms"}
{"level":"warn","method":"GET","path":"/users/999","status":404,"duration":"0.5ms"}
```

## Logging en main.go

Usa el logger alrededor de arranque y apagado:

```go
func main() {
    cfg := config.Load()

    app := core.New(core.KConfig{
        ServiceName: cfg.ServiceName,
        Port:        cfg.Port,
        Env:         cfg.Env,
    })

    log := app.Logger()
    log.Info("registrando módulos")

    app.Use(auth.New(cfg))
    app.Use(users.New(cfg))

    app.OnShutdown(func(ctx context.Context) error {
        log.Info("cerrando aplicación de forma ordenada")
        return nil
    })

    log.Info("iniciando %s en puerto %d", cfg.ServiceName, cfg.Port)
    app.Listen()
}
```
