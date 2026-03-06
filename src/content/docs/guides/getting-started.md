---
title: Getting Started
description: Crea tu primera API con Keel CLI y ss-keel-core.
---

**Keel** combina:

- **`ss-keel-core`**: framework HTTP en Go sobre Fiber, con OpenAPI, logging, validación y lifecycle.
- **`keel` CLI**: scaffolding, generación de componentes y automatización de scripts.

## Requisitos

- Go `1.25+`
- Git
- (Opcional) Air para hot reload

## Camino recomendado: con CLI

```bash
go install github.com/slice-soft/keel@latest
keel new myapp
cd myapp
```

Ejecuta en desarrollo:

```bash
keel run dev
```

Genera tu primer módulo:

```bash
keel generate module users --with-repository
```

### Estructura base generada

Un proyecto típico generado por CLI queda así:

```text
myapp/
├── cmd/
│   └── main.go
├── internal/
│   └── modules/
│       └── starter/           # opcional
├── go.mod
├── keel.toml
├── .env                       # opcional
└── .air.toml                  # opcional
```

### Endpoints iniciales

Con el servidor activo:

| Endpoint | Descripción |
|---|---|
| `GET /hello` | Ruta starter (si incluiste starter module) |
| `GET /health` | Health check |
| `GET /docs` | Swagger UI |
| `GET /docs/openapi.json` | OpenAPI 3.0 spec |

> `/docs` y `/docs/openapi.json` se montan cuando `Env != "production"`.

## Camino manual: solo `ss-keel-core`

Si prefieres no usar CLI, puedes arrancar manualmente:

```bash
mkdir myapp && cd myapp
go mod init github.com/your-org/myapp
go get github.com/slice-soft/ss-keel-core@latest
```

`cmd/main.go` mínimo:

```go
package main

import (
	"github.com/slice-soft/ss-keel-core/config"
	"github.com/slice-soft/ss-keel-core/core"
	"github.com/slice-soft/ss-keel-core/logger"
)

func main() {
	appLogger := logger.NewLogger(config.GetEnvOrDefault("APP_ENV", "development") == "production")

	app := core.New(core.KConfig{
		Port:        config.GetEnvIntOrDefault("PORT", 7331),
		ServiceName: config.GetEnvOrDefault("SERVICE_NAME", "myapp"),
		Env:         config.GetEnvOrDefault("APP_ENV", "development"),
		Docs: core.DocsConfig{
			Title:   "myapp API",
			Version: "1.0.0",
		},
	})

	if err := app.Listen(); err != nil {
		appLogger.Error("failed to start app: %v", err)
	}
}
```

Ejecuta:

```bash
go run ./cmd/main.go
```

## Qué sigue

- [Instalación de CLI](/cli/installation) — métodos de instalación (`go install`, `brew`, releases)
- [Comando generate](/cli/generate) — generación de módulos y wiring automático
- [Configuration](/guides/configuration) — env vars y configuración de runtime
- [Controllers](/guides/controllers) — diseño de rutas y handlers
- [Modules](/guides/modules) — organización por dominio
- [Testing](/guides/testing) — pruebas unitarias e integración
