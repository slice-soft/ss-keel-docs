---
title: OTel Overview
description: How ss-keel-otel instruments Keel apps with traces, metrics, and resource attributes.
---

`ss-keel-otel` wraps the [OpenTelemetry Go SDK](https://opentelemetry.io/docs/languages/go/) and wires it into Keel's Fiber server automatically via `keel add otel`.

## Traces

A **trace** is the end-to-end record of a single operation — typically one API request that may fan out across multiple services. A trace is composed of **spans**: individual timed units of work.

`ss-keel-otel` creates a root server span for each incoming HTTP request and makes it available to all downstream code via `c.UserContext()`. Services can create child spans to track internal operations:

```
GET /users/123
└── HTTP GET /users/:id          ← root span (created by middleware)
    ├── UserService.GetByID      ← child span (created manually)
    │   └── UserRepository.Find  ← grandchild span
    └── CacheService.Get         ← child span
```

## Metrics

`ss-keel-otel` initializes a `MeterProvider` with a periodic OTLP reader. Any instrumentation library that calls `otel.Meter(...)` will export metrics automatically through the same exporter.

## Resource attributes

Every signal is tagged with a set of resource attributes that identify the source:

| Attribute | Source |
|---|---|
| `service.name` | `Config.ServiceName` |
| `service.version` | `Config.ServiceVersion` |
| `deployment.environment` | `Config.Environment` |
| `host.name` | detected at runtime |
| `process.pid` | detected at runtime |

## Samplers

| Value | Description |
|---|---|
| `always_on` | Sample every trace — use in development only |
| `always_off` | Drop all traces |
| `parentbased_always_on` | Follow parent; sample root spans always (default) |
| `traceidratio` | Sample root spans at the given ratio |
| `parentbased_traceidratio` | Follow parent; sample root spans at the given ratio |

**Production recommendation:** `parentbased_traceidratio` with `OTEL_TRACES_SAMPLER_ARG=0.1` (10%).

## When to use it

- Any Keel service that needs distributed tracing or metrics.
- Multi-service architectures where W3C `traceparent` propagation is required.
- Projects targeting Grafana, Jaeger, Datadog, New Relic, or any OTLP-compatible backend.

## Continue with

- [Installation](/en/addons/ss-keel-otel/installation/)
- [Configuration](/en/addons/ss-keel-otel/configuration/)
- [Examples](/en/addons/ss-keel-otel/examples/)
