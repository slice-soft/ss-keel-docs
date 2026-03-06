---
title: Manejo de Errores
description: Retorna respuestas de error estructuradas y consistentes usando KError.
---

ss-keel-core incluye un tipo de error `KError` que mapea directamente a status codes HTTP. Cualquier `*KError` retornado desde un handler se serializa automáticamente como respuesta JSON.

## KError

`KError` contiene status code, código legible por máquina y mensaje legible por humanos.

```go
type KError struct {
    Code       string
    StatusCode int
    Message    string
    Cause      error // opcional, no se expone en respuestas
}
```

## Constructores incluidos

```go
core.NotFound("usuario no encontrado")         // 404
core.Unauthorized("token expirado")           // 401
core.Forbidden("permisos insuficientes")      // 403
core.Conflict("el correo ya existe")          // 409
core.BadRequest("entrada inválida")           // 400
core.Internal("falló la base de datos", err)  // 500 (se loguea cause, no se expone)
```

## Retornar errores en handlers

Retorna un `*KError` directamente en tu handler:

```go
func (c *UserController) getByID(ctx *core.Ctx) error {
    id := ctx.Params("id")

    user, err := c.service.GetByID(ctx.Context(), id)
    if err != nil {
        return core.NotFound("usuario no encontrado")
    }

    return ctx.OK(user)
}
```

El error handler del framework detecta `*KError` usando `errors.As` y responde:

```json
{
  "code": "NOT_FOUND",
  "message": "usuario no encontrado",
  "statusCode": 404
}
```

## Errores de validación

`ParseBody` devuelve automáticamente `422 Unprocessable Entity` con errores por campo cuando falla la validación:

```json
{
  "errors": [
    { "field": "email", "message": "must be a valid email" },
    { "field": "name",  "message": "this field is required" }
  ]
}
```

No necesitas manejar esto manualmente: basta con devolver el error de `ParseBody`.

```go
func (c *UserController) create(ctx *core.Ctx) error {
    var dto CreateUserDTO
    if err := ctx.ParseBody(&dto); err != nil {
        return err // 400 o 422 automático
    }
    ...
}
```

## Envolver errores

Usa `core.Internal` cuando ocurra un error inesperado para que se registre internamente sin filtrar detalles al cliente:

```go
result, err := db.Query(...)
if err != nil {
    return core.Internal("falló la consulta de usuarios", err)
    // Respuesta: 500 Internal Server Error
    // El error original se registra internamente
}
```

## Propagar errores entre capas

Define errores de dominio en la capa de servicio y propágalos desde handlers:

```go
// users/errors.go
var ErrUserNotFound = core.NotFound("usuario no encontrado")
var ErrEmailTaken   = core.Conflict("correo en uso")

// users/service.go
func (s *UserService) GetByID(ctx context.Context, id string) (*User, error) {
    user, err := s.repo.FindByID(ctx, id)
    if err != nil {
        return nil, ErrUserNotFound
    }
    return user, nil
}

// users/controller.go
func (c *UserController) getByID(ctx *core.Ctx) error {
    user, err := c.service.GetByID(ctx.Context(), ctx.Params("id"))
    if err != nil {
        return err // KError sube hasta el error handler
    }
    return ctx.OK(user)
}
```

## Formato de respuesta de error

| Constructor | Status | Code |
|---|---|---|
| `NotFound(msg)` | 404 | `NOT_FOUND` |
| `Unauthorized(msg)` | 401 | `UNAUTHORIZED` |
| `Forbidden(msg)` | 403 | `FORBIDDEN` |
| `Conflict(msg)` | 409 | `CONFLICT` |
| `BadRequest(msg)` | 400 | `BAD_REQUEST` |
| `Internal(msg, cause)` | 500 | `INTERNAL` |
