---
title: ss-keel-devpanel
description: Panel de observabilidad en tiempo real para aplicaciones Keel — requests, logs, eventos de addons, rutas y configuración embebidos en tu binario.
---

`ss-keel-devpanel` es el addon oficial de observabilidad para Keel. Embebe una interfaz en tiempo real directamente en tu binario Go para inspeccionar requests HTTP, logs, eventos de addons, rutas registradas y configuración de runtime — sin dependencias externas.

## Navega este addon

- [Resumen](/es/addons/ss-keel-devpanel/overview/)
- [Instalacion](/es/addons/ss-keel-devpanel/installation/)
- [Configuracion](/es/addons/ss-keel-devpanel/configuration/)
- [Ejemplos](/es/addons/ss-keel-devpanel/examples/)

## Instalación

```bash
keel add devpanel
```

O manualmente:

```bash
go get github.com/slice-soft/ss-keel-devpanel
```

## Bootstrap

Al ejecutar `keel add devpanel`, el CLI crea `cmd/setup_devpanel.go` e inyecta una línea en `cmd/main.go`:

```go
// cmd/setup_devpanel.go — creado por keel add devpanel
package main

import (
    "github.com/slice-soft/ss-keel-core/config"
    "github.com/slice-soft/ss-keel-core/core"
    "github.com/slice-soft/ss-keel-devpanel/devpanel"
)

// setupDevPanel monta el panel de observabilidad en la app Fiber.
// Establece panel.enabled=false en producción para deshabilitar el panel.
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

Lo siguiente se inyecta en `cmd/main.go`:

```go
panel := setupDevPanel(app)
defer panel.Shutdown()
```

Las variables de entorno necesarias se agregan a `.env`:

```
KEEL_PANEL_ENABLED=true
KEEL_PANEL_SECRET=
KEEL_PANEL_PATH=/keel/panel
```

Abre `http://localhost:7331/keel/panel` en tu navegador una vez que el servidor esté corriendo.

## Configuración

```go
panel := devpanel.New(devpanel.Config{
    Enabled: true,             // establecer false en producción
    Secret:  "token-secreto",  // Bearer token opcional
    Path:    "/keel/panel",    // prefijo de URL por defecto
})
```

| Campo     | Tipo   | Default       | Descripción                                         |
|-----------|--------|---------------|-----------------------------------------------------|
| `Enabled` | bool   | `true`        | Habilita el panel. Establece `false` en producción. |
| `Secret`  | string | `""`          | Bearer token. Vacío = sin autenticación.            |
| `Path`    | string | `/keel/panel` | Prefijo de URL para todas las rutas del panel.      |

## Páginas del panel

### Requests

Captura los últimos 256 requests HTTP con método, ruta, código de estado, latencia e ID de request. Las rutas del propio panel se excluyen automáticamente.

### Logs

Captura las últimas 512 entradas de log escritas vía `PanelLogger`. Las nuevas entradas se transmiten en vivo a los navegadores conectados por SSE. Usa `WithRequestID` para correlacionar entradas de log con un request específico:

```go
logger := panel.Logger()

app.Use(func(c *fiber.Ctx) error {
    reqLogger := logger.WithRequestID(c.Get("X-Request-ID"))
    c.Locals("logger", reqLogger)
    return c.Next()
})

// En un handler:
log := c.Locals("logger").(*devpanel.PanelLogger)
log.Info("usuario obtenido: %s", userID)
```

### Routes

Lista todas las rutas Fiber registradas en la aplicación de un vistazo.

### Addons

Muestra todos los addons que se han auto-registrado en el panel. Cualquier addon que implemente `contracts.Debuggable` transmite sus `PanelEvents()` en vivo:

```go
// En el paso Register de tu addon:
func (a *MyAddon) Register(app *keel.App) error {
    if panel, ok := app.GetAddon("devpanel").(contracts.PanelRegistry); ok {
        panel.RegisterAddon(a)
    }
    return nil
}
```

Los addons que también implementen `contracts.Manifestable` exponen versión, capacidades y recursos en la vista de detalle.

### Config

Muestra todas las variables de entorno declaradas por el panel y cada addon `Manifestable` registrado, estadísticas de runtime de Go (goroutines, heap, sys) y manifests de addons. Los valores de variables de entorno secretas se redactan automáticamente.

## Seguridad

- **Siempre deshabilitar en producción** — establece `KEEL_PANEL_ENABLED=false`.
- **Usa un secreto** — establece `KEEL_PANEL_SECRET` con un token aleatorio robusto y sirve sobre HTTPS cuando el panel esté habilitado.
- `GlobalGuard()` provee defensa en profundidad a nivel de middleware de la app: cualquier request cuya ruta comience con `Config.Path` recibe un 404 inmediatamente cuando el panel está deshabilitado.
- Cada respuesta del panel incluye el header `X-Keel-Panel: true`.
- Rate limiting: 120 requests por minuto por IP en todos los endpoints del panel.
