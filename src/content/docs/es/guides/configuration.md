---
title: Configuración
description: Configura tu aplicación ss-keel-core usando variables de entorno y KConfig.
---

ss-keel-core se configura mediante la estructura `KConfig` que se pasa a `core.New()`. Los valores vienen de variables de entorno, pero **no llames `os.Getenv` disperso por tus módulos**: carga todo una sola vez en `config/config.go` y propaga esa estructura.

## Patrón de Config

Crea `config/config.go` como punto único para leer variables de entorno. Cada módulo y servicio recibe un valor `config.Config`; no debe haber `os.Getenv` fuera de ese archivo.

```go
// config/config.go  ← único lugar que lee os.Getenv
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

    // Base de datos (ss-keel-gorm / ss-keel-mongo)
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

// getEnv retorna la variable o un valor por defecto.
func getEnv(key, fallback string) string {
    if v := os.Getenv(key); v != "" {
        return v
    }
    return fallback
}

// mustGetEnv hace panic al inicio si falta una variable obligatoria.
func mustGetEnv(key string) string {
    v := os.Getenv(key)
    if v == "" {
        panic("required environment variable not set: " + key)
    }
    return v
}
```

## Conectar config.Load() con la App

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
    cfg := config.Load() // ← se llama una sola vez

    app := core.New(core.KConfig{
        ServiceName: cfg.ServiceName,
        Port:        cfg.Port,
        Env:         cfg.Env,
    })

    // los módulos reciben cfg; no llaman os.Getenv
    app.Use(auth.New(cfg))
    app.Use(users.New(cfg))

    app.Listen()
}
```

## Patrón de módulo con Config

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
    // usa campos de cfg directamente, sin os.Getenv
    repo    := NewRepository(m.cfg.DatabaseURL)
    service := NewService(repo, app.Logger())
    app.RegisterController(NewController(service))
}
```

Consulta la [guía de Logger](/es/guides/logger) para ver cómo inyectar y usar `app.Logger()` en servicios.

## Agregar campos para nuevos addons

Cuando añadas un addon, extiende `Config` con sus campos requeridos:

```go
type Config struct {
    // campos existentes...

    // ss-keel-storage
    S3Bucket    string
    S3Region    string
    AWSKeyID    string
    AWSSecret   string
}

func Load() Config {
    return Config{
        // campos existentes...

        S3Bucket:  mustGetEnv("S3_BUCKET"),
        S3Region:  getEnv("AWS_REGION", "us-east-1"),
        AWSKeyID:  mustGetEnv("AWS_ACCESS_KEY_ID"),
        AWSSecret: mustGetEnv("AWS_SECRET_ACCESS_KEY"),
    }
}
```

## Uso de archivo .env (desarrollo)

Para desarrollo local, carga un `.env` con [godotenv](https://github.com/joho/godotenv):

```bash
go get github.com/joho/godotenv
```

```go
// main.go
import "github.com/joho/godotenv"

func main() {
    // Carga .env solo en desarrollo; no falla si el archivo no existe
    _ = godotenv.Load()

    cfg := config.Load()
    // ...
}
```

Archivo `.env`:

```ini
SERVICE_NAME=my-api
PORT=3000
ENV=development
DATABASE_URL=postgres://user:pass@localhost:5432/mydb
REDIS_URL=redis://localhost:6379
JWT_SECRET=super-secret-dev-key
```

Agrega `.env` al `.gitignore` y versiona un `.env.example`:

```ini
# .env.example
SERVICE_NAME=my-api
PORT=3000
ENV=development
DATABASE_URL=postgres://user:pass@localhost:5432/mydb
REDIS_URL=redis://localhost:6379
JWT_SECRET=
```

## Modos de entorno

El campo `Env` controla comportamientos del framework:

| Valor | Docs OpenAPI | Formato de logs | Logs debug |
|---|---|---|---|
| `development` | Habilitado | Texto | Sí |
| `staging` | Habilitado | JSON | No |
| `production` | Deshabilitado | JSON | No |

```go
// cfg viene de config.Load()
core.KConfig{
    Env: cfg.Env, // "development" | "staging" | "production"
}
```

## Referencia completa de KConfig

```go
type KConfig struct {
    ServiceName   string     // visible en /health y OpenAPI info
    Port          int        // puerto HTTP, default: 3000
    Env           string     // controla visibilidad de docs y formato de log
    DisableHealth bool       // desactiva GET /health

    Docs DocsConfig
}

type DocsConfig struct {
    Path        string       // default: "/docs"
    Title       string
    Version     string       // default: "1.0.0"
    Description string
    Contact     *DocsContact
    License     *DocsLicense
    Servers     []string     // "https://api.example.com - Descripción"
    Tags        []DocsTag
}
```

## Docker / entornos de contenedor

Cuando ejecutes en Docker, pasa variables con `docker run` o `docker-compose`:

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
