---
title: Controladores
description: Aprende a definir rutas y handlers usando controladores en ss-keel-core.
---

Los controllers agrupan rutas relacionadas. Cualquier struct que implemente la interfaz `Controller` puede registrarse en la app.

```go
type Controller interface {
    Routes() []httpx.Route
}
```

## Definir un Controller

```go
type UserController struct {
    // inyecta dependencias aquí (por ejemplo: service, repository)
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

## Registrar controladores

```go
app.RegisterController(&UserController{})
```

Las rutas del controller se montan automáticamente en la app.

## Route Builder

Cada ruta se crea con uno de los constructores HTTP, que devuelven un `Route` sobre el que puedes encadenar métodos builder.

```go
httpx.GET("/users", handler).
    Tag("users").
    Describe("Listar usuarios", "Retorna una lista paginada de usuarios").
    WithResponse(httpx.WithResponse[[]User](200))
```

### Constructores de métodos HTTP

```go
httpx.GET(path, handler)
httpx.POST(path, handler)
httpx.PUT(path, handler)
httpx.PATCH(path, handler)
httpx.DELETE(path, handler)
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

httpx.POST("/users", func(c *httpx.Ctx) error {
    var dto CreateUserDTO
    if err := c.ParseBody(&dto); err != nil {
        return err // retorna 400 o 422 automáticamente
    }
    // dto está decodificado y validado
    return c.Created(dto)
}).
    Tag("users").
    Describe("Crear usuario").
    WithBody(httpx.WithBody[CreateUserDTO]()).
    WithResponse(httpx.WithResponse[User](201))
```

`ParseBody` devuelve:
- `400 Bad Request` si el JSON está mal formado
- `422 Unprocessable Entity` si falla la validación (con errores por campo)

## Helpers de respuesta

El wrapper `Ctx` incluye helpers para establecer el código de estado correcto y responder JSON.

```go
func (c *httpx.Ctx) error {
    return c.OK(data)        // 200
    return c.Created(data)   // 201
    return c.NoContent()     // 204
    return c.NotFound()      // 404
}
```

## Parámetros de query

Documenta query params para OpenAPI y léelos desde el contexto:

```go
httpx.GET("/users", func(c *httpx.Ctx) error {
    search := c.Query("search")
    return c.OK(search)
}).
    WithQueryParam("search", "string", false, "Filtrar usuarios por nombre")
```

## Parámetros de URL

Accede a parámetros de ruta mediante el contexto embebido de Fiber:

```go
httpx.GET("/users/:id", func(c *httpx.Ctx) error {
    id := c.Params("id")
    return c.OK(map[string]string{"id": id})
})
```

## Middleware por ruta

Adjunta middleware a rutas puntuales con `.Use()`:

```go
httpx.GET("/admin/dashboard", dashboardHandler).
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

func (c *UserController) Routes() []httpx.Route {
    return []httpx.Route{
        httpx.GET("/users", c.list).
            Tag("users").
            Describe("Listar usuarios", "Retorna una lista paginada de todos los usuarios").
            WithResponse(httpx.WithResponse[httpx.Page[User]](200)),

        httpx.GET("/users/:id", c.getByID).
            Tag("users").
            Describe("Obtener usuario por ID").
            WithResponse(httpx.WithResponse[User](200)),

        httpx.POST("/users", c.create).
            Tag("users").
            Describe("Crear usuario").
            WithBody(httpx.WithBody[CreateUserDTO]()).
            WithResponse(httpx.WithResponse[User](201)),

        httpx.DELETE("/users/:id", c.delete).
            Tag("users").
            Describe("Eliminar usuario").
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
