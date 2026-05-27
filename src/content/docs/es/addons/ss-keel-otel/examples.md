---
title: Ejemplos de OTel
description: Spans manuales, atributos del middleware HTTP, setup local y patrones de testing para ss-keel-otel.
---

## Atributos del span del middleware HTTP

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

## Spans manuales en un servicio

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

## Desarrollo local con Jaeger

Un `docker-compose.yml` mínimo para trazado local:

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
