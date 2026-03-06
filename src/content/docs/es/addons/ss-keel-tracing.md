---
title: ss-keel-tracing
description: Tracing distribuido vía OpenTelemetry.
---

:::caution[Próximamente]
Este addon está en desarrollo. La interfaz que implementa ya es estable. Ver [Tracer](/reference/interfaces#tracer).
:::

`ss-keel-tracing` provee implementación de `Tracer` basada en [OpenTelemetry](https://opentelemetry.io/). Permite trazar requests end-to-end entre servicios y exportar a Jaeger, Zipkin, OTLP u otros backends compatibles con OTel.

**Implementa:** [`Tracer`](/reference/interfaces#tracer)

## Instalación (planificada)

```bash
go get github.com/slice-soft/ss-keel-tracing
```

## Uso (planificado)

```go
import "github.com/slice-soft/ss-keel-tracing"

tracer, err := sstracing.New(sstracing.Config{
    ServiceName: os.Getenv("SERVICE_NAME"),
    Exporter:    "otlp",                         // "otlp" | "jaeger" | "zipkin" | "stdout"
    Endpoint:    os.Getenv("OTEL_EXPORTER_ENDPOINT"),
    SampleRate:  1.0,                            // 0.0 a 1.0
})

app.SetTracer(tracer)

app.OnShutdown(func(ctx context.Context) error {
    return tracer.Shutdown(ctx)
})
```

### Usar tracer

Accede al tracer desde la app e instrumenta tus servicios:

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

### Trazado HTTP automático

El addon también inyecta middleware de Fiber que crea un span raíz por request y propaga contexto de trazas desde headers entrantes (`traceparent`, `b3`, etc.):

```go
// Se aplica automáticamente cuando llamas app.SetTracer(tracer)
// Cada request obtiene un span: "HTTP GET /users"
```

### Exporters

| Exporter | Descripción |
|---|---|
| `otlp` | OpenTelemetry Protocol; compatible con Jaeger, Grafana Tempo, Honeycomb, Datadog |
| `jaeger` | Exporter nativo de Jaeger |
| `zipkin` | Exporter nativo de Zipkin |
| `stdout` | Imprime spans a stdout (desarrollo) |
