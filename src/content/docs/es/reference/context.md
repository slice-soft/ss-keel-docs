---
title: Contexto (Ctx)
description: "Referencia del wrapper Ctx: parsing de request, helpers de respuesta, acceso a usuario e i18n."
---

`Ctx` es un wrapper liviano sobre `*fiber.Ctx` que agrega parsing de request, helpers de respuesta tipados, acceso a usuario e i18n. Como embebe `*fiber.Ctx`, todos los métodos estándar de Fiber siguen disponibles.

```go
type Ctx struct {
    *fiber.Ctx
}
```

## Parsing de request

### `ParseBody(dst any) error`

Decodifica el body JSON en `dst` y lo valida usando tags de struct.

```go
type CreateUserDTO struct {
    Name  string `json:"name"  validate:"required"`
    Email string `json:"email" validate:"required,email"`
}

func (c *UserController) create(ctx *core.Ctx) error {
    var dto CreateUserDTO
    if err := ctx.ParseBody(&dto); err != nil {
        return err // 400 si JSON inválido, 422 si falla validación
    }
    // dto es seguro de usar
    return ctx.Created(dto)
}
```

**Retorna:**
- `400 Bad Request`: JSON mal formado
- `422 Unprocessable Entity`: validación fallida (con body `[]FieldError`)

### `ParsePagination() PageQuery`

Parsea `?page` y `?limit` desde el request.

```go
q := ctx.ParsePagination()
// q.Page  — default: 1
// q.Limit — default: 20, max: 100
```

Revisa [Paginación](/reference/pagination) para la referencia completa.

## Helpers de respuesta

Todos los helpers serializan JSON y configuran el header `Content-Type` correcto.

### `OK(data any) error`

Responde con `200 OK`.

```go
return ctx.OK(user)
return ctx.OK(map[string]string{"message": "ok"})
```

### `Created(data any) error`

Responde con `201 Created`.

```go
return ctx.Created(newUser)
```

### `NoContent() error`

Responde con `204 No Content` (sin body).

```go
return ctx.NoContent()
```

### `NotFound(message ...string) error`

Responde con `404 Not Found`. Acepta mensaje opcional.

```go
return ctx.NotFound()
return ctx.NotFound("usuario no encontrado")
```

## Acceso a usuario

### `SetUser(user any)`

Guarda el usuario autenticado en el contexto de request. Se usa desde middleware/guards.

```go
ctx.SetUser(&AuthUser{ID: "123", Role: "admin"})
```

### `User() any`

Retorna el valor crudo almacenado por `SetUser`.

```go
raw := ctx.User()
```

### `UserAs[T any](c *Ctx) (T, bool)`

Helper genérico para extraer el usuario con tipo específico.

```go
user, ok := core.UserAs[*AuthUser](ctx)
if !ok {
    return core.Unauthorized("no autenticado")
}
```

Retorna `(zero, false)` si no hay usuario o el type assertion falla.

## Internacionalización

### `Lang() string`

Extrae el locale preferido desde `Accept-Language`. Retorna `"en"` si no hay header.

```go
locale := ctx.Lang() // por ejemplo: "es", "pt-BR", "en"
```

### `T(key string, args ...any) string`

Traduce una clave usando el `Translator` configurado. Si no hay traductor o la clave no existe, devuelve la clave original.

```go
msg := ctx.T("errors.user_not_found")
msg := ctx.T("welcome.message", username)
```

El traductor se configura en la app con `app.SetTranslator(t)`. Ver [Interfaces — Translator](/reference/interfaces#translator).

## Métodos Fiber

Como `Ctx` embebe `*fiber.Ctx`, puedes usar todos los métodos de Fiber:

```go
ctx.Params("id")           // parámetro de URL
ctx.Query("search")        // query string
ctx.Get("Authorization")   // header
ctx.IP()                    // IP cliente
ctx.Method()                // método HTTP
ctx.Path()                  // ruta request
ctx.Context()               // context.Context subyacente (para servicios)
ctx.Locals("key", value)   // lectura/escritura por request
```

Consulta la [documentación de Fiber](https://docs.gofiber.io/api/ctx) para el listado completo.
