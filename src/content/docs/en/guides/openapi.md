---
title: OpenAPI & Swagger UI
description: Automatically generate OpenAPI 3.0 documentation from your routes.
---

ss-keel-core automatically generates an OpenAPI 3.0 spec from your route definitions. It also exposes Swagger UI.

## Enabling docs

Docs are enabled automatically in non-production environments. Set `Env` to anything other than `"production"`:

```go
app := core.New(core.KConfig{
    Env: "development", // docs enabled
    Docs: core.DocsConfig{
        Title:       "My API",
        Version:     "1.0.0",
        Description: "Full API description",
    },
})
```

| Endpoint | Description |
|---|---|
| `GET /docs` | Swagger UI |
| `GET /docs/openapi.json` | OpenAPI 3.0 JSON |

## Configuring docs

```go
Docs: core.DocsConfig{
    Path:        "/docs",      // customize the base path
    Title:       "My API",
    Version:     "2.0.0",
    Description: "Manage users and billing",

    Contact: &core.DocsContact{
        Name:  "API Support",
        Email: "api@example.com",
        URL:   "https://example.com/support",
    },
    License: &core.DocsLicense{
        Name: "MIT",
        URL:  "https://opensource.org/licenses/MIT",
    },

    // Format: "url - description"
    Servers: []string{
        "https://api.example.com - Production",
        "https://staging.api.example.com - Staging",
    },

    Tags: []core.DocsTag{
        {Name: "users",   Description: "User management"},
        {Name: "auth",    Description: "Authentication"},
        {Name: "billing", Description: "Payments and subscriptions"},
    },
},
```

## Documenting routes

Use route builder methods to enrich the spec:

```go
httpx.POST("/users", createUser).
    Tag("users").
    Describe("Create user", "Creates a user account and returns the created resource").
    WithBody(httpx.WithBody[CreateUserDTO]()).
    WithResponse(httpx.WithResponse[User](201))
```

### Tags

`.Tag(name)` groups the route under a tag in Swagger UI:

```go
httpx.GET("/users", listUsers).Tag("users")
```

### Summary and Description

```go
httpx.GET("/users", listUsers).
    Describe("List users")                          // summary only
    Describe("List users", "Full description")      // summary + description
```

### Request Body

```go
httpx.WithBody[CreateUserDTO]()
```

The `CreateUserDTO` type is inspected at runtime to generate the body's JSON Schema.

### Response

```go
httpx.WithResponse[User](201)
httpx.WithResponse[httpx.Page[User]](200)
```

### Query parameters

```go
httpx.GET("/users", listUsers).
    WithQueryParam("search",  "string",  false, "Filter by name").
    WithQueryParam("role",    "string",  false, "Filter by role").
    WithQueryParam("page",    "integer", false, "Page number").
    WithQueryParam("limit",   "integer", false, "Items per page")
```

### Security

```go
httpx.DELETE("/users/:id", deleteUser).
    WithSecured("bearerAuth")
```

### Deprecation

```go
httpx.GET("/v1/users", listUsersV1).
    WithDeprecated()
```

## Generic helpers

`WithBody[T]()` and `WithResponse[T](statusCode)` are generic helpers that carry the Go type for schema reflection:

```go
// These two forms are equivalent
httpx.WithBody[CreateUserDTO]()
// is the same as
&core.BodyMeta{Type: CreateUserDTO{}, Required: true}
```

The generic form is recommended for being type-safe.

## Disabling docs in production

Docs are automatically disabled when `Env: "production"`. No additional configuration required.

```go
core.KConfig{
    Env: "production", // /docs and /docs/openapi.json are not mounted
}
```
