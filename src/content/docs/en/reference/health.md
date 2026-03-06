---
title: Health Checks
description: HealthChecker interface and auto-generated /health endpoint.
---

ss-keel-core automatically registers a `GET /health` endpoint. You can extend it by registering one or more `HealthChecker` implementations.

## Auto-generated endpoint

Unless you configure `DisableHealth: true` in `KConfig`, you get this endpoint:

```
GET /health
```

**Response (200 OK: all checks pass):**

```json
{
  "status": "UP",
  "service": "my-api",
  "version": "1.0.0",
  "checks": {}
}
```

**Response (503 Service Unavailable: at least one check fails):**

```json
{
  "status": "DOWN",
  "service": "my-api",
  "version": "1.0.0",
  "checks": {
    "database": "DOWN: connection refused",
    "cache": "UP"
  }
}
```

When no health checkers are registered, `checks` is an empty object and the status is always `UP`.

## HealthChecker interface

```go
type HealthChecker interface {
    Name() string
    Check(ctx context.Context) error
}
```

- `Name()`: identifier shown in the `checks` map
- `Check(ctx)`: returns `nil` if healthy, or `error` if not

## Implementing a HealthChecker

```go
type DBHealthChecker struct {
    db *sql.DB
}

func (h *DBHealthChecker) Name() string {
    return "database"
}

func (h *DBHealthChecker) Check(ctx context.Context) error {
    return h.db.PingContext(ctx)
}
```

## Registering health checkers

```go
app.RegisterHealthChecker(&DBHealthChecker{db: db})
app.RegisterHealthChecker(&RedisHealthChecker{client: rdb})
```

## How checks are executed

All checkers run **in parallel** when `GET /health` is called. The result is:

- `200 UP`: all return `nil`
- `503 DOWN`: at least one returns an error

The error message is included in `checks`: `"DOWN: <error message>"`.

## Disabling the health endpoint

```go
app := core.New(core.KConfig{
    DisableHealth: true,
})
```

Useful if you handle health checks externally (e.g., with a load balancer and custom route).

## Common examples

### Database

```go
type PostgresChecker struct{ db *sql.DB }

func (c *PostgresChecker) Name() string { return "postgres" }
func (c *PostgresChecker) Check(ctx context.Context) error {
    return c.db.PingContext(ctx)
}
```

### Redis

```go
type RedisChecker struct{ client *redis.Client }

func (c *RedisChecker) Name() string { return "redis" }
func (c *RedisChecker) Check(ctx context.Context) error {
    return c.client.Ping(ctx).Err()
}
```

### External HTTP dependency

```go
type ExternalAPIChecker struct{ url string }

func (c *ExternalAPIChecker) Name() string { return "external-api" }
func (c *ExternalAPIChecker) Check(ctx context.Context) error {
    req, _ := http.NewRequestWithContext(ctx, "GET", c.url+"/health", nil)
    resp, err := http.DefaultClient.Do(req)
    if err != nil {
        return err
    }
    defer resp.Body.Close()
    if resp.StatusCode >= 500 {
        return fmt.Errorf("status %d", resp.StatusCode)
    }
    return nil
}
```
