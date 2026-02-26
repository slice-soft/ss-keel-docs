---
title: Context (Ctx)
description: Ctx wrapper reference — request parsing, response helpers, user access, and i18n.
---

`Ctx` is a thin wrapper around `*fiber.Ctx` that adds request parsing, typed response helpers, user access, and i18n support. It embeds `*fiber.Ctx`, so all standard Fiber methods are available.

```go
type Ctx struct {
    *fiber.Ctx
}
```

## Request Parsing

### `ParseBody(dst any) error`

Decodes the JSON request body into `dst` and validates it using struct tags.

```go
type CreateUserDTO struct {
    Name  string `json:"name"  validate:"required"`
    Email string `json:"email" validate:"required,email"`
}

func (c *UserController) create(ctx *core.Ctx) error {
    var dto CreateUserDTO
    if err := ctx.ParseBody(&dto); err != nil {
        return err // 400 if malformed JSON, 422 if validation fails
    }
    // dto is safe to use
    return ctx.Created(dto)
}
```

**Returns:**
- `400 Bad Request` — malformed JSON
- `422 Unprocessable Entity` — validation failed (with `[]FieldError` body)

### `ParsePagination() PageQuery`

Parses `?page` and `?limit` query parameters from the request.

```go
q := ctx.ParsePagination()
// q.Page  — default: 1
// q.Limit — default: 20, max: 100
```

See [Pagination](/reference/pagination) for full reference.

## Response Helpers

All helpers JSON-encode the body and set the appropriate `Content-Type` header.

### `OK(data any) error`

Responds with `200 OK`.

```go
return ctx.OK(user)
return ctx.OK(map[string]string{"message": "success"})
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

Responds with `404 Not Found`. Accepts an optional custom message.

```go
return ctx.NotFound()
return ctx.NotFound("user not found")
```

## User Access

### `SetUser(user any)`

Stores the authenticated user in the request context. Called from guard middleware.

```go
ctx.SetUser(&AuthUser{ID: "123", Role: "admin"})
```

### `User() any`

Returns the raw user value stored by `SetUser`.

```go
raw := ctx.User()
```

### `UserAs[T any](c *Ctx) (T, bool)`

Generic helper to extract the user as a specific type.

```go
user, ok := core.UserAs[*AuthUser](ctx)
if !ok {
    return core.Unauthorized("not authenticated")
}
```

Returns `(zero, false)` if the user was not set or the type assertion fails.

## Internationalization

### `Lang() string`

Extracts the preferred locale from the `Accept-Language` header. Returns `"en"` if the header is absent or empty.

```go
locale := ctx.Lang() // e.g. "es", "pt-BR", "en"
```

### `T(key string, args ...any) string`

Translates a key using the configured `Translator`. Falls back to the key itself if no translator is set or the key is not found.

```go
msg := ctx.T("errors.user_not_found")
msg := ctx.T("welcome.message", username)
```

The translator is set on the app with `app.SetTranslator(t)`. See [Interfaces — Translator](/reference/interfaces#translator).

## Fiber Methods

Since `Ctx` embeds `*fiber.Ctx`, all Fiber request methods are available:

```go
ctx.Params("id")           // URL parameter
ctx.Query("search")        // query string value
ctx.Get("Authorization")   // request header
ctx.IP()                   // client IP
ctx.Method()               // HTTP method
ctx.Path()                 // request path
ctx.Context()              // underlying context.Context (for service calls)
ctx.Locals("key", value)   // read/write per-request values
```

See the [Fiber documentation](https://docs.gofiber.io/api/ctx) for the full list.
