---
title: Pagination
description: PageQuery, Page[T] and offset-based pagination helpers.
---

ss-keel-core provides built-in helpers for offset-based pagination. `ParsePagination` reads query parameters from the request and `Page[T]` is the standard paginated response envelope.

## ParsePagination

```go
func (c *Ctx) ParsePagination() PageQuery
```

Reads `?page` and `?limit` from the query string and returns a `PageQuery`.

| Parameter | Default | Maximum |
|---|---|---|
| `page` | `1` | — |
| `limit` | `20` | `100` |

```go
func (c *UserController) list(ctx *core.Ctx) error {
    q := ctx.ParsePagination()
    // q.Page  = 1 (or ?page=N)
    // q.Limit = 20 (or ?limit=N, max 100)

    users, total, err := c.service.List(ctx.Context(), q)
    if err != nil {
        return err
    }

    return ctx.OK(core.NewPage(users, total, q.Page, q.Limit))
}
```

## PageQuery

```go
type PageQuery struct {
    Page  int
    Limit int
}
```

Pass `PageQuery` to your repository/service to execute the query:

```go
// In your repository
func (r *UserRepo) FindAll(ctx context.Context, q core.PageQuery) (core.Page[User], error) {
    offset := (q.Page - 1) * q.Limit

    rows, err := r.db.QueryContext(ctx,
        "SELECT * FROM users LIMIT $1 OFFSET $2",
        q.Limit, offset,
    )
    // ...
    total := countUsers(ctx)
    return core.NewPage(users, total, q.Page, q.Limit), nil
}
```

## Page[T]

```go
type Page[T any] struct {
    Data       []T `json:"data"`
    Total      int `json:"total"`
    Page       int `json:"page"`
    Limit      int `json:"limit"`
    TotalPages int `json:"total_pages"`
}
```

### NewPage

```go
func NewPage[T any](data []T, total, page, limit int) Page[T]
```

`TotalPages` is calculated automatically with `ceil(total / limit)`.

```go
page := core.NewPage(users, 142, 2, 20)
// {
//   "data": [...],
//   "total": 142,
//   "page": 2,
//   "limit": 20,
//   "total_pages": 8
// }
```

## Example JSON response

```
GET /users?page=2&limit=10
```

```json
{
  "data": [
    { "id": "1", "name": "Alice" },
    { "id": "2", "name": "Bob" }
  ],
  "total": 42,
  "page": 2,
  "limit": 10,
  "total_pages": 5
}
```

## Repository interface

By convention, the `Repository[T, ID]` interface uses `PageQuery` and `Page[T]`:

```go
type Repository[T any, ID any] interface {
    FindAll(ctx context.Context, q PageQuery) (Page[T], error)
    // ...
}
```

See [Interfaces — Repository](/reference/interfaces#repository) for the full interface.
