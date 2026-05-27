---
title: Instalacion de OTel
description: Instalar ss-keel-otel y entender el wiring generado para Keel.
---

Instala el addon con:

```bash
keel add otel
```

Instalación manual:

```bash
go get github.com/slice-soft/ss-keel-otel
```

## Que genera `keel add otel`

- Agrega `github.com/slice-soft/ss-keel-otel` a las dependencias.
- Crea `cmd/setup_otel.go`.
- Inyecta `_ = setupOtel(app, appLogger)` en `cmd/main.go`.
- Añade las claves de propiedades OTel y los ejemplos de `.env`.

Bootstrap generado:

```go
// cmd/setup_otel.go — creado por keel add otel
package main

import (
    "github.com/slice-soft/ss-keel-core/config"
    "github.com/slice-soft/ss-keel-core/core"
    "github.com/slice-soft/ss-keel-core/logger"
    ssotel "github.com/slice-soft/ss-keel-otel/otel"
)

// setupOtel inicializa el SDK de OpenTelemetry y registra el middleware HTTP de Fiber.
// Todo se omite cuando OTEL_ENABLED=false.
func setupOtel(app *core.App, log *logger.Logger) *ssotel.Provider {
    otelConfig := config.MustLoadConfig[ssotel.Config]()
    otelConfig.Logger = log

    provider, err := ssotel.New(otelConfig)
    if err != nil {
        log.Error("failed to initialise otel: %v", err)
        return provider
    }

    app.SetTracer(provider)
    app.Fiber().Use(provider.Middleware())
    app.OnShutdown(provider.Shutdown)

    return provider
}
```

Lo que se inyecta en `cmd/main.go`:

```go
_ = setupOtel(app, appLogger)
```

## Orden de setup

El middleware OTel debe registrarse **antes de los módulos** para que cada petición reciba un span. El punto de inyección generado garantiza esto en la estructura de `keel new`.

Cuando también está instalado `devpanel`, registra primero el middleware del panel para que capture el ciclo de vida completo del span:

```go
// Orden correcto en cmd/main.go
panel := setupDevPanel(app, appLogger)   // captura peticiones raw
otel  := setupOtel(app, appLogger)       // envuelve peticiones en spans
db    := setupGorm(app, appLogger)       // usa spans para trazado de queries
```
