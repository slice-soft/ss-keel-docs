---
title: ss-keel-metrics
description: Prometheus metrics collection and /metrics endpoint.
---

:::caution[Coming Soon]
This addon is under development. The interface it implements is already stable. See [MetricsCollector](/reference/interfaces#metricscollector).
:::

`ss-keel-metrics` provides a `MetricsCollector` implementation that exposes [Prometheus](https://prometheus.io/) metrics and automatically mounts the `/metrics` endpoint.

**Implements:** [`MetricsCollector`](/reference/interfaces#metricscollector)

## Installation (planned)

```bash
go get github.com/slice-soft/ss-keel-metrics
```

## Usage (planned)

```go
import "github.com/slice-soft/ss-keel-metrics"

collector := ssmetrics.New(ssmetrics.Config{
    MetricsPath: "/metrics", // default
})

app.SetMetricsCollector(collector)
```

The collector automatically registers:
- `http_requests_total`: counter by method, path and status
- `http_request_duration_seconds`: request duration histogram
- `http_requests_in_flight`: concurrent requests gauge

### Accessing metrics

```
GET /metrics
```

Returns Prometheus text format:

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

### Custom metrics

```go
counter := ssmetrics.NewCounter("emails_sent_total", "Total emails sent")
counter.Inc()

gauge := ssmetrics.NewGauge("queue_depth", "Current queue depth")
gauge.Set(42)

histogram := ssmetrics.NewHistogram("db_query_duration_seconds", "DB query duration")
histogram.Observe(0.003)
```

### Prometheus scrape config

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'my-api'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: /metrics
```
