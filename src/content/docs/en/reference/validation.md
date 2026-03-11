---
title: Validation
description: "Struct validation with go-playground/validator: per-field errors and supported tags."
---

The `validation` package wraps [go-playground/validator](https://github.com/go-playground/validator) and generates friendly per-field error messages.

## Import

```go
import "github.com/slice-soft/ss-keel-core/validation"
```

## Validate

```go
func Validate(s any) []FieldError
```

Validates a struct using `validate` tags. Returns `nil` if the struct is valid.

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

## Supported tags and messages

| Tag | Message |
|---|---|
| `required` | `this field is required` |
| `email` | `must be a valid email` |
| `min=N` | `minimum N characters` |
| `max=N` | `maximum N characters` |
| `uuid` | `must be a valid UUID` |
| `uuid4` | `must be a valid UUID` |
| `numeric` | `must be a numeric value` |
| `url` | `must be a valid URL` |

For unrecognized tags, the raw validator message is used as a fallback.

## Integration with ParseBody

`Ctx.ParseBody` calls `Validate` internally. You don't need to invoke it manually if you use `ParseBody`:

```go
func (c *UserController) create(ctx *httpx.Ctx) error {
    var dto CreateUserDTO
    if err := ctx.ParseBody(&dto); err != nil {
        // 400 Bad Request: malformed JSON
        // 422 Unprocessable Entity: validation errors
        return err
    }
    // dto is already validated
}
```

`422` response body:

```json
{
  "errors": [
    { "field": "email", "message": "must be a valid email" },
    { "field": "name",  "message": "this field is required" }
  ]
}
```

## Standalone usage

You can also call `Validate` outside of `ParseBody`:

```go
type UpdateProfileDTO struct {
    Bio  string `validate:"max=500"`
    URL  string `validate:"omitempty,url"`
}

dto := UpdateProfileDTO{Bio: strings.Repeat("x", 600), URL: "not-a-url"}
if errs := validation.Validate(&dto); errs != nil {
    // handle errs
}
```

## Tags reference

For the full list of available tags, see the [go-playground/validator documentation](https://pkg.go.dev/github.com/go-playground/validator/v10).
