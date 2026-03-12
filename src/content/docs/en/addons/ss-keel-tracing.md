---
title: ss-keel-tracing
description: Distributed tracing via OpenTelemetry.
---

:::caution[Coming Soon]
This addon is under development. The interface it implements is already stable. See [Tracer](/en/reference/interfaces#tracer).
:::

`ss-keel-tracing` provides a `Tracer` implementation based on [OpenTelemetry](https://opentelemetry.io/). It enables end-to-end request tracing across services and exports to Jaeger, Zipkin, OTLP, or other OTel-compatible backends.

**Implements:** [`Tracer`](/en/reference/interfaces#tracer)

## Installation (planned)

```bash
go get github.com/slice-soft/ss-keel-tracing
```

## Usage (planned)

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

### Using the tracer

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

### Automatic HTTP tracing

The addon also injects a Fiber middleware that creates a root span per request and propagates trace context from incoming headers (`traceparent`, `b3`, etc.):

```go
// Applied automatically when you call app.SetTracer(tracer)
// Each request gets a span: "HTTP GET /users"
```

### Exporters

| Exporter | Description |
|---|---|
| `otlp` | OpenTelemetry Protocol; compatible with Jaeger, Grafana Tempo, Honeycomb, Datadog |
| `jaeger` | Native Jaeger exporter |
| `zipkin` | Native Zipkin exporter |
| `stdout` | Prints spans to stdout (development) |
