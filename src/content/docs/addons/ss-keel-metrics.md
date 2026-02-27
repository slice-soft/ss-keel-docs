---
title: ss-keel-metrics
description: Prometheus metrics collection and /metrics endpoint.
---

:::caution[Coming Soon]
This addon is under development. The interface it implements is stable — see [MetricsCollector](/reference/interfaces#metricscollector).
:::

`ss-keel-metrics` provides a `MetricsCollector` implementation that exposes [Prometheus](https://prometheus.io/) metrics and automatically mounts a `/metrics` endpoint.

**Implements:** [`MetricsCollector`](/reference/interfaces#metricscollector)

## Planned Installation

```bash
go get github.com/slice-soft/ss-keel-metrics
```

## Planned Usage

```go
import "github.com/slice-soft/ss-keel-metrics"

collector := ssmetrics.New(ssmetrics.Config{
    MetricsPath: "/metrics", // default
})

app.SetMetricsCollector(collector)
```

The collector auto-registers:
- `http_requests_total` — counter by method, path, status
- `http_request_duration_seconds` — histogram of request durations
- `http_requests_in_flight` — gauge of concurrent requests

### Accessing Metrics

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

### Custom Metrics

```go
counter := ssmetrics.NewCounter("emails_sent_total", "Total emails sent")
counter.Inc()

gauge := ssmetrics.NewGauge("queue_depth", "Current queue depth")
gauge.Set(42)

histogram := ssmetrics.NewHistogram("db_query_duration_seconds", "DB query duration")
histogram.Observe(0.003)
```

### Prometheus Scrape Config

```yaml
# prometheus.yml
scrape_configs:
  - job_name: 'my-api'
    static_configs:
      - targets: ['localhost:3000']
    metrics_path: /metrics
```
