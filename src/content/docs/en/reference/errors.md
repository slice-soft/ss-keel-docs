---
title: Errors
description: KError type and built-in constructors for structured HTTP error responses.
---

`KError` is the framework's structured error type. Returning a `*KError` from a handler produces a consistent JSON response with the appropriate HTTP status code.

## KError type

```go
type KError struct {
    Code       string
    StatusCode int
    Message    string
    Cause      error // optional: logged internally, never exposed in responses
}
```

`KError` implements the `error` interface:

```go
func (e *KError) Error() string  // returns e.Message
func (e *KError) Unwrap() error  // returns e.Cause
```

## Error response format

When a handler returns `*KError`, the framework serializes it as JSON:

```json
{
  "code": "NOT_FOUND",
  "message": "user not found",
  "statusCode": 404
}
```

The `Cause` field is **never** included in the response: it is only logged internally.

## Built-in constructors

### `NotFound`

```go
func NotFound(msg string) *KError
```

```go
return core.NotFound("user not found")
// → 404 { "code": "NOT_FOUND", "message": "user not found" }
```

### `Unauthorized`

```go
func Unauthorized(msg string) *KError
```

```go
return core.Unauthorized("token expired")
// → 401 { "code": "UNAUTHORIZED", "message": "token expired" }
```

### `Forbidden`

```go
func Forbidden(msg string) *KError
```

```go
return core.Forbidden("insufficient permissions")
// → 403 { "code": "FORBIDDEN", "message": "insufficient permissions" }
```

### `Conflict`

```go
func Conflict(msg string) *KError
```

```go
return core.Conflict("email in use")
// → 409 { "code": "CONFLICT", "message": "email in use" }
```

### `BadRequest`

```go
func BadRequest(msg string) *KError
```

```go
return core.BadRequest("invalid date format")
// → 400 { "code": "BAD_REQUEST", "message": "invalid date format" }
```

### `Internal`

```go
func Internal(msg string, cause error) *KError
```

```go
return core.Internal("user save failed", err)
// → 500 { "code": "INTERNAL", "message": "user save failed" }
// The original error is logged internally.
```

## Quick reference

| Constructor | Status | Code |
|---|---|---|
| `NotFound(msg)` | 404 | `NOT_FOUND` |
| `Unauthorized(msg)` | 401 | `UNAUTHORIZED` |
| `Forbidden(msg)` | 403 | `FORBIDDEN` |
| `Conflict(msg)` | 409 | `CONFLICT` |
| `BadRequest(msg)` | 400 | `BAD_REQUEST` |
| `Internal(msg, cause)` | 500 | `INTERNAL` |

## Propagation

`KError` values propagate through Go's error chain. The framework uses `errors.As` to detect them at any level, so you can wrap them:

```go
if err != nil {
    return fmt.Errorf("creating user: %w", core.NotFound("user not found"))
}
```

## Validation errors

`ParseBody` returns a special `422` response with per-field errors (distinct from `KError`):

```json
{
  "errors": [
    { "field": "email", "message": "must be a valid email" },
    { "field": "name",  "message": "this field is required" }
  ]
}
```

See [Validation](/reference/validation) for more detail.
