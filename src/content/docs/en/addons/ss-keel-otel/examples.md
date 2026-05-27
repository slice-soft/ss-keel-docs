---
title: OTel Examples
description: Manual spans, HTTP middleware attributes, local dev setup, and testing patterns for ss-keel-otel.
---

## HTTP middleware span attributes

The middleware creates a server span for every Fiber request and propagates incoming trace context from W3C `traceparent` and `baggage` headers:

```go
// Applied automatically by setupOtel
app.Fiber().Use(provider.Middleware())
```

Each span records:

| Attribute | Example |
|---|---|
| `http.request.method` | `GET` |
| `url.path` | `/users/123` |
| `http.route` | `/users/:id` |
| `server.address` | `api.myapp.com` |
| `net.peer.ip` | `203.0.113.1` |
| `http.response.status_code` | `200` |

5xx responses mark the span as `ERROR`. Errors returned by the handler are recorded with `span.RecordError`.

## Manual spans in a service

Use `app.Tracer()` (returns `contracts.Tracer`) to create child spans anywhere in your application:

```go
// In a service — pass ctx from the caller so the span becomes a child
func (s *UserService) GetByID(ctx context.Context, id string) (*User, error) {
    ctx, span := app.Tracer().Start(ctx, "UserService.GetByID")
    defer span.End()

    span.SetAttribute("user.id", id)

    user, err := s.repo.FindByID(ctx, id)
    if err != nil {
        span.RecordError(err)
        return nil, err
    }
    return user, nil
}
```

In Fiber handlers, use `c.UserContext()` as the parent context:

```go
func (h *Handler) GetUser(c *httpx.Ctx) error {
    ctx, span := app.Tracer().Start(c.UserContext(), "GetUser")
    defer span.End()
    span.SetAttribute("user.id", c.Params("id"))
    // ...
}
```

## Local development with Jaeger

A minimal `docker-compose.yml` for local tracing:

```yaml
services:
  app:
    build: .
    environment:
      OTEL_ENABLED: "true"
      OTEL_SERVICE_NAME: "my-api"
      OTEL_ENVIRONMENT: "local"
      OTEL_EXPORTER_OTLP_ENDPOINT: "http://jaeger:4318"
    depends_on:
      - jaeger

  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "4318:4318"   # OTLP HTTP receiver
      - "16686:16686" # Jaeger UI → open http://localhost:16686
```

## Testing with a disabled provider

In unit tests, keep `OTEL_ENABLED=false` (the default). `app.Tracer()` returns a no-op tracer when the provider is disabled — no SDK init, no goroutines, no network calls:

```go
// In tests — no setup needed, tracer is already a noop
ctx, span := app.Tracer().Start(context.Background(), "test-op")
span.SetAttribute("user.id", "123")
span.End() // no-op
```

To test code that creates spans, pass a `contracts.Tracer` interface and inject a stub:

```go
type noopTracer struct{}

func (noopTracer) Start(ctx context.Context, _ string) (context.Context, contracts.Span) {
    return ctx, noopSpan{}
}
```
