---
title: ss-keel-metrics
description: Recolección de métricas Prometheus y endpoint /metrics.
---

:::caution[Próximamente]
Este addon está en desarrollo. La interfaz que implementa ya es estable. Ver [MetricsCollector](/es/reference/interfaces#metricscollector).
:::

`ss-keel-metrics` provee una implementación de `MetricsCollector` que expone métricas [Prometheus](https://prometheus.io/) y monta automáticamente el endpoint `/metrics`.

**Implementa:** [`MetricsCollector`](/es/reference/interfaces#metricscollector)

## Instalación (planificada)

```bash
go get github.com/slice-soft/ss-keel-metrics
```

## Uso (planificado)

```go
import "github.com/slice-soft/ss-keel-metrics"

collector := ssmetrics.New(ssmetrics.Config{
    MetricsPath: "/metrics", // default
})

app.SetMetricsCollector(collector)
```

El collector registra automáticamente:
- `http_requests_total`: contador por método, ruta y status
- `http_request_duration_seconds`: histograma de duración de requests
- `http_requests_in_flight`: gauge de requests concurrentes

### Acceder a métricas

```
GET /metrics
```

Retorna formato de texto Prometheus:

```
# HELP http_requests_total Total number of HTTP requests
# TYPE http_requests_total counter
http_requests_total{method="GET",path="/users",status="200"} 142
http_requests_total{method="POST",path="/users",status="201"} 23

# HELP http_request_duration_seconds HTTP request duration in seconds
# TYPE http_request_duration_seconds histogram
http_request_duration_seconds_bucket{method="GET",path="/users",le="0.005"} 120
...
```

### Métricas personalizadas

```go
counter := ssmetrics.NewCounter("emails_sent_total", "Total emails sent")
counter.Inc()

gauge := ssmetrics.NewGauge("queue_depth", "Current queue depth")
gauge.Set(42)

histogram := ssmetrics.NewHistogram("db_query_duration_seconds", "DB query duration")
histogram.Observe(0.003)
```

### Config de scrape para Prometheus

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'my-api'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: /metrics
```
