---
title: ss-keel-tracing
description: Distributed tracing via OpenTelemetry.
---

:::caution[Coming Soon]
This addon is under development. The interface it implements is stable — see [Tracer](/reference/interfaces#tracer).
:::

`ss-keel-tracing` provides a `Tracer` implementation backed by [OpenTelemetry](https://opentelemetry.io/). Traces requests end-to-end across services and exports to Jaeger, Zipkin, OTLP, or any OTel-compatible backend.

**Implements:** [`Tracer`](/reference/interfaces#tracer)

## Planned Installation

```bash
go get github.com/slice-soft/ss-keel-tracing
```

## Planned Usage

```go
import "github.com/slice-soft/ss-keel-tracing"

tracer, err := sstracing.New(sstracing.Config{
    ServiceName: os.Getenv("SERVICE_NAME"),
    Exporter:    "otlp",                         // "otlp" | "jaeger" | "zipkin" | "stdout"
    Endpoint:    os.Getenv("OTEL_EXPORTER_ENDPOINT"),
    SampleRate:  1.0,                            // 0.0 to 1.0
})

app.SetTracer(tracer)

app.OnShutdown(func(ctx context.Context) error {
    return tracer.Shutdown(ctx)
})
```

### Using the Tracer

Access the tracer from the app and instrument your services:

```go
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

### Automatic HTTP Tracing

The addon also injects a Fiber middleware that creates a root span for every incoming request and propagates trace context from incoming headers (`traceparent`, `b3`, etc.):

```go
// Automatically applied when you call app.SetTracer(tracer)
// Every request gets a span: "HTTP GET /users"
```

### Exporters

| Exporter | Description |
|---|---|
| `otlp` | OpenTelemetry Protocol — works with Jaeger, Grafana Tempo, Honeycomb, Datadog |
| `jaeger` | Jaeger native exporter |
| `zipkin` | Zipkin native exporter |
| `stdout` | Print spans to stdout (development) |
