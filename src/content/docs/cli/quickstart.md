---
title: Inicio Rápido
description: Crea, ejecuta y expande tu primer proyecto con Keel CLI en pocos pasos.
---

## 1) Instala el CLI

```bash
go install github.com/slice-soft/keel@latest
keel --version
```

## 2) Crea un proyecto

Modo interactivo (recomendado):

```bash
keel new my-api
```

Modo automático:

```bash
keel new my-api --yes
```

:::caution[Importante sobre `--yes`]
En modo automático el CLI usa un módulo placeholder (`github.com/my-github-user/<app>`).  
Revisa y corrige `go.mod` antes de continuar.
:::

## 3) Entra al proyecto y levántalo

```bash
cd my-api
keel run dev
```

Por defecto, `keel run dev` ejecuta el script `dev` definido en `keel.toml` (normalmente con Air).

## 4) Genera tu primer módulo

```bash
keel generate module users --with-repository
```

Esto crea y cablea automáticamente:
- `internal/modules/users/users_module.go`
- `internal/modules/users/users_service.go`
- `internal/modules/users/users_controller.go`
- `internal/modules/users/users_repository.go`
- registro de módulo en `cmd/main.go`

## 5) Ejecuta scripts de proyecto

```bash
keel run test
keel run build
```

## 6) Endpoints base disponibles

Con la app corriendo en desarrollo:
- `GET /health`
- `GET /docs`
- `GET /docs/openapi.json`

> `/docs` se desactiva en `production` según la configuración de `ss-keel-core`.

## Próximo paso

- [Comando `generate`](/cli/generate/)
- [Comando `run`](/cli/run/)
- [Guía de módulos en core](/guides/modules/)
