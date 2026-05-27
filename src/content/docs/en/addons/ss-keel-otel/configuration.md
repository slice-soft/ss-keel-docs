---
title: OTel Configuration
description: Generated config keys, defaults, and backend connection recipes for ss-keel-otel.
---

## Generated keys

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

## Config struct reference

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

## Sampler reference

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

## gRPC transport

To use gRPC instead of HTTP/protobuf:

```
OTEL_EXPORTER_OTLP_PROTOCOL=grpc
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

gRPC endpoints typically listen on port `4317`; HTTP on port `4318`.
