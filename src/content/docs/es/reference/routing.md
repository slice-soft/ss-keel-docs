---
title: Enrutamiento
description: API Route builder, constructores HTTP y encadenamiento de middleware.
---

Las rutas se crean con constructores de método HTTP que retornan un valor `Route`. Los métodos builder se pueden encadenar para agregar metadata, middleware y documentación OpenAPI.

## Constructores de métodos HTTP

```go
func GET(path string, handler func(*Ctx) error) Route
func POST(path string, handler func(*Ctx) error) Route
func PUT(path string, handler func(*Ctx) error) Route
func PATCH(path string, handler func(*Ctx) error) Route
func DELETE(path string, handler func(*Ctx) error) Route
```

### Ejemplo

```go
httpx.GET("/users", func(c *httpx.Ctx) error {
    return c.OK("hola")
})
```

## Métodos builder de Route

Todos los métodos builder retornan un nuevo `Route`; son seguros para encadenar.

### `.Tag(tag string) Route`

Agrupa la ruta bajo un tag OpenAPI.

```go
httpx.GET("/users", handler).Tag("users")
```

### `.Describe(summary string, description ...string) Route`

Define summary OpenAPI y descripción opcional extendida.

```go
httpx.GET("/users", handler).
    Describe("Listar usuarios", "Retorna una lista paginada de todos los usuarios del sistema")
```

### `.WithBody(b *BodyMeta) Route`

Documenta el tipo de body de request. Usa el helper genérico `WithBody[T]()`.

```go
httpx.POST("/users", handler).
    WithBody(httpx.WithBody[CreateUserDTO]())
```

### `.WithResponse(res *ResponseMeta) Route`

Documenta tipo de respuesta y status code. Usa el helper genérico `WithResponse[T](statusCode)`.

```go
httpx.POST("/users", handler).
    WithResponse(httpx.WithResponse[User](201))
```

### `.WithQueryParam(name, typ string, required bool, desc ...string) Route`

Agrega query param documentado al spec OpenAPI.

```go
httpx.GET("/users", handler).
    WithQueryParam("search", "string", false, "Filtrar por nombre").
    WithQueryParam("limit",  "integer", false, "Máximo de resultados por página")
```

**Valores válidos para tipo:** `"string"`, `"integer"`, `"boolean"`, `"number"`, `"array"`

### `.Use(middlewares ...fiber.Handler) Route`

Adjunta uno o más middlewares de Fiber a la ruta.

```go
httpx.GET("/admin", handler).
    Use(authMiddleware, adminOnly)
```

### `.WithSecured(schemes ...string) Route`

Marca la ruta como autenticada en OpenAPI.

```go
httpx.DELETE("/users/:id", handler).
    WithSecured("bearerAuth")
```

### `.WithDeprecated() Route`

Marca la ruta como deprecada en OpenAPI.

```go
httpx.GET("/v1/users", handler).
    WithDeprecated()
```

## Helpers genéricos

### `WithBody[T any]() *BodyMeta`

Crea `BodyMeta` desde un tipo Go. Se usa para generación de schema OpenAPI.

```go
httpx.WithBody[CreateUserDTO]()
```

### `WithResponse[T any](statusCode int) *ResponseMeta`

Crea `ResponseMeta` desde tipo Go y status code.

```go
httpx.WithResponse[User](201)
httpx.WithResponse[httpx.Page[User]](200)
httpx.WithResponse[[]string](200)
```

## Grupos

Usa `app.Group()` para prefijar rutas y compartir middleware:

```go
v1 := app.Group("/api/v1")
v1.RegisterController(&UserController{})
// → GET /api/v1/users
```

Con middleware:

```go
protected := app.Group("/api/v1", authMiddleware)
protected.RegisterController(&UserController{})
```

## Getters de Route

`Route` expone getters para inspección (usados internamente por OpenAPI):

```go
r.Method()       // "GET", "POST", etc.
r.Path()         // "/users/:id"
r.Handler()      // fiber.Handler
r.Middlewares()  // []fiber.Handler
r.Summary()
r.Description()
r.Tags()
r.Secured()
r.Body()
r.Response()
r.QueryParams()
r.Deprecated()
```

## WrapHandler

Convierte `func(*Ctx) error` en `fiber.Handler` puro:

```go
h := httpx.WrapHandler(func(c *httpx.Ctx) error {
    return c.OK("ok")
})
// h es un fiber.Handler
```

Útil para integrar librerías de middleware que esperan `fiber.Handler`.
