---
title: OpenAPI & Swagger UI
description: Auto-generate OpenAPI 3.0 documentation from your routes.
---

ss-keel-core generates an OpenAPI 3.0 specification automatically from your route definitions. A Swagger UI is served alongside it.

## Enabling Docs

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
| `GET /docs/openapi.json` | Raw OpenAPI 3.0 JSON |

## Configuring Docs

```go
Docs: core.DocsConfig{
    Path:        "/docs",      // customize the base path
    Title:       "My API",
    Version:     "2.0.0",
    Description: "Manages users and billing",

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
        {Name: "users",  Description: "User management"},
        {Name: "auth",   Description: "Authentication"},
        {Name: "billing",Description: "Payments and subscriptions"},
    },
},
```

## Documenting Routes

Use route builder methods to enrich the generated spec:

```go
core.POST("/users", createUser).
    Tag("users").
    Describe("Create user", "Creates a new user account and returns the created resource").
    WithBody(core.WithBody[CreateUserDTO]()).
    WithResponse(core.WithResponse[User](201))
```

### Tags

`.Tag(name)` groups the route under a tag in the Swagger UI:

```go
core.GET("/users", listUsers).Tag("users")
```

### Summary & Description

```go
core.GET("/users", listUsers).
    Describe("List users")                          // summary only
    Describe("List users", "Full description here") // summary + description
```

### Request Body

```go
core.WithBody[CreateUserDTO]()
```

The `CreateUserDTO` type is reflected at runtime to generate the JSON Schema for the request body.

### Response

```go
core.WithResponse[User](201)
core.WithResponse[core.Page[User]](200)
```

### Query Parameters

```go
core.GET("/users", listUsers).
    WithQueryParam("search",  "string",  false, "Filter by name").
    WithQueryParam("role",    "string",  false, "Filter by role").
    WithQueryParam("page",    "integer", false, "Page number").
    WithQueryParam("limit",   "integer", false, "Items per page")
```

### Security

```go
core.DELETE("/users/:id", deleteUser).
    WithSecured("bearerAuth")
```

### Deprecation

```go
core.GET("/v1/users", listUsersV1).
    WithDeprecated()
```

## Generic Helpers

`WithBody[T]()` and `WithResponse[T](statusCode)` are generic helpers that carry the Go type for schema reflection:

```go
// These are equivalent
core.WithBody[CreateUserDTO]()
// is the same as
&core.BodyMeta{Type: CreateUserDTO{}, Required: true}
```

Using the generic form is preferred as it's type-safe.

## Disabling Docs in Production

Docs are automatically disabled when `Env: "production"`. No configuration needed.

```go
core.KConfig{
    Env: "production", // /docs and /docs/openapi.json are not mounted
}
```
