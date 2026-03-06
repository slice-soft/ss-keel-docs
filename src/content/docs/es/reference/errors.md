---
title: Errores
description: Tipo KError y constructores incluidos para respuestas HTTP de error estructuradas.
---

`KError` es el tipo de error estructurado del framework. Retornar un `*KError` desde un handler produce una respuesta JSON consistente con status code HTTP apropiado.

## Tipo KError

```go
type KError struct {
    Code       string
    StatusCode int
    Message    string
    Cause      error // opcional: se loguea internamente, nunca se expone en respuestas
}
```

`KError` implementa la interfaz `error`:

```go
func (e *KError) Error() string  // retorna e.Message
func (e *KError) Unwrap() error  // retorna e.Cause
```

## Formato de respuesta de error

Cuando un handler devuelve `*KError`, el framework lo serializa como JSON:

```json
{
  "code": "NOT_FOUND",
  "message": "user not found",
  "statusCode": 404
}
```

El campo `Cause` **nunca** se incluye en la respuesta: solo se registra internamente.

## Constructores incluidos

### `NotFound`

```go
func NotFound(msg string) *KError
```

```go
return core.NotFound("usuario no encontrado")
// → 404 { "code": "NOT_FOUND", "message": "usuario no encontrado" }
```

### `Unauthorized`

```go
func Unauthorized(msg string) *KError
```

```go
return core.Unauthorized("token expirado")
// → 401 { "code": "UNAUTHORIZED", "message": "token expirado" }
```

### `Forbidden`

```go
func Forbidden(msg string) *KError
```

```go
return core.Forbidden("permisos insuficientes")
// → 403 { "code": "FORBIDDEN", "message": "permisos insuficientes" }
```

### `Conflict`

```go
func Conflict(msg string) *KError
```

```go
return core.Conflict("correo en uso")
// → 409 { "code": "CONFLICT", "message": "correo en uso" }
```

### `BadRequest`

```go
func BadRequest(msg string) *KError
```

```go
return core.BadRequest("formato de fecha inválido")
// → 400 { "code": "BAD_REQUEST", "message": "formato de fecha inválido" }
```

### `Internal`

```go
func Internal(msg string, cause error) *KError
```

```go
return core.Internal("falló guardado de usuario", err)
// → 500 { "code": "INTERNAL", "message": "falló guardado de usuario" }
// El error original se loguea internamente.
```

## Referencia rápida

| Constructor | Status | Code |
|---|---|---|
| `NotFound(msg)` | 404 | `NOT_FOUND` |
| `Unauthorized(msg)` | 401 | `UNAUTHORIZED` |
| `Forbidden(msg)` | 403 | `FORBIDDEN` |
| `Conflict(msg)` | 409 | `CONFLICT` |
| `BadRequest(msg)` | 400 | `BAD_REQUEST` |
| `Internal(msg, cause)` | 500 | `INTERNAL` |

## Propagación

Los valores `KError` se propagan en la cadena de errores de Go. El framework usa `errors.As` para detectarlos en cualquier nivel, así que puedes envolverlos:

```go
if err != nil {
    return fmt.Errorf("creando usuario: %w", core.NotFound("usuario no encontrado"))
}
```

## Errores de validación

`ParseBody` devuelve una respuesta `422` especial con errores por campo (distinta de `KError`):

```json
{
  "errors": [
    { "field": "email", "message": "must be a valid email" },
    { "field": "name",  "message": "this field is required" }
  ]
}
```

Ver [Validación](/reference/validation) para más detalle.
