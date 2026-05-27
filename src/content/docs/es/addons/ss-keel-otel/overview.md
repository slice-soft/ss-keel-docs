---
title: Resumen de OTel
description: Como ss-keel-otel instrumenta apps Keel con trazas, metricas y atributos de recurso.
---

`ss-keel-otel` envuelve el [SDK de OpenTelemetry para Go](https://opentelemetry.io/docs/languages/go/) y lo conecta al servidor Fiber de Keel automáticamente via `keel add otel`.

## Trazas

Una **traza** es el registro completo de extremo a extremo de una operación — típicamente una petición API que puede propagarse a través de múltiples servicios. Una traza está compuesta de **spans**: unidades individuales de trabajo cronometradas.

`ss-keel-otel` crea un span raíz de servidor por cada petición HTTP entrante y lo pone a disposición de todo el código posterior via `c.UserContext()`. Los servicios pueden crear spans hijo para rastrear operaciones internas:

```
GET /users/123
└── HTTP GET /users/:id          ← span raíz (creado por el middleware)
    ├── UserService.GetByID      ← span hijo (creado manualmente)
    │   └── UserRepository.Find  ← span nieto
    └── CacheService.Get         ← span hijo
```

## Métricas

`ss-keel-otel` también inicializa un `MeterProvider` con un lector OTLP periódico. Cualquier librería de instrumentación que llame a `otel.Meter(...)` exportará métricas automáticamente a través del mismo exportador.

## Atributos de recurso

Todas las señales están etiquetadas con atributos de recurso que identifican el origen:

| Atributo | Fuente |
|---|---|
| `service.name` | `Config.ServiceName` |
| `service.version` | `Config.ServiceVersion` |
| `deployment.environment` | `Config.Environment` |
| `host.name` | detectado en runtime |
| `process.pid` | detectado en runtime |

## Samplers

| Valor | Descripción |
|---|---|
| `always_on` | Muestrea todas las trazas — solo para desarrollo |
| `always_off` | Descarta todas las trazas |
| `parentbased_always_on` | Sigue al padre; muestrea spans raíz siempre (por defecto) |
| `traceidratio` | Muestrea spans raíz al ratio indicado |
| `parentbased_traceidratio` | Sigue al padre; muestrea spans raíz al ratio indicado |

**Recomendación para producción:** `parentbased_traceidratio` con `OTEL_TRACES_SAMPLER_ARG=0.1` (10%).

## Cuando usarlo

- Cualquier servicio Keel que necesite trazado distribuido o métricas.
- Arquitecturas multi-servicio donde se requiere propagación W3C `traceparent`.
- Proyectos que apuntan a Grafana, Jaeger, Datadog, New Relic o cualquier backend compatible con OTLP.

## Continua con

- [Instalacion](/es/addons/ss-keel-otel/installation/)
- [Configuracion](/es/addons/ss-keel-otel/configuration/)
- [Ejemplos](/es/addons/ss-keel-otel/examples/)
