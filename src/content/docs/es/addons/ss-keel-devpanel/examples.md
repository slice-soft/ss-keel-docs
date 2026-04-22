---
title: Ejemplos de DevPanel
description: Ejemplos reales de montaje y uso de ss-keel-devpanel desde el repositorio oficial.
---

El proyecto ejecutable oficial es [`ss-keel-examples/examples/15-devpanel`](https://github.com/slice-soft/ss-keel-examples/tree/main/examples/15-devpanel).

## Montar el panel

```go
panel := devpanel.New(panelCfg)
panelLog := panel.Logger()

fiberApp := app.Fiber()
fiberApp.Use(panel.RequestMiddleware())
fiberApp.Use(panel.GlobalGuard())
panel.Mount(fiberApp)
defer panel.Shutdown()
```

## Emitir logs al panel

```go
panelLog.Info("listed %d events", len(snapshot))
panelLog.Info("created event id=%s title=%q", ev.ID, ev.Title)
```

## Generar trafico visible

```go
httpx.GET("/api/events", func(c *httpx.Ctx) error {
    eventsMu.RLock()
    snapshot := make([]Event, len(events))
    copy(snapshot, events)
    eventsMu.RUnlock()

    panelLog.Info("listed %d events", len(snapshot))
    return c.OK(snapshot)
})
```
