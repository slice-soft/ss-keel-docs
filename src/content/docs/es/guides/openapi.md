---
title: OpenAPI y Swagger UI
description: Genera automáticamente documentación OpenAPI 3.0 a partir de tus rutas.
---

ss-keel-core genera automáticamente una especificación OpenAPI 3.0 desde tus definiciones de rutas. También expone Swagger UI.

## Habilitar docs

Las docs se habilitan automáticamente en entornos que no son producción. Define `Env` diferente de `"production"`:

```go
app := core.New(core.KConfig{
    Env: "development", // docs habilitadas
    Docs: core.DocsConfig{
        Title:       "My API",
        Version:     "1.0.0",
        Description: "Descripción completa de la API",
    },
})
```

| Endpoint | Descripción |
|---|---|
| `GET /docs` | Swagger UI |
| `GET /docs/openapi.json` | OpenAPI 3.0 JSON |

## Configurar docs

```go
Docs: core.DocsConfig{
    Path:        "/docs",      // personaliza la ruta base
    Title:       "My API",
    Version:     "2.0.0",
    Description: "Gestiona usuarios y facturación",

    Contact: &core.DocsContact{
        Name:  "Soporte API",
        Email: "api@example.com",
        URL:   "https://example.com/support",
    },
    License: &core.DocsLicense{
        Name: "MIT",
        URL:  "https://opensource.org/licenses/MIT",
    },

    // Formato: "url - descripción"
    Servers: []string{
        "https://api.example.com - Producción",
        "https://staging.api.example.com - Staging",
    },

    Tags: []core.DocsTag{
        {Name: "users",  Description: "Gestión de usuarios"},
        {Name: "auth",   Description: "Autenticación"},
        {Name: "billing",Description: "Pagos y suscripciones"},
    },
},
```

## Documentar rutas

Usa métodos del route builder para enriquecer la especificación:

```go
core.POST("/users", createUser).
    Tag("users").
    Describe("Crear usuario", "Crea una cuenta de usuario y retorna el recurso creado").
    WithBody(core.WithBody[CreateUserDTO]()).
    WithResponse(core.WithResponse[User](201))
```

### Tags

`.Tag(name)` agrupa la ruta bajo una etiqueta en Swagger UI:

```go
core.GET("/users", listUsers).Tag("users")
```

### Summary y Description

```go
core.GET("/users", listUsers).
    Describe("Listar usuarios")                          // solo summary
    Describe("Listar usuarios", "Descripción completa") // summary + description
```

### Request Body

```go
core.WithBody[CreateUserDTO]()
```

El tipo `CreateUserDTO` se inspecciona en runtime para generar el JSON Schema del body.

### Response

```go
core.WithResponse[User](201)
core.WithResponse[core.Page[User]](200)
```

### Parámetros de query

```go
core.GET("/users", listUsers).
    WithQueryParam("search",  "string",  false, "Filtrar por nombre").
    WithQueryParam("role",    "string",  false, "Filtrar por rol").
    WithQueryParam("page",    "integer", false, "Número de página").
    WithQueryParam("limit",   "integer", false, "Elementos por página")
```

### Seguridad

```go
core.DELETE("/users/:id", deleteUser).
    WithSecured("bearerAuth")
```

### Deprecación

```go
core.GET("/v1/users", listUsersV1).
    WithDeprecated()
```

## Helpers genéricos

`WithBody[T]()` y `WithResponse[T](statusCode)` son helpers genéricos que transportan el tipo Go para reflexión de esquema:

```go
// Estas dos formas son equivalentes
core.WithBody[CreateUserDTO]()
// es lo mismo que
&core.BodyMeta{Type: CreateUserDTO{}, Required: true}
```

Se recomienda la forma genérica por ser type-safe.

## Deshabilitar docs en producción

Las docs se deshabilitan automáticamente cuando `Env: "production"`. No requiere configuración adicional.

```go
core.KConfig{
    Env: "production", // /docs y /docs/openapi.json no se montan
}
```
