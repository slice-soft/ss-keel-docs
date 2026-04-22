---
title: DevPanel Examples
description: Real ss-keel-devpanel mounting and usage examples from the official examples repository.
---

The official runnable project is [`ss-keel-examples/examples/15-devpanel`](https://github.com/slice-soft/ss-keel-examples/tree/main/examples/15-devpanel).

## Mount the panel

```go
panel := devpanel.New(panelCfg)
panelLog := panel.Logger()

fiberApp := app.Fiber()
fiberApp.Use(panel.RequestMiddleware())
fiberApp.Use(panel.GlobalGuard())
panel.Mount(fiberApp)
defer panel.Shutdown()
```

## Emit logs into the panel

```go
panelLog.Info("listed %d events", len(snapshot))
panelLog.Info("created event id=%s title=%q", ev.ID, ev.Title)
```

## Generate visible request traffic

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
