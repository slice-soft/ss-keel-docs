---
title: Controllers
description: Learn how to define routes and handlers using controllers in ss-keel-core.
---

Controllers group related routes together. Any struct that implements the `Controller` interface can be registered with the app.

```go
type Controller interface {
    Routes() []core.Route
}
```

## Defining a Controller

```go
type UserController struct {
    // inject dependencies here (e.g. service, repository)
}

func (c *UserController) Routes() []core.Route {
    return []core.Route{
        core.GET("/users", c.list),
        core.GET("/users/:id", c.getByID),
        core.POST("/users", c.create),
        core.PUT("/users/:id", c.update),
        core.DELETE("/users/:id", c.delete),
    }
}
```

## Registering Controllers

```go
app.RegisterController(&UserController{})
```

Routes from the controller are automatically mounted to the app.

## Route Builder

Every route is created with one of the HTTP method constructors, which return a `Route` you can chain builder methods on.

```go
core.GET("/users", handler).
    Tag("users").
    Describe("List users", "Returns a paginated list of users").
    WithResponse(core.WithResponse[[]User](200))
```

### HTTP Method Constructors

```go
core.GET(path, handler)
core.POST(path, handler)
core.PUT(path, handler)
core.PATCH(path, handler)
core.DELETE(path, handler)
```

### Builder Methods

| Method | Description |
|---|---|
| `.Tag(tag string)` | Group route under an OpenAPI tag |
| `.Describe(summary, description?)` | Set OpenAPI summary and optional description |
| `.WithBody(body *BodyMeta)` | Declare request body type for OpenAPI |
| `.WithResponse(res *ResponseMeta)` | Declare response type and status code |
| `.WithQueryParam(name, type, required, desc?)` | Add a documented query parameter |
| `.Use(middlewares ...fiber.Handler)` | Add per-route middleware |
| `.WithSecured(schemes ...string)` | Mark route as secured (OpenAPI) |
| `.WithDeprecated()` | Mark route as deprecated in OpenAPI |

## Request Body

Use `WithBody` to document the expected request body and `ParseBody` in the handler to decode and validate it.

```go
type CreateUserDTO struct {
    Name  string `json:"name"  validate:"required"`
    Email string `json:"email" validate:"required,email"`
}

core.POST("/users", func(c *core.Ctx) error {
    var dto CreateUserDTO
    if err := c.ParseBody(&dto); err != nil {
        return err // automatically returns 400 or 422
    }
    // dto is decoded and validated
    return c.Created(dto)
}).
    Tag("users").
    Describe("Create user").
    WithBody(core.WithBody[CreateUserDTO]()).
    WithResponse(core.WithResponse[User](201))
```

`ParseBody` returns:
- `400 Bad Request` — if the JSON is malformed
- `422 Unprocessable Entity` — if validation fails (with field errors)

## Response Helpers

The `Ctx` wrapper provides response helpers that set the correct status code and JSON-encode the body.

```go
func (c *core.Ctx) error {
    return c.OK(data)        // 200
    return c.Created(data)   // 201
    return c.NoContent()     // 204
    return c.NotFound()      // 404
}
```

## Query Parameters

Document query parameters for OpenAPI and parse them manually from the context:

```go
core.GET("/users", func(c *core.Ctx) error {
    search := c.Query("search")
    return c.OK(search)
}).
    WithQueryParam("search", "string", false, "Filter users by name")
```

## URL Parameters

Access URL parameters via the embedded Fiber context:

```go
core.GET("/users/:id", func(c *core.Ctx) error {
    id := c.Params("id")
    return c.OK(map[string]string{"id": id})
})
```

## Per-Route Middleware

Attach middleware to individual routes with `.Use()`:

```go
core.GET("/admin/dashboard", dashboardHandler).
    Use(authMiddleware, rateLimiter)
```

## Full Example

```go
package users

import (
    "github.com/slice-soft/ss-keel-core/core"
)

type UserController struct {
    service *UserService
}

func NewUserController(s *UserService) *UserController {
    return &UserController{service: s}
}

func (c *UserController) Routes() []core.Route {
    return []core.Route{
        core.GET("/users", c.list).
            Tag("users").
            Describe("List users", "Returns a paginated list of all users").
            WithResponse(core.WithResponse[core.Page[User]](200)),

        core.GET("/users/:id", c.getByID).
            Tag("users").
            Describe("Get user by ID").
            WithResponse(core.WithResponse[User](200)),

        core.POST("/users", c.create).
            Tag("users").
            Describe("Create user").
            WithBody(core.WithBody[CreateUserDTO]()).
            WithResponse(core.WithResponse[User](201)),

        core.DELETE("/users/:id", c.delete).
            Tag("users").
            Describe("Delete user").
            WithSecured("bearerAuth"),
    }
}

func (c *UserController) list(ctx *core.Ctx) error {
    q := ctx.ParsePagination()
    users, err := c.service.List(ctx.Context(), q)
    if err != nil {
        return err
    }
    return ctx.OK(users)
}

func (c *UserController) getByID(ctx *core.Ctx) error {
    id := ctx.Params("id")
    user, err := c.service.GetByID(ctx.Context(), id)
    if err != nil {
        return err
    }
    return ctx.OK(user)
}

func (c *UserController) create(ctx *core.Ctx) error {
    var dto CreateUserDTO
    if err := ctx.ParseBody(&dto); err != nil {
        return err
    }
    user, err := c.service.Create(ctx.Context(), &dto)
    if err != nil {
        return err
    }
    return ctx.Created(user)
}

func (c *UserController) delete(ctx *core.Ctx) error {
    id := ctx.Params("id")
    if err := c.service.Delete(ctx.Context(), id); err != nil {
        return err
    }
    return ctx.NoContent()
}
```
