---
title: DevPanel Configuration
description: Runtime config, middleware, and security defaults for ss-keel-devpanel.
---

The generated setup mounts the panel before application routes:

```go
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

## Config surface

```go
panel := devpanel.New(devpanel.Config{
    Enabled: true,
    Secret:  "strong-token",
    Path:    "/keel/panel",
})
```

| Field | Default | Purpose |
|---|---|---|
| `Enabled` | `true` | Enable or disable the panel |
| `Secret` | empty | Optional Bearer token for panel access |
| `Path` | `/keel/panel` | URL prefix for panel routes |

## Security notes

- Disable the panel in production when you do not need it.
- Use `KEEL_PANEL_SECRET` and HTTPS whenever the panel is exposed.
- `GlobalGuard()` returns `404` for panel routes when the panel is disabled.
- The panel rate-limits requests at the addon level.
