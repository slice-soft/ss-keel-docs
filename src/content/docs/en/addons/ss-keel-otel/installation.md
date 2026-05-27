---
title: OTel Installation
description: Install ss-keel-otel and understand the generated Keel wiring.
---

Install the addon with:

```bash
keel add otel
```

Manual install:

```bash
go get github.com/slice-soft/ss-keel-otel
```

## What `keel add otel` generates

- Adds `github.com/slice-soft/ss-keel-otel` to dependencies.
- Creates `cmd/setup_otel.go`.
- Injects `_ = setupOtel(app, appLogger)` into `cmd/main.go`.
- Appends OTel property keys and `.env` examples.

Generated bootstrap:

```go
// cmd/setup_otel.go — created by keel add otel
package main

import (
    "github.com/slice-soft/ss-keel-core/config"
    "github.com/slice-soft/ss-keel-core/core"
    "github.com/slice-soft/ss-keel-core/logger"
    ssotel "github.com/slice-soft/ss-keel-otel/otel"
)

// setupOtel initialises the OpenTelemetry SDK and registers the Fiber HTTP middleware.
// All telemetry is skipped when OTEL_ENABLED=false.
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

The following is injected into `cmd/main.go`:

```go
_ = setupOtel(app, appLogger)
```

## Setup order

OTel middleware must be registered **before modules** so every request gets a span. The generated injection point ensures this when combined with the standard `keel new` scaffold.

When `devpanel` is also installed, register the devpanel request middleware first so the panel captures the full span lifecycle:

```go
// Correct order in cmd/main.go
panel := setupDevPanel(app, appLogger)   // captures raw requests
otel  := setupOtel(app, appLogger)       // wraps requests in spans
db    := setupGorm(app, appLogger)       // uses spans for query tracing
```
