---
title: ss-keel-otel
description: Instrumentación OpenTelemetry para Keel — trazas, métricas y spans HTTP automáticos de Fiber via OTLP.
---

`ss-keel-otel` es el addon oficial de observabilidad para Keel. Inicializa el [SDK de OpenTelemetry para Go](https://opentelemetry.io/docs/languages/go/), crea un span raíz por cada petición HTTP y exporta trazas y métricas a través de OTLP a cualquier backend compatible — Grafana, Jaeger, Datadog, New Relic, AWS X-Ray, Honeycomb o tu propio OTel Collector.

**Implementa:** [`contracts.Tracer`](/es/reference/interfaces#tracer)
**Versión estable actual:** `v0.1.0`

## Instalación

```bash
keel add otel
```

O manualmente:

```bash
go get github.com/slice-soft/ss-keel-otel
```

## Bootstrap

Al ejecutar `keel add otel`, el CLI crea `cmd/setup_otel.go` e inyecta una línea en `cmd/main.go`:

```go
// cmd/setup_otel.go — creado por keel add otel
package main

import (
    "github.com/slice-soft/ss-keel-core/config"
    "github.com/slice-soft/ss-keel-core/core"
    "github.com/slice-soft/ss-keel-core/logger"
    ssotel "github.com/slice-soft/ss-keel-otel/otel"
)

// setupOtel inicializa el SDK de OpenTelemetry y registra el middleware HTTP de Fiber.
// Todo se omite cuando OTEL_ENABLED=false.
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

Lo que se inyecta en `cmd/main.go`:

```go
_ = setupOtel(app, appLogger)
```

## Configuración generada

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

Los exportadores OTLP también leen `OTEL_EXPORTER_OTLP_HEADERS` directamente del entorno — úsalo para pasar API keys o tokens sin tocar `application.properties`.

## Referencia de configuración

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

## Cómo funciona OpenTelemetry en Keel

### Trazas

Una **traza** es el registro completo de extremo a extremo de una operación — típicamente una petición API que puede propagarse a través de múltiples servicios. Una traza está compuesta de **spans**: unidades individuales de trabajo cronometradas.

`ss-keel-otel` crea un span raíz de servidor para cada petición HTTP entrante y lo pone a disposición de todo el código posterior via `c.UserContext()`. Los servicios pueden crear spans hijo para rastrear operaciones internas:

```
GET /users/123
└── HTTP GET /users/:id          ← span raíz (creado por el middleware)
    ├── UserService.GetByID      ← span hijo (creado manualmente)
    │   └── UserRepository.Find  ← span nieto
    └── CacheService.Get         ← span hijo
```

### Métricas

`ss-keel-otel` también inicializa un `MeterProvider` con un lector OTLP periódico. Cualquier librería de instrumentación que llame a `otel.Meter(...)` exportará métricas automáticamente a través del mismo exportador.

### Atributos de recurso

Todas las señales están etiquetadas con atributos de recurso que identifican el origen:

| Atributo | Fuente |
|---|---|
| `service.name` | `Config.ServiceName` |
| `service.version` | `Config.ServiceVersion` |
| `deployment.environment` | `Config.Environment` |
| `host.name` | detectado en runtime |
| `process.pid` | detectado en runtime |

## Middleware HTTP

El middleware crea un span de servidor por cada petición Fiber y propaga el contexto de traza entrante desde los headers W3C `traceparent` y `baggage`:

```go
// Aplicado automáticamente por setupOtel
app.Fiber().Use(provider.Middleware())
```

Cada span registra:

| Atributo | Ejemplo |
|---|---|
| `http.request.method` | `GET` |
| `url.path` | `/users/123` |
| `http.route` | `/users/:id` |
| `server.address` | `api.myapp.com` |
| `net.peer.ip` | `203.0.113.1` |
| `http.response.status_code` | `200` |

Las respuestas 5xx marcan el span como `ERROR`. Los errores retornados por el handler se registran con `span.RecordError`.

## Spans manuales

Usa `app.Tracer()` (retorna `contracts.Tracer`) para crear spans hijo en cualquier parte de tu aplicación:

```go
// En un servicio — pasa ctx del llamador para que el span sea hijo
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

En handlers Fiber, usa `c.UserContext()` como contexto padre:

```go
func (h *Handler) GetUser(c *httpx.Ctx) error {
    ctx, span := app.Tracer().Start(c.UserContext(), "GetUser")
    defer span.End()
    span.SetAttribute("user.id", c.Params("id"))
    // ...
}
```

## Samplers

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

## Conexión a backends de observabilidad

### Grafana (Tempo + Mimir)

```
OTEL_ENABLED=true
OTEL_EXPORTER_OTLP_ENDPOINT=https://otlp-gateway-prod-eu-west-0.grafana.net/otlp
OTEL_EXPORTER_OTLP_HEADERS=Authorization=Basic <base64-encoded-instance-id:api-key>
```

Las trazas van a **Grafana Tempo**, las métricas a **Grafana Mimir**.

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

## Ejemplo local de desarrollo

Un `docker-compose.yml` mínimo para trazado local con Jaeger:

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
      - "4318:4318"   # Receptor OTLP HTTP
      - "16686:16686" # Jaeger UI → abre http://localhost:16686
```

## Transporte gRPC

Para usar gRPC en lugar de HTTP/protobuf:

```
OTEL_EXPORTER_OTLP_PROTOCOL=grpc
OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4317
```

Los endpoints gRPC suelen escuchar en el puerto `4317`; HTTP en el `4318`.

## Tests con provider deshabilitado

En tests unitarios, deja `OTEL_ENABLED=false` (por defecto). `app.Tracer()` retorna un tracer no-op cuando el provider está deshabilitado — sin inicialización del SDK, sin goroutines, sin conexiones de red:

```go
// En tests — no se necesita configuración adicional, el tracer ya es noop
ctx, span := app.Tracer().Start(context.Background(), "test-op")
span.SetAttribute("user.id", "123")
span.End() // no-op
```

Para testear código que crea spans, pasa la interfaz `contracts.Tracer` e inyecta un stub:

```go
type noopTracer struct{}

func (noopTracer) Start(ctx context.Context, _ string) (context.Context, contracts.Span) {
    return ctx, noopSpan{}
}
```
