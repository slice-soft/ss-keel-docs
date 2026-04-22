---
title: ss-keel-devpanel
description: Real-time observability dev panel for Keel applications — requests, logs, addon events, routes, and config embedded in your binary.
---

`ss-keel-devpanel` is the official observability addon for Keel. It embeds a real-time UI directly in your Go binary to inspect HTTP requests, logs, addon events, registered routes, and runtime configuration — with zero external dependencies.

**Current stable release:** `v1.10.0` (2026-04-22)

## Browse this addon

- [Overview](/en/addons/ss-keel-devpanel/overview/)
- [Installation](/en/addons/ss-keel-devpanel/installation/)
- [Configuration](/en/addons/ss-keel-devpanel/configuration/)
- [Examples](/en/addons/ss-keel-devpanel/examples/)

## Installation

```bash
keel add devpanel
```

Or manually:

```bash
go get github.com/slice-soft/ss-keel-devpanel
```

## Bootstrap

When you run `keel add devpanel`, the CLI creates `cmd/setup_devpanel.go` and injects one line into `cmd/main.go`:

```go
// cmd/setup_devpanel.go — created by keel add devpanel
package main

import (
    "github.com/slice-soft/ss-keel-core/config"
    "github.com/slice-soft/ss-keel-core/core"
    "github.com/slice-soft/ss-keel-devpanel/devpanel"
)

// setupDevPanel mounts the real-time observability panel on the Fiber app.
// Set panel.enabled=false in production to disable the panel.
func setupDevPanel(app *core.App) *devpanel.DevPanel {
    panelConfig := config.MustLoadConfig[devpanel.Config]()
    panel := devpanel.New(panelConfig)
    fiberApp := app.Fiber()
    fiberApp.Use(panel.RequestMiddleware())
    fiberApp.Use(panel.GlobalGuard())
    panel.Mount(fiberApp)
    return panel
}
```

The following is injected into `cmd/main.go`:

```go
panel := setupDevPanel(app)
defer panel.Shutdown()
```

The required environment variables are added to `.env`:

```
KEEL_PANEL_ENABLED=true
KEEL_PANEL_SECRET=
KEEL_PANEL_PATH=/keel/panel
```

Open `http://localhost:7331/keel/panel` in your browser once the server is running.

## Configuration

```go
panel := devpanel.New(devpanel.Config{
    Enabled: true,             // set false in production
    Secret:  "strong-token",   // optional Bearer token
    Path:    "/keel/panel",    // default path prefix
})
```

| Field     | Type   | Default       | Description                                    |
|-----------|--------|---------------|------------------------------------------------|
| `Enabled` | bool   | `true`        | Enable the panel. Set `false` in production.   |
| `Secret`  | string | `""`          | Bearer token. Empty = no authentication.       |
| `Path`    | string | `/keel/panel` | URL prefix for all panel routes.               |

## Panel pages

### Requests

Captures the last 256 HTTP requests with method, path, status code, latency, and request ID. Panel routes are excluded automatically.

### Logs

Captures the last 512 log entries written via `PanelLogger`. New entries stream live to connected browsers over SSE. Use `WithRequestID` to correlate log entries with a specific request:

```go
logger := panel.Logger()

app.Use(func(c *fiber.Ctx) error {
    reqLogger := logger.WithRequestID(c.Get("X-Request-ID"))
    c.Locals("logger", reqLogger)
    return c.Next()
})

// In a handler:
log := c.Locals("logger").(*devpanel.PanelLogger)
log.Info("user fetched: %s", userID)
```

### Routes

Lists all Fiber routes registered on the application at a glance.

### Addons

Shows all addons that have self-registered with the panel. Any addon implementing `contracts.Debuggable` streams its `PanelEvents()` live:

```go
// In your addon's Register step:
func (a *MyAddon) Register(app *keel.App) error {
    if panel, ok := app.GetAddon("devpanel").(contracts.PanelRegistry); ok {
        panel.RegisterAddon(a)
    }
    return nil
}
```

Addons that also implement `contracts.Manifestable` expose version, capabilities, and resources in the detail view.

### Config

Displays all env vars declared by the panel and each registered `Manifestable` addon, Go runtime stats (goroutines, heap, sys), and addon manifests. Secret env var values are automatically redacted.

## Security

- **Always disable in production** — set `KEEL_PANEL_ENABLED=false`.
- **Use a secret** — set `KEEL_PANEL_SECRET` to a strong random token and serve over HTTPS when the panel is enabled.
- `GlobalGuard()` provides defence-in-depth at the app middleware level: any request whose path starts with `Config.Path` receives a 404 immediately when the panel is disabled.
- Every panel response includes the `X-Keel-Panel: true` header.
- Rate limiting: 120 requests per minute per IP on all panel endpoints.
