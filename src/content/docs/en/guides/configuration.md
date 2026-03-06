---
title: Configuration
description: Configure your ss-keel-core application using environment variables and KConfig.
---

ss-keel-core is configured via the `KConfig` struct passed to `core.New()`. Values come from environment variables, but **don't scatter `os.Getenv` calls across your modules**: load everything once in `config/config.go` and propagate that struct.

## Config Pattern

Create `config/config.go` as the single point for reading environment variables. Each module and service receives a `config.Config` value; there should be no `os.Getenv` outside that file.

```go
// config/config.go  ← the only place that reads os.Getenv
package config

import (
    "os"
    "strconv"
)

type Config struct {
    // App
    ServiceName string
    Port        int
    Env         string

    // Database (ss-keel-gorm / ss-keel-mongo)
    DatabaseURL string

    // Cache (ss-keel-redis)
    RedisURL string

    // Auth (ss-keel-jwt / ss-keel-oauth)
    JWTSecret string

    // Email (ss-keel-mail)
    ResendAPIKey string
}

func Load() Config {
    port, _ := strconv.Atoi(getEnv("PORT", "3000"))

    return Config{
        ServiceName:  getEnv("SERVICE_NAME", "my-api"),
        Port:         port,
        Env:          getEnv("ENV", "development"),
        DatabaseURL:  mustGetEnv("DATABASE_URL"),
        RedisURL:     getEnv("REDIS_URL", "redis://localhost:6379"),
        JWTSecret:    mustGetEnv("JWT_SECRET"),
        ResendAPIKey: os.Getenv("RESEND_API_KEY"),
    }
}

// getEnv returns the variable or a default value.
func getEnv(key, fallback string) string {
    if v := os.Getenv(key); v != "" {
        return v
    }
    return fallback
}

// mustGetEnv panics at startup if a required variable is missing.
func mustGetEnv(key string) string {
    v := os.Getenv(key)
    if v == "" {
        panic("required environment variable not set: " + key)
    }
    return v
}
```

## Connecting config.Load() with the App

```go
// main.go
package main

import (
    "myapp/config"
    "myapp/auth"
    "myapp/users"
    "github.com/slice-soft/ss-keel-core/core"
)

func main() {
    cfg := config.Load() // ← called once

    app := core.New(core.KConfig{
        ServiceName: cfg.ServiceName,
        Port:        cfg.Port,
        Env:         cfg.Env,
    })

    // modules receive cfg; they don't call os.Getenv
    app.Use(auth.New(cfg))
    app.Use(users.New(cfg))

    app.Listen()
}
```

## Module pattern with Config

```go
// users/module.go
package users

import (
    "myapp/config"
    "github.com/slice-soft/ss-keel-core/core"
)

type Module struct {
    cfg config.Config
}

func New(cfg config.Config) *Module {
    return &Module{cfg: cfg}
}

func (m *Module) Register(app *core.App) {
    // uses cfg fields directly, no os.Getenv
    repo    := NewRepository(m.cfg.DatabaseURL)
    service := NewService(repo, app.Logger())
    app.RegisterController(NewController(service))
}
```

See the [Logger guide](/guides/logger) for how to inject and use `app.Logger()` in services.

## Adding fields for new addons

When you add an addon, extend `Config` with its required fields:

```go
type Config struct {
    // existing fields...

    // ss-keel-storage
    S3Bucket    string
    S3Region    string
    AWSKeyID    string
    AWSSecret   string
}

func Load() Config {
    return Config{
        // existing fields...

        S3Bucket:  mustGetEnv("S3_BUCKET"),
        S3Region:  getEnv("AWS_REGION", "us-east-1"),
        AWSKeyID:  mustGetEnv("AWS_ACCESS_KEY_ID"),
        AWSSecret: mustGetEnv("AWS_SECRET_ACCESS_KEY"),
    }
}
```

## Using a .env file (development)

For local development, load a `.env` file with [godotenv](https://github.com/joho/godotenv):

```bash
go get github.com/joho/godotenv
```

```go
// main.go
import "github.com/joho/godotenv"

func main() {
    // Load .env only in development; does not fail if the file doesn't exist
    _ = godotenv.Load()

    cfg := config.Load()
    // ...
}
```

`.env` file:

```ini
SERVICE_NAME=my-api
PORT=3000
ENV=development
DATABASE_URL=postgres://user:pass@localhost:5432/mydb
REDIS_URL=redis://localhost:6379
JWT_SECRET=super-secret-dev-key
```

Add `.env` to `.gitignore` and version a `.env.example`:

```ini
# .env.example
SERVICE_NAME=my-api
PORT=3000
ENV=development
DATABASE_URL=postgres://user:pass@localhost:5432/mydb
REDIS_URL=redis://localhost:6379
JWT_SECRET=
```

## Environment modes

The `Env` field controls framework behavior:

| Value | OpenAPI Docs | Log format | Debug logs |
|---|---|---|---|
| `development` | Enabled | Text | Yes |
| `staging` | Enabled | JSON | No |
| `production` | Disabled | JSON | No |

```go
// cfg comes from config.Load()
core.KConfig{
    Env: cfg.Env, // "development" | "staging" | "production"
}
```

## Full KConfig reference

```go
type KConfig struct {
    ServiceName   string     // visible in /health and OpenAPI info
    Port          int        // HTTP port, default: 3000
    Env           string     // controls docs visibility and log format
    DisableHealth bool       // disables GET /health

    Docs DocsConfig
}

type DocsConfig struct {
    Path        string       // default: "/docs"
    Title       string
    Version     string       // default: "1.0.0"
    Description string
    Contact     *DocsContact
    License     *DocsLicense
    Servers     []string     // "https://api.example.com - Description"
    Tags        []DocsTag
}
```

## Docker / container environments

When running in Docker, pass variables with `docker run` or `docker-compose`:

```yaml
# docker-compose.yml
services:
  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      SERVICE_NAME: my-api
      PORT: 3000
      ENV: production
      DATABASE_URL: postgres://user:pass@db:5432/mydb
      JWT_SECRET: ${JWT_SECRET}
```

```dockerfile
# Dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o server ./cmd/server

FROM alpine:latest
COPY --from=builder /app/server /server
EXPOSE 3000
CMD ["/server"]
```
