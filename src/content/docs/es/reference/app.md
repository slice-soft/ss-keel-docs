---
title: App
description: "Referencia de la estructura App: constructor, configuración y métodos disponibles."
---

La estructura `App` es la pieza central de ss-keel-core. Envuelve una app de Fiber y agrega routing estructurado, logging, generación OpenAPI, apagado ordenado e integraciones opcionales.

## Constructor

```go
func core.New(cfg KConfig) *App
```

Crea una nueva instancia `App`. Inicializa Fiber con:
- Middleware de logging de requests
- Middleware CORS
- Middleware de recuperación ante panic
- Error handler (`*KError` → respuesta JSON)
- Endpoint `GET /health` (salvo que `DisableHealth: true`)
- Endpoints `GET /docs` y `GET /docs/openapi.json` (salvo que `Env: "production"`)

## KConfig

```go
type KConfig struct {
    ServiceName   string
    Port          int        // default: 3000
    Env           string     // "development" | "staging" | "production"
    DisableHealth bool
    Docs          DocsConfig
}
```

### DocsConfig

```go
type DocsConfig struct {
    Path        string     // default: "/docs"
    Title       string
    Version     string     // default: "1.0.0"
    Description string
    Contact     *DocsContact
    License     *DocsLicense
    Servers     []string   // formato: "url - descripción"
    Tags        []DocsTag
}

type DocsContact struct {
    Name  string
    URL   string
    Email string
}

type DocsLicense struct {
    Name string
    URL  string
}

type DocsTag struct {
    Name        string
    Description string
}
```

## Métodos

### Registro de rutas y módulos

```go
func (a *App) RegisterController(c Controller)
func (a *App) Use(m Module)
func (a *App) Group(prefix string, middlewares ...fiber.Handler) *Group
```

### Iniciar servidor

```go
func (a *App) Listen() error
```

Inicia el servidor HTTP en una goroutine y luego queda bloqueado esperando `SIGINT` o `SIGTERM`. Al recibir señal:
1. Deja de aceptar nuevas conexiones
2. Ejecuta los shutdown hooks registrados con timeout de 10 segundos
3. Finaliza el proceso

### Shutdown hooks

```go
func (a *App) OnShutdown(fn func(context.Context) error)
```

Registra una función para ejecutarse durante el apagado ordenado. Los hooks corren en orden de registro con un contexto compartido de 10 segundos.

```go
app.OnShutdown(func(ctx context.Context) error {
    return db.Close()
})
```

### Acceso a internos

```go
func (a *App) Logger() *logger.Logger
func (a *App) Fiber() *fiber.App   // acceso a instancia Fiber subyacente
func (a *App) Tracer() Tracer      // retorna tracer configurado (nunca nil)
```

### Observabilidad

```go
func (a *App) SetMetricsCollector(mc MetricsCollector)
func (a *App) SetTracer(t Tracer)
func (a *App) SetTranslator(t Translator)
```

### Scheduler

```go
func (a *App) RegisterScheduler(s Scheduler)
```

Registra un scheduler y conecta automáticamente un shutdown hook que llama `s.Stop(ctx)`.

### Verificaciones de salud

```go
func (a *App) RegisterHealthChecker(h HealthChecker)
```

Agrega un health checker. Todos los checkers se ejecutan en paralelo cuando se llama `GET /health`. Si alguno falla, el endpoint responde `503`. Ver [Health Checks](/reference/health).

## Ejemplo completo

```go
package main

import (
    "context"
    "log"
    "github.com/slice-soft/ss-keel-core/core"
)

func main() {
    app := core.New(core.KConfig{
        ServiceName: "users-api",
        Port:        8080,
        Env:         "development",
        Docs: core.DocsConfig{
            Title:       "Users API",
            Version:     "1.0.0",
            Description: "Gestiona cuentas de usuario",
            Contact: &core.DocsContact{
                Name:  "Soporte",
                Email: "dev@example.com",
            },
            Servers: []string{
                "http://localhost:8080 - Local",
                "https://api.example.com - Producción",
            },
            Tags: []core.DocsTag{
                {Name: "users", Description: "Gestión de usuarios"},
            },
        },
    })

    app.Use(&users.Module{})

    app.OnShutdown(func(ctx context.Context) error {
        log.Println("apagando aplicación...")
        return nil
    })

    if err := app.Listen(); err != nil {
        log.Fatal(err)
    }
}
```
