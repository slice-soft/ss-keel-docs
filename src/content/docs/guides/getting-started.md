---
title: Getting Started
description: Install ss-keel-core and build your first API in minutes.
---

**ss-keel-core** is a Go web framework built on top of [Fiber v2](https://gofiber.io/). It provides a structured, opinionated foundation for building production-ready REST APIs with built-in OpenAPI docs, structured logging, validation, health checks, and graceful shutdown.

## Requirements

- Go 1.21 or later

## Installation

```bash
go get github.com/slice-soft/ss-keel-core
```

## Project Structure

A typical ss-keel-core project looks like this:

```
myapp/
├── main.go
├── config/
│   └── config.go   ← environment variables loaded here
├── users/
│   ├── module.go
│   ├── controller.go
│   └── service.go
└── auth/
    ├── module.go
    └── guard.go
```

## Your First App

### 1. Load configuration

Create `config/config.go` to centralise all environment variables:

```go
// config/config.go
package config

import (
    "os"
    "strconv"
)

type Config struct {
    ServiceName string
    Port        int
    Env         string
}

func Load() Config {
    port, _ := strconv.Atoi(getEnv("PORT", "3000"))

    return Config{
        ServiceName: getEnv("SERVICE_NAME", "my-api"),
        Port:        port,
        Env:         getEnv("ENV", "development"),
    }
}

func getEnv(key, fallback string) string {
    if v := os.Getenv(key); v != "" {
        return v
    }
    return fallback
}
```

### 2. Create the app

```go
// main.go
package main

import (
    "myapp/config"
    "github.com/slice-soft/ss-keel-core/core"
)

func main() {
    cfg := config.Load()

    app := core.New(core.KConfig{
        ServiceName: cfg.ServiceName,
        Port:        cfg.Port,
        Env:         cfg.Env,
        Docs: core.DocsConfig{
            Title:       "My API",
            Version:     "1.0.0",
            Description: "A simple REST API",
        },
    })

    app.Listen()
}
```

### 3. Add a route

Routes are registered through **Controllers**. A controller is any struct that implements `Routes() []Route`.

```go
type HelloController struct{}

func (c *HelloController) Routes() []core.Route {
    return []core.Route{
        core.GET("/hello", c.hello).
            Tag("hello").
            Describe("Say hello", "Returns a greeting message"),
    }
}

func (c *HelloController) hello(ctx *core.Ctx) error {
    return ctx.OK(map[string]string{"message": "Hello, World!"})
}
```

Register it in `main.go`:

```go
app.RegisterController(&HelloController{})
app.Listen()
```

### 4. Run it

```bash
go run main.go
# or with env vars
PORT=8080 ENV=development go run main.go
```

Your API is now running on `http://localhost:3000`.

Built-in endpoints available out of the box:

| Endpoint | Description |
|---|---|
| `GET /hello` | Your route |
| `GET /health` | Health check |
| `GET /docs` | Swagger UI |
| `GET /docs/openapi.json` | OpenAPI 3.0 spec |

> The `/docs` endpoint is only available when `Env` is not `"production"`.

## What's Next

- [Configuration](/guides/configuration) — env vars, `.env` files, Docker setup
- [Controllers](/guides/controllers) — structure routes and handlers
- [Modules](/guides/modules) — organize the app into reusable modules
- [Logger](/guides/logger) — structured logging across your application
- [Error Handling](/guides/error-handling) — return structured errors
- [Testing](/guides/testing) — write unit tests for your controllers
