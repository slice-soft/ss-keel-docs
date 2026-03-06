---
title: ss-keel-cron
description: Jobs en segundo plano programados con expresiones cron.
---

:::caution[Próximamente]
Este addon está en desarrollo. La interfaz que implementa ya es estable. Ver [Scheduler](/reference/interfaces#scheduler).
:::

`ss-keel-cron` provee una implementación de `Scheduler` para ejecutar jobs en background según un calendario. Los jobs se definen con expresiones cron estándar y corren en sus propias goroutines.

**Implementa:** [`Scheduler`](/reference/interfaces#scheduler)

## Instalación (planificada)

```bash
go get github.com/slice-soft/ss-keel-cron
```

## Uso (planificado)

```go
import "github.com/slice-soft/ss-keel-cron"

scheduler := sscron.New()

scheduler.Add(core.Job{
    Name:     "cleanup-expired-sessions",
    Schedule: "0 * * * *",       // cada hora
    Handler: func(ctx context.Context) error {
        return sessionRepo.DeleteExpired(ctx)
    },
})

scheduler.Add(core.Job{
    Name:     "send-weekly-digest",
    Schedule: "0 9 * * 1",       // cada lunes a las 9am
    Handler: func(ctx context.Context) error {
        return mailer.SendWeeklyDigest(ctx)
    },
})

scheduler.Add(core.Job{
    Name:     "sync-analytics",
    Schedule: "*/15 * * * *",    // cada 15 minutos
    Handler: func(ctx context.Context) error {
        return analytics.Sync(ctx)
    },
})

// RegisterScheduler inicia scheduler y conecta shutdown hook
app.RegisterScheduler(scheduler)
```

## Referencia de expresión cron

```
┌───── minuto (0-59)
│ ┌───── hora (0-23)
│ │ ┌───── día del mes (1-31)
│ │ │ ┌───── mes (1-12)
│ │ │ │ ┌───── día de la semana (0-6, domingo=0)
│ │ │ │ │
* * * * *
```

| Expresión | Significado |
|---|---|
| `* * * * *` | Cada minuto |
| `0 * * * *` | Cada hora |
| `0 0 * * *` | Cada día a medianoche |
| `0 9 * * 1` | Cada lunes a las 9am |
| `*/15 * * * *` | Cada 15 minutos |
| `0 0 1 * *` | Primer día de cada mes |
| `0 9-17 * * 1-5` | Cada hora de 9am a 5pm en días hábiles |

## Manejo de errores

Los jobs fallidos se registran automáticamente. Opcionalmente puedes definir un manejador de error:

```go
scheduler := sscron.New(sscron.Config{
    OnError: func(job core.Job, err error) {
        log.Error("job %s failed: %v", job.Name, err)
        // notify, alert, etc.
    },
})
```

## Shutdown

`app.RegisterScheduler(scheduler)` registra automáticamente un shutdown hook. Cuando la app recibe SIGINT/SIGTERM, los jobs en ejecución pueden terminar antes de cerrar el proceso.
