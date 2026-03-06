---
title: Controladores
description: Aprende a definir rutas y handlers usando controladores en ss-keel-core.
---

Los controllers agrupan rutas relacionadas. Cualquier struct que implemente la interfaz `Controller` puede registrarse en la app.

```go
type Controller interface {
    Routes() []core.Route
}
```

## Definir un Controller

```go
type UserController struct {
    // inyecta dependencias aquí (por ejemplo: service, repository)
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

## Registrar controladores

```go
app.RegisterController(&UserController{})
```

Las rutas del controller se montan automáticamente en la app.

## Route Builder

Cada ruta se crea con uno de los constructores HTTP, que devuelven un `Route` sobre el que puedes encadenar métodos builder.

```go
core.GET("/users", handler).
    Tag("users").
    Describe("Listar usuarios", "Retorna una lista paginada de usuarios").
    WithResponse(core.WithResponse[[]User](200))
```

### Constructores de métodos HTTP

```go
core.GET(path, handler)
core.POST(path, handler)
core.PUT(path, handler)
core.PATCH(path, handler)
core.DELETE(path, handler)
```

### Métodos builder

| Método | Descripción |
|---|---|
| `.Tag(tag string)` | Agrupa la ruta bajo un tag de OpenAPI |
| `.Describe(summary, description?)` | Define resumen y descripción opcional en OpenAPI |
| `.WithBody(body *BodyMeta)` | Declara tipo de body de request para OpenAPI |
| `.WithResponse(res *ResponseMeta)` | Declara tipo y status code de respuesta |
| `.WithQueryParam(name, type, required, desc?)` | Agrega query param documentado |
| `.Use(middlewares ...fiber.Handler)` | Agrega middleware por ruta |
| `.WithSecured(schemes ...string)` | Marca la ruta como protegida (OpenAPI) |
| `.WithDeprecated()` | Marca la ruta como deprecada en OpenAPI |

## Cuerpo de request

Usa `WithBody` para documentar el body esperado y `ParseBody` en el handler para decodificar y validar.

```go
type CreateUserDTO struct {
    Name  string `json:"name"  validate:"required"`
    Email string `json:"email" validate:"required,email"`
}

core.POST("/users", func(c *core.Ctx) error {
    var dto CreateUserDTO
    if err := c.ParseBody(&dto); err != nil {
        return err // retorna 400 o 422 automáticamente
    }
    // dto está decodificado y validado
    return c.Created(dto)
}).
    Tag("users").
    Describe("Crear usuario").
    WithBody(core.WithBody[CreateUserDTO]()).
    WithResponse(core.WithResponse[User](201))
```

`ParseBody` devuelve:
- `400 Bad Request` si el JSON está mal formado
- `422 Unprocessable Entity` si falla la validación (con errores por campo)

## Helpers de respuesta

El wrapper `Ctx` incluye helpers para establecer el código de estado correcto y responder JSON.

```go
func (c *core.Ctx) error {
    return c.OK(data)        // 200
    return c.Created(data)   // 201
    return c.NoContent()     // 204
    return c.NotFound()      // 404
}
```

## Parámetros de query

Documenta query params para OpenAPI y léelos desde el contexto:

```go
core.GET("/users", func(c *core.Ctx) error {
    search := c.Query("search")
    return c.OK(search)
}).
    WithQueryParam("search", "string", false, "Filtrar usuarios por nombre")
```

## Parámetros de URL

Accede a parámetros de ruta mediante el contexto embebido de Fiber:

```go
core.GET("/users/:id", func(c *core.Ctx) error {
    id := c.Params("id")
    return c.OK(map[string]string{"id": id})
})
```

## Middleware por ruta

Adjunta middleware a rutas puntuales con `.Use()`:

```go
core.GET("/admin/dashboard", dashboardHandler).
    Use(authMiddleware, rateLimiter)
```

## Ejemplo completo

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
            Describe("Listar usuarios", "Retorna una lista paginada de todos los usuarios").
            WithResponse(core.WithResponse[core.Page[User]](200)),

        core.GET("/users/:id", c.getByID).
            Tag("users").
            Describe("Obtener usuario por ID").
            WithResponse(core.WithResponse[User](200)),

        core.POST("/users", c.create).
            Tag("users").
            Describe("Crear usuario").
            WithBody(core.WithBody[CreateUserDTO]()).
            WithResponse(core.WithResponse[User](201)),

        core.DELETE("/users/:id", c.delete).
            Tag("users").
            Describe("Eliminar usuario").
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
