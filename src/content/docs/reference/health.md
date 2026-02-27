---
title: Health Checks
description: HealthChecker interface and the auto-generated /health endpoint.
---

ss-keel-core automatically registers a `GET /health` endpoint. You can extend it by registering one or more `HealthChecker` implementations.

## Auto-generated Endpoint

Unless `DisableHealth: true` is set in `KConfig`, the following endpoint is available:

```
GET /health
```

**Response (200 OK — all checks pass):**

```json
{
  "status": "UP",
  "service": "my-api",
  "version": "1.0.0",
  "checks": {}
}
```

**Response (503 Service Unavailable — any check fails):**

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

## HealthChecker Interface

```go
type HealthChecker interface {
    Name() string
    Check(ctx context.Context) error
}
```

- `Name()` — identifier shown in the `checks` map
- `Check(ctx)` — returns `nil` if healthy, an `error` if not

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

## Registering Health Checkers

```go
app.RegisterHealthChecker(&DBHealthChecker{db: db})
app.RegisterHealthChecker(&RedisHealthChecker{client: rdb})
```

## How Checks Run

All registered checkers run **in parallel** when `GET /health` is called. The response is:

- `200 UP` — all checks return `nil`
- `503 DOWN` — at least one check returns an error

The error message is included in the `checks` map: `"DOWN: <error message>"`.

## Disabling the Health Endpoint

```go
app := core.New(core.KConfig{
    DisableHealth: true,
})
```

Useful when you handle health checks externally (e.g., a load balancer with a custom path).

## Common Examples

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
