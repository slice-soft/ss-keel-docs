---
title: Configuracion de DevPanel
description: Config runtime, middleware y defaults de seguridad para ss-keel-devpanel.
---

El setup generado monta el panel antes de las rutas de la aplicacion:

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

## Superficie de config

```go
panel := devpanel.New(devpanel.Config{
    Enabled: true,
    Secret:  "strong-token",
    Path:    "/keel/panel",
})
```

| Campo | Default | Proposito |
|---|---|---|
| `Enabled` | `true` | Habilita o deshabilita el panel |
| `Secret` | vacio | Bearer token opcional para acceso |
| `Path` | `/keel/panel` | Prefijo de URL del panel |

## Notas de seguridad

- Deshabilita el panel en produccion si no lo necesitas.
- Usa `KEEL_PANEL_SECRET` y HTTPS cuando el panel este expuesto.
- `GlobalGuard()` responde `404` para rutas del panel cuando esta deshabilitado.
- El addon aplica rate limiting sobre sus endpoints.
