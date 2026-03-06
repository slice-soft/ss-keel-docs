---
title: Validación
description: "Validación de structs con go-playground/validator: errores por campo y tags soportados."
---

El paquete `validation` envuelve [go-playground/validator](https://github.com/go-playground/validator) y genera mensajes de error por campo amigables.

## Importación

```go
import "github.com/slice-soft/ss-keel-core/validation"
```

## Validar

```go
func Validate(s any) []FieldError
```

Valida un struct usando tags `validate`. Retorna `nil` si el struct es válido.

```go
type CreateUserDTO struct {
    Name  string `json:"name"  validate:"required"`
    Email string `json:"email" validate:"required,email"`
    Age   int    `json:"age"   validate:"min=18"`
}

dto := CreateUserDTO{Name: "", Email: "invalid", Age: 15}
errors := validation.Validate(&dto)

// errors:
// [
//   { "field": "name",  "message": "this field is required" },
//   { "field": "email", "message": "must be a valid email" },
//   { "field": "age",   "message": "minimum 18 characters" },
// ]
```

## FieldError

```go
type FieldError struct {
    Field   string `json:"field"`
    Message string `json:"message"`
}
```

## Tags soportados y mensajes

| Tag | Mensaje |
|---|---|
| `required` | `this field is required` |
| `email` | `must be a valid email` |
| `min=N` | `minimum N characters` |
| `max=N` | `maximum N characters` |
| `uuid` | `must be a valid UUID` |
| `uuid4` | `must be a valid UUID` |
| `numeric` | `must be a numeric value` |
| `url` | `must be a valid URL` |

Para tags no reconocidos, se usa el mensaje crudo de validator como fallback.

## Integración con ParseBody

`Ctx.ParseBody` llama a `Validate` internamente. No necesitas invocarlo manualmente si usas `ParseBody`:

```go
func (c *UserController) create(ctx *core.Ctx) error {
    var dto CreateUserDTO
    if err := ctx.ParseBody(&dto); err != nil {
        // 400 Bad Request: JSON mal formado
        // 422 Unprocessable Entity: errores de validación
        return err
    }
    // dto ya está validado
}
```

Body de respuesta `422`:

```json
{
  "errors": [
    { "field": "email", "message": "must be a valid email" },
    { "field": "name",  "message": "this field is required" }
  ]
}
```

## Uso standalone

También puedes llamar `Validate` fuera de `ParseBody`:

```go
type UpdateProfileDTO struct {
    Bio  string `validate:"max=500"`
    URL  string `validate:"omitempty,url"`
}

dto := UpdateProfileDTO{Bio: strings.Repeat("x", 600), URL: "not-a-url"}
if errs := validation.Validate(&dto); errs != nil {
    // maneja errs
}
```

## Referencia de tags

Para listado completo de tags disponibles, revisa la [documentación de go-playground/validator](https://pkg.go.dev/github.com/go-playground/validator/v10).
