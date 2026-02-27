---
title: Routing
description: Route builder API, HTTP method constructors, and middleware chaining.
---

Routes are created using HTTP method constructors that return a `Route` value. Builder methods can be chained to attach metadata, middleware, and OpenAPI documentation.

## HTTP Method Constructors

```go
func GET(path string, handler func(*Ctx) error) Route
func POST(path string, handler func(*Ctx) error) Route
func PUT(path string, handler func(*Ctx) error) Route
func PATCH(path string, handler func(*Ctx) error) Route
func DELETE(path string, handler func(*Ctx) error) Route
```

### Example

```go
core.GET("/users", func(c *core.Ctx) error {
    return c.OK("hello")
})
```

## Route Builder Methods

All builder methods return a new `Route` — they are safe to chain.

### `.Tag(tag string) Route`

Groups the route under an OpenAPI tag.

```go
core.GET("/users", handler).Tag("users")
```

### `.Describe(summary string, description ...string) Route`

Sets the OpenAPI summary and optional longer description.

```go
core.GET("/users", handler).
    Describe("List users", "Returns a paginated list of all users in the system")
```

### `.WithBody(b *BodyMeta) Route`

Documents the request body type. Use the `WithBody[T]()` generic helper.

```go
core.POST("/users", handler).
    WithBody(core.WithBody[CreateUserDTO]())
```

### `.WithResponse(res *ResponseMeta) Route`

Documents the response type and status code. Use the `WithResponse[T](statusCode)` generic helper.

```go
core.POST("/users", handler).
    WithResponse(core.WithResponse[User](201))
```

### `.WithQueryParam(name, typ string, required bool, desc ...string) Route`

Adds a documented query parameter to the OpenAPI spec.

```go
core.GET("/users", handler).
    WithQueryParam("search", "string", false, "Filter by name").
    WithQueryParam("limit",  "integer", false, "Max results per page")
```

**Type values:** `"string"`, `"integer"`, `"boolean"`, `"number"`, `"array"`

### `.Use(middlewares ...fiber.Handler) Route`

Attaches one or more Fiber middlewares to the route.

```go
core.GET("/admin", handler).
    Use(authMiddleware, adminOnly)
```

### `.WithSecured(schemes ...string) Route`

Marks the route as requiring authentication in the OpenAPI spec.

```go
core.DELETE("/users/:id", handler).
    WithSecured("bearerAuth")
```

### `.WithDeprecated() Route`

Marks the route as deprecated in the OpenAPI spec.

```go
core.GET("/v1/users", handler).
    WithDeprecated()
```

## Generic Helpers

### `WithBody[T any]() *BodyMeta`

Creates a `BodyMeta` from a Go type. Used for OpenAPI schema generation.

```go
core.WithBody[CreateUserDTO]()
```

### `WithResponse[T any](statusCode int) *ResponseMeta`

Creates a `ResponseMeta` from a Go type and status code.

```go
core.WithResponse[User](201)
core.WithResponse[core.Page[User]](200)
core.WithResponse[[]string](200)
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

## Route Getters

`Route` exposes getters for inspection (used internally by OpenAPI builder):

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

Convert a `func(*Ctx) error` to a raw `fiber.Handler`:

```go
h := core.WrapHandler(func(c *core.Ctx) error {
    return c.OK("ok")
})
// h is a fiber.Handler
```

This is useful when integrating with middleware libraries that expect `fiber.Handler`.
