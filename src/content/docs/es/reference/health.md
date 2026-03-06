---
title: Health Checks
description: Interfaz HealthChecker y endpoint /health autogenerado.
---

ss-keel-core registra automáticamente un endpoint `GET /health`. Puedes extenderlo registrando una o más implementaciones de `HealthChecker`.

## Endpoint autogenerado

Salvo que configures `DisableHealth: true` en `KConfig`, tendrás este endpoint:

```
GET /health
```

**Respuesta (200 OK: todos los checks pasan):**

```json
{
  "status": "UP",
  "service": "my-api",
  "version": "1.0.0",
  "checks": {}
}
```

**Respuesta (503 Service Unavailable: falla al menos un check):**

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

Cuando no hay health checkers registrados, `checks` es un objeto vacío y el status siempre es `UP`.

## Interfaz HealthChecker

```go
type HealthChecker interface {
    Name() string
    Check(ctx context.Context) error
}
```

- `Name()`: identificador mostrado en el mapa `checks`
- `Check(ctx)`: devuelve `nil` si está sano, o `error` si no

## Implementar un HealthChecker

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

## Registrar verificadores de salud

```go
app.RegisterHealthChecker(&DBHealthChecker{db: db})
app.RegisterHealthChecker(&RedisHealthChecker{client: rdb})
```

## Cómo se ejecutan los checks

Todos los checkers se ejecutan **en paralelo** cuando llamas `GET /health`. El resultado es:

- `200 UP`: todos devuelven `nil`
- `503 DOWN`: al menos uno devuelve error

El mensaje de error se incluye en `checks`: `"DOWN: <error message>"`.

## Deshabilitar endpoint de health

```go
app := core.New(core.KConfig{
    DisableHealth: true,
})
```

Útil si resuelves health checks de forma externa (por ejemplo, con un load balancer y ruta custom).

## Ejemplos comunes

### Base de datos

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

### Dependencia HTTP externa

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
