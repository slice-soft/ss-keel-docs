---
title: ss-keel-cron
description: Scheduled background jobs with cron expressions.
---

:::caution[Coming Soon]
This addon is under development. The interface it implements is stable — see [Scheduler](/reference/interfaces#scheduler).
:::

`ss-keel-cron` provides a `Scheduler` implementation for running background jobs on a schedule. Jobs are defined with standard cron expressions and run in their own goroutines.

**Implements:** [`Scheduler`](/reference/interfaces#scheduler)

## Planned Installation

```bash
go get github.com/slice-soft/ss-keel-cron
```

## Planned Usage

```go
import "github.com/slice-soft/ss-keel-cron"

scheduler := sscron.New()

scheduler.Add(core.Job{
    Name:     "cleanup-expired-sessions",
    Schedule: "0 * * * *",       // every hour
    Handler: func(ctx context.Context) error {
        return sessionRepo.DeleteExpired(ctx)
    },
})

scheduler.Add(core.Job{
    Name:     "send-weekly-digest",
    Schedule: "0 9 * * 1",       // every Monday at 9am
    Handler: func(ctx context.Context) error {
        return mailer.SendWeeklyDigest(ctx)
    },
})

scheduler.Add(core.Job{
    Name:     "sync-analytics",
    Schedule: "*/15 * * * *",    // every 15 minutes
    Handler: func(ctx context.Context) error {
        return analytics.Sync(ctx)
    },
})

// RegisterScheduler starts the scheduler and wires the shutdown hook
app.RegisterScheduler(scheduler)
```

## Cron Expression Reference

```
┌───── minute (0-59)
│ ┌───── hour (0-23)
│ │ ┌───── day of month (1-31)
│ │ │ ┌───── month (1-12)
│ │ │ │ ┌───── day of week (0-6, Sunday=0)
│ │ │ │ │
* * * * *
```

| Expression | Meaning |
|---|---|
| `* * * * *` | Every minute |
| `0 * * * *` | Every hour |
| `0 0 * * *` | Every day at midnight |
| `0 9 * * 1` | Every Monday at 9am |
| `*/15 * * * *` | Every 15 minutes |
| `0 0 1 * *` | First day of every month |
| `0 9-17 * * 1-5` | Every hour, 9am–5pm, weekdays |

## Error Handling

Failed jobs are logged automatically. Optionally provide an error handler:

```go
scheduler := sscron.New(sscron.Config{
    OnError: func(job core.Job, err error) {
        log.Error("job %s failed: %v", job.Name, err)
        // notify, alert, etc.
    },
})
```

## Shutdown

`app.RegisterScheduler(scheduler)` automatically registers a shutdown hook. When the app receives SIGINT/SIGTERM, running jobs are allowed to complete before the process exits.
