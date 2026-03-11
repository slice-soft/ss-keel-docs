---
title: Routing
description: Route builder API, HTTP constructors and middleware chaining.
---

Routes are created with HTTP method constructors that return a `Route` value. Builder methods can be chained to add metadata, middleware, and OpenAPI documentation.

## HTTP method constructors

```go
func GET(path string, handler func(*Ctx) error) Route
func POST(path string, handler func(*Ctx) error) Route
func PUT(path string, handler func(*Ctx) error) Route
func PATCH(path string, handler func(*Ctx) error) Route
func DELETE(path string, handler func(*Ctx) error) Route
```

### Example

```go
httpx.GET("/users", func(c *httpx.Ctx) error {
    return c.OK("hello")
})
```

## Route builder methods

All builder methods return a new `Route`; they are safe to chain.

### `.Tag(tag string) Route`

Groups the route under an OpenAPI tag.

```go
httpx.GET("/users", handler).Tag("users")
```

### `.Describe(summary string, description ...string) Route`

Defines the OpenAPI summary and optional extended description.

```go
httpx.GET("/users", handler).
    Describe("List users", "Returns a paginated list of all users in the system")
```

### `.WithBody(b *BodyMeta) Route`

Documents the request body type. Use the generic helper `WithBody[T]()`.

```go
httpx.POST("/users", handler).
    WithBody(httpx.WithBody[CreateUserDTO]())
```

### `.WithResponse(res *ResponseMeta) Route`

Documents response type and status code. Use the generic helper `WithResponse[T](statusCode)`.

```go
httpx.POST("/users", handler).
    WithResponse(httpx.WithResponse[User](201))
```

### `.WithQueryParam(name, typ string, required bool, desc ...string) Route`

Adds a documented query param to the OpenAPI spec.

```go
httpx.GET("/users", handler).
    WithQueryParam("search", "string", false, "Filter by name").
    WithQueryParam("limit",  "integer", false, "Maximum results per page")
```

**Valid type values:** `"string"`, `"integer"`, `"boolean"`, `"number"`, `"array"`

### `.Use(middlewares ...fiber.Handler) Route`

Attaches one or more Fiber middlewares to the route.

```go
httpx.GET("/admin", handler).
    Use(authMiddleware, adminOnly)
```

### `.WithSecured(schemes ...string) Route`

Marks the route as authenticated in OpenAPI.

```go
httpx.DELETE("/users/:id", handler).
    WithSecured("bearerAuth")
```

### `.WithDeprecated() Route`

Marks the route as deprecated in OpenAPI.

```go
httpx.GET("/v1/users", handler).
    WithDeprecated()
```

## Generic helpers

### `WithBody[T any]() *BodyMeta`

Creates `BodyMeta` from a Go type. Used for OpenAPI schema generation.

```go
httpx.WithBody[CreateUserDTO]()
```

### `WithResponse[T any](statusCode int) *ResponseMeta`

Creates `ResponseMeta` from Go type and status code.

```go
httpx.WithResponse[User](201)
httpx.WithResponse[httpx.Page[User]](200)
httpx.WithResponse[[]string](200)
```

## Groups

Use `app.Group()` to prefix routes and share middleware:

```go
v1 := app.Group("/api/v1")
v1.RegisterController(&UserController{})
// → GET /api/v1/users
```

With middleware:

```go
protected := app.Group("/api/v1", authMiddleware)
protected.RegisterController(&UserController{})
```

## Route getters

`Route` exposes getters for inspection (used internally by OpenAPI):

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

Converts `func(*Ctx) error` into a pure `fiber.Handler`:

```go
h := httpx.WrapHandler(func(c *httpx.Ctx) error {
    return c.OK("ok")
})
// h is a fiber.Handler
```

Useful for integrating middleware libraries that expect `fiber.Handler`.
