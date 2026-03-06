---
title: Paginación
description: PageQuery, Page[T] y helpers de paginación offset sin cursor.
---

ss-keel-core provee helpers integrados para paginación basada en offset. `ParsePagination` lee parámetros query del request y `Page[T]` es el envelope estándar de respuesta paginada.

## ParsePagination

```go
func (c *Ctx) ParsePagination() PageQuery
```

Lee `?page` y `?limit` desde query string y devuelve un `PageQuery`.

| Parámetro | Por defecto | Máximo |
|---|---|---|
| `page` | `1` | — |
| `limit` | `20` | `100` |

```go
func (c *UserController) list(ctx *core.Ctx) error {
    q := ctx.ParsePagination()
    // q.Page  = 1 (o ?page=N)
    // q.Limit = 20 (o ?limit=N, max 100)

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

Pasa `PageQuery` a tu repositorio/servicio para ejecutar la consulta:

```go
// En tu repositorio
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

`TotalPages` se calcula automáticamente con `ceil(total / limit)`.

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

## Ejemplo de respuesta JSON

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

## Interfaz Repository

Por convención, la interfaz `Repository[T, ID]` usa `PageQuery` y `Page[T]`:

```go
type Repository[T any, ID any] interface {
    FindAll(ctx context.Context, q PageQuery) (Page[T], error)
    // ...
}
```

Ver [Interfaces — Repository](/reference/interfaces#repository) para la interfaz completa.
