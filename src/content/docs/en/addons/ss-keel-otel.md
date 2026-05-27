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

## Browse this addon

- [Overview](/en/addons/ss-keel-otel/overview/)
- [Installation](/en/addons/ss-keel-otel/installation/)
- [Configuration](/en/addons/ss-keel-otel/configuration/)
- [Examples](/en/addons/ss-keel-otel/examples/)
