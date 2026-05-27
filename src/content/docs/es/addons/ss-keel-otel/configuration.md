---
title: Configuracion de OTel
description: Claves generadas, valores por defecto y recetas de conexion a backends para ss-keel-otel.
---

## Claves generadas

`keel add otel` añade estas entradas a `application.properties` y `.env`:

| application.properties | variable de entorno | Por defecto | Propósito |
|---|---|---|---|
| `otel.enabled` | `OTEL_ENABLED` | `false` | Activar/desactivar telemetría |
| `otel.service-name` | `OTEL_SERVICE_NAME` | `my-app` | Nombre lógico del servicio |
| `otel.service-version` | `OTEL_SERVICE_VERSION` | `0.0.0` | Versión como atributo de recurso |
| `otel.environment` | `OTEL_ENVIRONMENT` | `development` | Entorno de despliegue |
| `otel.exporter-otlp-endpoint` | `OTEL_EXPORTER_OTLP_ENDPOINT` | `http://localhost:4318` | Endpoint del collector |
| `otel.exporter-otlp-protocol` | `OTEL_EXPORTER_OTLP_PROTOCOL` | `http/protobuf` | Protocolo de transporte |
| `otel.traces-sampler` | `OTEL_TRACES_SAMPLER` | `parentbased_always_on` | Estrategia de muestreo |
| `otel.traces-sampler-arg` | `OTEL_TRACES_SAMPLER_ARG` | — | Ratio para samplers basados en ratio |

Los exportadores OTLP también leen `OTEL_EXPORTER_OTLP_HEADERS` directamente del entorno — úsalo para pasar API keys o tokens de auth sin tocar `application.properties`.

## Referencia del struct de configuracion

```go
provider, err := ssotel.New(ssotel.Config{
    Enabled:          true,
    ServiceName:      "my-api",       // requerido cuando está habilitado
    ServiceVersion:   "1.4.2",
    Environment:      "production",
    ExporterProtocol: ssotel.ProtocolHTTP, // o ssotel.ProtocolGRPC
    SamplerType:      ssotel.SamplerParentBasedAlwaysOn,
    SamplerArg:       "",             // ratio: "0.1" = 10%
    Logger:           log,
})
```

Cuando `Enabled` es `false`, `New` retorna inmediatamente con un provider no-op — no se inicializan componentes del SDK ni se realizan conexiones de red.

## Referencia de samplers

| Valor | Descripción |
|---|---|
| `always_on` | Muestrea todas las trazas — solo para desarrollo |
| `always_off` | Descarta todas las trazas |
| `parentbased_always_on` | Sigue al padre; muestrea spans raíz siempre (por defecto) |
| `traceidratio` | Muestrea spans raíz al ratio indicado |
| `parentbased_traceidratio` | Sigue al padre; muestrea spans raíz al ratio indicado |

**Recomendación para producción:** `parentbased_traceidratio` con `OTEL_TRACES_SAMPLER_ARG=0.1` (10%).

```
OTEL_TRACES_SAMPLER=parentbased_traceidratio
OTEL_TRACES_SAMPLER_ARG=0.1
```

## Conexion a backends de observabilidad

### Grafana (Tempo + Mimir)

```
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-eu-west-0.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <base64-encoded-instance-id:api-key>
```

Las trazas van a **Grafana Tempo**, las métricas a **Grafana Mimir**. El endpoint OTLP de Grafana Cloud acepta `http/protobuf` y `grpc`.

### Jaeger

Inicia Jaeger con el receptor OTLP HTTP habilitado (disponible desde Jaeger 1.35):

```yaml
# docker-compose.yml — desarrollo local
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

Habilita el receptor OTLP en el Datadog Agent (`datadog.yaml`):

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
OTEL_EXPORTER_OTLP_HEADERS=api-key=<tu-ingest-license-key>
```

### Honeycomb

```
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=https://api.honeycomb.io
OTEL_EXPORTER_OTLP_HEADERS=x-honeycomb-team=<tu-api-key>
```

### AWS X-Ray (via ADOT Collector)

Despliega el colector [AWS Distro for OpenTelemetry (ADOT)](https://aws-otel.github.io/) junto a tu servicio:

```
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
```

### OpenTelemetry Collector (relay)

Usa un OTel Collector para enviar a múltiples backends simultáneamente:

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

## Transporte gRPC

Para usar gRPC en lugar de HTTP/protobuf:

```
OTEL_EXPORTER_OTLP_PROTOCOL=grpc
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

Los endpoints gRPC suelen escuchar en el puerto `4317`; HTTP en el `4318`.
