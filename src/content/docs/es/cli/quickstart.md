---
title: Inicio Rápido
description: Crea, ejecuta y expande tu primer proyecto con Keel CLI usando el flujo recomendado.
---

## 1) Instala el CLI

```bash
go install github.com/slice-soft/keel@latest
keel --version
```

## 2) Crea un proyecto nuevo

Modo interactivo (recomendado):

```bash
keel new my-api
```

Modo automático (sin prompts):

```bash
keel new my-api --yes
```

:::caution[Si usas `--yes`]
El módulo se genera con placeholder (`github.com/my-github-user/<app>`). Revisa y corrige `go.mod` antes de publicar el repositorio.
:::

## 3) Entra al proyecto y ejecuta desarrollo

```bash
cd my-api
keel run dev
```

En proyectos nuevos, `keel.toml` suele incluir:

```toml
[scripts]
dev   = "air -c .air.toml"
build = "go build -o bin/my-api ./cmd/main.go"
test  = "go test ./..."
lint  = "golangci-lint run"
```

## 4) Genera tu primer módulo

```bash
keel generate module users
```

Salida esperada (paths principales):

- `internal/modules/users/users_module.go`
- `internal/modules/users/users_service.go`
- `internal/modules/users/users_controller.go`
- actualización de `cmd/main.go` con `app.Use(users.NewModule(appLogger))`

Para generar también un repositorio, pasa `--gorm` o `--mongo`:

```bash
keel generate module users --gorm
```

## 5) Verifica endpoints base

Con la app corriendo en desarrollo:

- `GET /health`
- `GET /docs`
- `GET /docs/openapi.json`
- `GET /hello` (si mantuviste `starter`)

> `ss-keel-core` no monta docs cuando `Env == "production"`.

## 6) Ejecuta más scripts del proyecto

```bash
keel run test
keel run build
```

## Flujo alterno: proyecto existente

Si ya tienes un proyecto Go y quieres adoptar `keel run`:

```bash
cd proyecto-existente
keel init
keel run test
```

`keel init` crea `keel.toml` y, según respuesta, también `.air.toml`.

## Siguientes pasos

- [Comando `new`](/cli/new/)
- [Comando `init`](/cli/init/)
- [Comando `generate`](/cli/generate/)
- [Comando `add`](/cli/add/)
- [Comando `run`](/cli/run/)
