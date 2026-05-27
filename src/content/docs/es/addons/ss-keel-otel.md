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

## Explora este addon

- [Resumen](/es/addons/ss-keel-otel/overview/)
- [Instalación](/es/addons/ss-keel-otel/installation/)
- [Configuración](/es/addons/ss-keel-otel/configuration/)
- [Ejemplos](/es/addons/ss-keel-otel/examples/)
