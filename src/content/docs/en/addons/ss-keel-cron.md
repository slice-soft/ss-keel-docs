---
title: ss-keel-cron
description: Scheduled background jobs with cron expressions.
---

:::caution[Coming Soon]
This addon is under development. The interface it implements is already stable. See [Scheduler](/reference/interfaces#scheduler).
:::

`ss-keel-cron` provides a `Scheduler` implementation for running background jobs on a schedule. Jobs are defined with standard cron expressions and run in their own goroutines.

**Implements:** [`Scheduler`](/reference/interfaces#scheduler)

## Installation (planned)

```bash
go get github.com/slice-soft/ss-keel-cron
```

## Usage (planned)

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

// RegisterScheduler starts the scheduler and connects the shutdown hook
app.RegisterScheduler(scheduler)
```

## Cron expression reference

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
| `0 0 1 * *` | First day of each month |
| `0 9-17 * * 1-5` | Every hour from 9am to 5pm on weekdays |

## Error handling

Failed jobs are logged automatically. Optionally you can define an error handler:

```go
scheduler := sscron.New(sscron.Config{
    OnError: func(job core.Job, err error) {
        log.Error("job %s failed: %v", job.Name, err)
        // notify, alert, etc.
    },
})
```

## Shutdown

`app.RegisterScheduler(scheduler)` automatically registers a shutdown hook. When the app receives SIGINT/SIGTERM, running jobs can finish before the process closes.
