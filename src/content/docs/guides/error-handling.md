---
title: Error Handling
description: Return structured, consistent error responses using KError.
---

ss-keel-core provides a built-in error type `KError` that maps directly to HTTP status codes. Any `*KError` returned from a handler is automatically serialized to a JSON error response.

## KError

`KError` carries a status code, a machine-readable code string, and a human-readable message.

```go
type KError struct {
    Code       string
    StatusCode int
    Message    string
    Cause      error // optional, not exposed in responses
}
```

## Built-in Constructors

```go
core.NotFound("user not found")         // 404
core.Unauthorized("token expired")      // 401
core.Forbidden("insufficient permissions") // 403
core.Conflict("email already exists")   // 409
core.BadRequest("invalid input")        // 400
core.Internal("db failed", err)         // 500 (cause logged, not exposed)
```

## Returning Errors from Handlers

Return a `*KError` directly from your handler:

```go
func (c *UserController) getByID(ctx *core.Ctx) error {
    id := ctx.Params("id")

    user, err := c.service.GetByID(ctx.Context(), id)
    if err != nil {
        return core.NotFound("user not found")
    }

    return ctx.OK(user)
}
```

The framework's error handler detects `*KError` via `errors.As` and returns:

```json
{
  "code": "NOT_FOUND",
  "message": "user not found",
  "statusCode": 404
}
```

## Validation Errors

`ParseBody` automatically returns a `422 Unprocessable Entity` with field-level errors when validation fails:

```json
{
  "errors": [
    { "field": "email", "message": "must be a valid email" },
    { "field": "name",  "message": "this field is required" }
  ]
}
```

You don't need to handle this manually — returning the error from `ParseBody` is enough:

```go
func (c *UserController) create(ctx *core.Ctx) error {
    var dto CreateUserDTO
    if err := ctx.ParseBody(&dto); err != nil {
        return err // 400 or 422 automatically
    }
    ...
}
```

## Wrapping Errors

Use `core.Internal` when an unexpected error occurs so the cause is logged but not leaked to the client:

```go
result, err := db.Query(...)
if err != nil {
    return core.Internal("failed to query users", err)
    // Response: 500 Internal Server Error
    // The original error is logged internally
}
```

## Propagating Errors Through Layers

Define domain-level errors in your service layer and return them from handlers:

```go
// users/errors.go
var ErrUserNotFound = core.NotFound("user not found")
var ErrEmailTaken   = core.Conflict("email already in use")

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
        return err // KError propagates up to the error handler
    }
    return ctx.OK(user)
}
```

## Error Response Format

| Constructor | Status | Code |
|---|---|---|
| `NotFound(msg)` | 404 | `NOT_FOUND` |
| `Unauthorized(msg)` | 401 | `UNAUTHORIZED` |
| `Forbidden(msg)` | 403 | `FORBIDDEN` |
| `Conflict(msg)` | 409 | `CONFLICT` |
| `BadRequest(msg)` | 400 | `BAD_REQUEST` |
| `Internal(msg, cause)` | 500 | `INTERNAL` |
