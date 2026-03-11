---
title: Error Handling
description: Return structured and consistent error responses using KError.
---

ss-keel-core includes a `KError` error type that maps directly to HTTP status codes. Any `*KError` returned from a handler is automatically serialized as a JSON response.

## KError

`KError` contains a status code, a machine-readable code, and a human-readable message.

```go
type KError struct {
    Code       string
    StatusCode int
    Message    string
    Cause      error // optional, not exposed in responses
}
```

## Built-in constructors

```go
core.NotFound("user not found")          // 404
core.Unauthorized("token expired")       // 401
core.Forbidden("insufficient permissions") // 403
core.Conflict("email already exists")    // 409
core.BadRequest("invalid input")         // 400
core.Internal("database failed", err)    // 500 (cause is logged, not exposed)
```

## Returning errors in handlers

Return a `*KError` directly from your handler:

```go
func (c *UserController) getByID(ctx *httpx.Ctx) error {
    id := ctx.Params("id")

    user, err := c.service.GetByID(ctx.Context(), id)
    if err != nil {
        return core.NotFound("user not found")
    }

    return ctx.OK(user)
}
```

The framework's error handler detects `*KError` using `errors.As` and responds:

```json
{
  "code": "NOT_FOUND",
  "message": "user not found",
  "statusCode": 404
}
```

## Validation errors

`ParseBody` automatically returns `422 Unprocessable Entity` with per-field errors when validation fails:

```json
{
  "errors": [
    { "field": "email", "message": "must be a valid email" },
    { "field": "name",  "message": "this field is required" }
  ]
}
```

You don't need to handle this manually: just return the error from `ParseBody`.

```go
func (c *UserController) create(ctx *httpx.Ctx) error {
    var dto CreateUserDTO
    if err := ctx.ParseBody(&dto); err != nil {
        return err // automatic 400 or 422
    }
    ...
}
```

## Wrapping errors

Use `core.Internal` when an unexpected error occurs so it gets logged internally without leaking details to the client:

```go
result, err := db.Query(...)
if err != nil {
    return core.Internal("user query failed", err)
    // Response: 500 Internal Server Error
    // The original error is logged internally
}
```

## Propagating errors across layers

Define domain errors in the service layer and propagate them from handlers:

```go
// users/errors.go
var ErrUserNotFound = core.NotFound("user not found")
var ErrEmailTaken   = core.Conflict("email in use")

// users/service.go
func (s *UserService) GetByID(ctx context.Context, id string) (*User, error) {
    user, err := s.repo.FindByID(ctx, id)
    if err != nil {
        return nil, ErrUserNotFound
    }
    return user, nil
}

// users/controller.go
func (c *UserController) getByID(ctx *httpx.Ctx) error {
    user, err := c.service.GetByID(ctx.Context(), ctx.Params("id"))
    if err != nil {
        return err // KError bubbles up to the error handler
    }
    return ctx.OK(user)
}
```

## Error response format

| Constructor | Status | Code |
|---|---|---|
| `NotFound(msg)` | 404 | `NOT_FOUND` |
| `Unauthorized(msg)` | 401 | `UNAUTHORIZED` |
| `Forbidden(msg)` | 403 | `FORBIDDEN` |
| `Conflict(msg)` | 409 | `CONFLICT` |
| `BadRequest(msg)` | 400 | `BAD_REQUEST` |
| `Internal(msg, cause)` | 500 | `INTERNAL` |
