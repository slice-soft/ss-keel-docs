---
title: Controllers
description: Learn how to define routes and handlers using controllers in ss-keel-core.
---

Controllers group related routes. Any struct that implements the `Controller` interface can be registered in the app.

```go
type Controller interface {
    Routes() []httpx.Route
}
```

## Defining a Controller

```go
type UserController struct {
    // inject dependencies here (e.g.: service, repository)
}

func (c *UserController) Routes() []httpx.Route {
    return []httpx.Route{
        httpx.GET("/users", c.list),
        httpx.GET("/users/:id", c.getByID),
        httpx.POST("/users", c.create),
        httpx.PUT("/users/:id", c.update),
        httpx.DELETE("/users/:id", c.delete),
    }
}
```

## Registering controllers

```go
app.RegisterController(&UserController{})
```

The controller's routes are automatically mounted in the app.

## Route Builder

Each route is created with one of the HTTP constructors, which return a `Route` on which you can chain builder methods.

```go
httpx.GET("/users", handler).
    Tag("users").
    Describe("List users", "Returns a paginated list of users").
    WithResponse(httpx.WithResponse[[]User](200))
```

### HTTP method constructors

```go
httpx.GET(path, handler)
httpx.POST(path, handler)
httpx.PUT(path, handler)
httpx.PATCH(path, handler)
httpx.DELETE(path, handler)
```

### Builder methods

| Method | Description |
|---|---|
| `.Tag(tag string)` | Groups the route under an OpenAPI tag |
| `.Describe(summary, description?)` | Defines summary and optional description in OpenAPI |
| `.WithBody(body *BodyMeta)` | Declares the request body type for OpenAPI |
| `.WithResponse(res *ResponseMeta)` | Declares response type and status code |
| `.WithQueryParam(name, type, required, desc?)` | Adds a documented query param |
| `.Use(middlewares ...fiber.Handler)` | Adds per-route middleware |
| `.WithSecured(schemes ...string)` | Marks the route as secured (OpenAPI) |
| `.WithDeprecated()` | Marks the route as deprecated in OpenAPI |

## Request body

Use `WithBody` to document the expected body and `ParseBody` in the handler to decode and validate.

```go
type CreateUserDTO struct {
    Name  string `json:"name"  validate:"required"`
    Email string `json:"email" validate:"required,email"`
}

httpx.POST("/users", func(c *httpx.Ctx) error {
    var dto CreateUserDTO
    if err := c.ParseBody(&dto); err != nil {
        return err // returns 400 or 422 automatically
    }
    // dto is decoded and validated
    return c.Created(dto)
}).
    Tag("users").
    Describe("Create user").
    WithBody(httpx.WithBody[CreateUserDTO]()).
    WithResponse(httpx.WithResponse[User](201))
```

`ParseBody` returns:
- `400 Bad Request` if the JSON is malformed
- `422 Unprocessable Entity` if validation fails (with per-field errors)

## Response helpers

The `Ctx` wrapper includes helpers for setting the correct status code and responding with JSON.

```go
func (c *httpx.Ctx) error {
    return c.OK(data)        // 200
    return c.Created(data)   // 201
    return c.NoContent()     // 204
    return c.NotFound()      // 404
}
```

## Query parameters

Document query params for OpenAPI and read them from the context:

```go
httpx.GET("/users", func(c *httpx.Ctx) error {
    search := c.Query("search")
    return c.OK(search)
}).
    WithQueryParam("search", "string", false, "Filter users by name")
```

## URL parameters

Access route parameters through the embedded Fiber context:

```go
httpx.GET("/users/:id", func(c *httpx.Ctx) error {
    id := c.Params("id")
    return c.OK(map[string]string{"id": id})
})
```

## Per-route middleware

Attach middleware to specific routes with `.Use()`:

```go
httpx.GET("/admin/dashboard", dashboardHandler).
    Use(authMiddleware, rateLimiter)
```

## Full example

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

func (c *UserController) Routes() []httpx.Route {
    return []httpx.Route{
        httpx.GET("/users", c.list).
            Tag("users").
            Describe("List users", "Returns a paginated list of all users").
            WithResponse(httpx.WithResponse[httpx.Page[User]](200)),

        httpx.GET("/users/:id", c.getByID).
            Tag("users").
            Describe("Get user by ID").
            WithResponse(httpx.WithResponse[User](200)),

        httpx.POST("/users", c.create).
            Tag("users").
            Describe("Create user").
            WithBody(httpx.WithBody[CreateUserDTO]()).
            WithResponse(httpx.WithResponse[User](201)),

        httpx.DELETE("/users/:id", c.delete).
            Tag("users").
            Describe("Delete user").
            WithSecured("bearerAuth"),
    }
}

func (c *UserController) list(ctx *httpx.Ctx) error {
    q := ctx.ParsePagination()
    users, err := c.service.List(ctx.Context(), q)
    if err != nil {
        return err
    }
    return ctx.OK(users)
}

func (c *UserController) getByID(ctx *httpx.Ctx) error {
    id := ctx.Params("id")
    user, err := c.service.GetByID(ctx.Context(), id)
    if err != nil {
        return err
    }
    return ctx.OK(user)
}

func (c *UserController) create(ctx *httpx.Ctx) error {
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

func (c *UserController) delete(ctx *httpx.Ctx) error {
    id := ctx.Params("id")
    if err := c.service.Delete(ctx.Context(), id); err != nil {
        return err
    }
    return ctx.NoContent()
}
```
