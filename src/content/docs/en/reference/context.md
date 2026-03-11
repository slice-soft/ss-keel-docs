---
title: Context (Ctx)
description: "Ctx wrapper reference: request parsing, response helpers, user access and i18n."
---

`Ctx` is a lightweight wrapper over `*fiber.Ctx` that adds request parsing, typed response helpers, user access, and i18n. Since it embeds `*fiber.Ctx`, all standard Fiber methods remain available.

```go
type Ctx struct {
    *fiber.Ctx
}
```

## Request parsing

### `ParseBody(dst any) error`

Decodes the JSON body into `dst` and validates it using struct tags.

```go
type CreateUserDTO struct {
    Name  string `json:"name"  validate:"required"`
    Email string `json:"email" validate:"required,email"`
}

func (c *UserController) create(ctx *core.Ctx) error {
    var dto CreateUserDTO
    if err := ctx.ParseBody(&dto); err != nil {
        return err // 400 if invalid JSON, 422 if validation fails
    }
    // dto is safe to use
    return ctx.Created(dto)
}
```

**Returns:**
- `400 Bad Request`: malformed JSON
- `422 Unprocessable Entity`: validation failed (with `[]FieldError` body)

### `ParsePagination() PageQuery`

Parses `?page` and `?limit` from the request.

```go
q := ctx.ParsePagination()
// q.Page  — default: 1
// q.Limit — default: 20, max: 100
```

See [Pagination](/reference/pagination) for the full reference.

## Response helpers

All helpers serialize JSON and set the correct `Content-Type` header.

### `OK(data any) error`

Responds with `200 OK`.

```go
return ctx.OK(user)
return ctx.OK(map[string]string{"message": "ok"})
```

### `Created(data any) error`

Responds with `201 Created`.

```go
return ctx.Created(newUser)
```

### `NoContent() error`

Responds with `204 No Content` (no body).

```go
return ctx.NoContent()
```

### `NotFound(message ...string) error`

Responds with `404 Not Found`. Accepts an optional message.

```go
return ctx.NotFound()
return ctx.NotFound("user not found")
```

## User access

### `SetUser(user any)`

Stores the authenticated user in the request context. Used from middleware/guards.

```go
ctx.SetUser(&AuthUser{ID: "123", Role: "admin"})
```

### `User() any`

Returns the raw value stored by `SetUser`.

```go
raw := ctx.User()
```

### `UserAs[T any](c *Ctx) (T, bool)`

Generic helper to extract the user with a specific type.

```go
user, ok := core.UserAs[*AuthUser](ctx)
if !ok {
    return core.Unauthorized("not authenticated")
}
```

Returns `(zero, false)` if there is no user or the type assertion fails.

## Internationalization

### `Lang() string`

Extracts the preferred locale from `Accept-Language`. Returns `"en"` if no header.

```go
locale := ctx.Lang() // e.g.: "es", "pt-BR", "en"
```

### `T(key string, args ...any) string`

Translates a key using the configured `Translator`. If no translator or the key doesn't exist, returns the original key.

```go
msg := ctx.T("errors.user_not_found")
msg := ctx.T("welcome.message", username)
```

The translator is configured in the app with `app.SetTranslator(t)`. See [Contracts — Translator](/reference/interfaces#translator).

## Fiber methods

Since `Ctx` embeds `*fiber.Ctx`, you can use all Fiber methods:

```go
ctx.Params("id")           // URL parameter
ctx.Query("search")        // query string
ctx.Get("Authorization")   // header
ctx.IP()                    // client IP
ctx.Method()                // HTTP method
ctx.Path()                  // request path
ctx.Context()               // underlying context.Context (for services)
ctx.Locals("key", value)   // per-request read/write
```

See the [Fiber documentation](https://docs.gofiber.io/api/ctx) for the full list.
