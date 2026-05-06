---
title: ss-keel-otel
description: OpenTelemetry instrumentation for Keel — traces, metrics, and automatic Fiber HTTP spans via OTLP.
---

`ss-keel-otel` is the official observability addon for Keel. It initializes the [OpenTelemetry Go SDK](https://opentelemetry.io/docs/languages/go/), creates a root span for every HTTP request, and exports traces and metrics through OTLP to any compatible backend — Grafana, Jaeger, Datadog, New Relic, AWS X-Ray, Honeycomb, or your own OTel Collector.

**Implements:** [`contracts.Tracer`](/en/reference/interfaces#tracer)
**Current stable release:** `v0.1.0`

## Installation

```bash
keel add otel
```

Or manually:

```bash
go get github.com/slice-soft/ss-keel-otel
```

## Bootstrap

When you run `keel add otel`, the CLI creates `cmd/setup_otel.go` and adds one line to `cmd/main.go`:

```go
// cmd/setup_otel.go — created by keel add otel
package main

import (
    "github.com/slice-soft/ss-keel-core/config"
    "github.com/slice-soft/ss-keel-core/core"
    "github.com/slice-soft/ss-keel-core/logger"
    ssotel "github.com/slice-soft/ss-keel-otel/otel"
)

// setupOtel initialises the OpenTelemetry SDK and registers the Fiber HTTP middleware.
// All telemetry is skipped when OTEL_ENABLED=false.
func setupOtel(app *core.App, log *logger.Logger) *ssotel.Provider {
    otelConfig := config.MustLoadConfig[ssotel.Config]()
    otelConfig.Logger = log

    provider, err := ssotel.New(otelConfig)
    if err != nil {
        log.Error("failed to initialise otel: %v", err)
        return provider
    }

    app.SetTracer(provider)
    app.Fiber().Use(provider.Middleware())
    app.OnShutdown(provider.Shutdown)

    return provider
}
```

The following is injected into `cmd/main.go`:

```go
_ = setupOtel(app, appLogger)
```

## Generated configuration

`keel add otel` appends these entries to `application.properties` and `.env`:

| application.properties | env var | Default | Purpose |
|---|---|---|---|
| `otel.enabled` | `OTEL_ENABLED` | `false` | Master on/off switch |
| `otel.service-name` | `OTEL_SERVICE_NAME` | `my-app` | Logical service name |
| `otel.service-version` | `OTEL_SERVICE_VERSION` | `0.0.0` | Version resource attribute |
| `otel.environment` | `OTEL_ENVIRONMENT` | `development` | Deployment environment |
| `otel.exporter-otlp-endpoint` | `OTEL_EXPORTER_OTLP_ENDPOINT` | `http://localhost:4318` | Collector endpoint |
| `otel.exporter-otlp-protocol` | `OTEL_EXPORTER_OTLP_PROTOCOL` | `http/protobuf` | Transport protocol |
| `otel.traces-sampler` | `OTEL_TRACES_SAMPLER` | `parentbased_always_on` | Sampler strategy |
| `otel.traces-sampler-arg` | `OTEL_TRACES_SAMPLER_ARG` | — | Ratio for ratio-based samplers |

The OTLP exporters also read `OTEL_EXPORTER_OTLP_HEADERS` directly from the environment — use it to pass API keys or auth tokens without going through `application.properties`.

## Configuration reference

```go
provider, err := ssotel.New(ssotel.Config{
    Enabled:          true,
    ServiceName:      "my-api",       // required when enabled
    ServiceVersion:   "1.4.2",
    Environment:      "production",
    ExporterProtocol: ssotel.ProtocolHTTP, // or ssotel.ProtocolGRPC
    SamplerType:      ssotel.SamplerParentBasedAlwaysOn,
    SamplerArg:       "",             // ratio: "0.1" = 10%
    Logger:           log,
})
```

When `Enabled` is `false`, `New` returns immediately with a no-op provider — no SDK components are initialized and no network connections are attempted.

## How OpenTelemetry works in Keel

### Traces

A **trace** is the end-to-end record of a single operation — typically one API request that may fan out across multiple services. A trace is composed of **spans**: individual timed units of work.

`ss-keel-otel` creates a root server span for each incoming HTTP request and makes it available to all downstream code via `c.UserContext()`. Your services can create child spans to track internal operations:

```
GET /users/123
└── HTTP GET /users/:id          ← root span (created by middleware)
    ├── UserService.GetByID      ← child span (created manually)
    │   └── UserRepository.Find  ← grandchild span
    └── CacheService.Get         ← child span
```

### Metrics

`ss-keel-otel` also initializes a `MeterProvider` with a periodic OTLP reader. Any instrumentation library that calls `otel.Meter(...)` will export metrics automatically through the same exporter.

### Resource attributes

Every signal is tagged with a set of resource attributes that identify the source:

| Attribute | Source |
|---|---|
| `service.name` | `Config.ServiceName` |
| `service.version` | `Config.ServiceVersion` |
| `deployment.environment` | `Config.Environment` |
| `host.name` | detected at runtime |
| `process.pid` | detected at runtime |

## HTTP middleware

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

## Manual spans

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

## Samplers

| Value | Description |
|---|---|
| `always_on` | Sample every trace — use in development only |
| `always_off` | Drop all traces |
| `parentbased_always_on` | Follow parent; sample root spans always (default) |
| `traceidratio` | Sample root spans at the given ratio |
| `parentbased_traceidratio` | Follow parent; sample root spans at the given ratio |

**Production recommendation:** `parentbased_traceidratio` with `OTEL_TRACES_SAMPLER_ARG=0.1` (10%).

```
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1
```

## Connecting to observability backends

### Grafana (Tempo + Mimir)

```
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-eu-west-0.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <base64-encoded-instance-id:api-key>
```

Traces land in **Grafana Tempo**, metrics in **Grafana Mimir**. The Grafana Cloud OTLP endpoint accepts both `http/protobuf` and `grpc`.

### Jaeger

Start Jaeger with the OTLP HTTP receiver enabled (available since Jaeger 1.35):

```yaml
# docker-compose.yml — local development
services:
  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "4318:4318"   # OTLP HTTP
      - "16686:16686" # Jaeger UI
```

```
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

### Datadog

Enable the OTLP receiver in the Datadog Agent (`datadog.yaml`):

```yaml
otlp_config:
  receiver:
    protocols:
      http:
        endpoint: 0.0.0.0:4318
```

```
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

### New Relic

```
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp.nr-data.net
OTEL_EXPORTER_OTLP_HEADERS=api-key=<your-ingest-license-key>
```

### Honeycomb

```
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.honeycomb.io
OTEL_EXPORTER_OTLP_HEADERS=x-honeycomb-team=<your-api-key>
```

### AWS X-Ray (via ADOT Collector)

Deploy the [AWS Distro for OpenTelemetry (ADOT)](https://aws-otel.github.io/) collector alongside your service:

```
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

The ADOT collector receives OTLP and forwards to X-Ray, CloudWatch, and Prometheus.

### OpenTelemetry Collector (relay)

Use an OTel Collector to fan out to multiple backends simultaneously:

```yaml
# otel-collector.yaml
receivers:
  otlp:
    protocols:
      http:
        endpoint: 0.0.0.0:4318

exporters:
  jaeger:
    endpoint: jaeger:14250
    tls: { insecure: true }
  prometheusremotewrite:
    endpoint: http://prometheus:9090/api/v1/write

service:
  pipelines:
    traces:
      receivers: [otlp]
      exporters: [jaeger]
    metrics:
      receivers: [otlp]
      exporters: [prometheusremotewrite]
```

## Local development example

A minimal `docker-compose.yml` for local tracing with Jaeger:

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

## gRPC transport

To use gRPC instead of HTTP/protobuf:

```
OTEL_EXPORTER_OTLP_PROTOCOL=grpc
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

gRPC endpoints typically listen on port `4317`; HTTP on port `4318`.

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
