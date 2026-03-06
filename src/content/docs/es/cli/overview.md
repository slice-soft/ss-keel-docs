---
title: Visión General del CLI
description: Panorama del CLI de Keel, comandos disponibles y su relación con ss-keel-core.
---

`keel` es el CLI oficial del ecosistema Keel para crear, inicializar y mantener proyectos Go estructurados.

Esta sección está validada contra el código real de `ss-keel-cli` y `ss-keel-core` (incluyendo tests y plantillas) con corte al **5 de marzo de 2026**.

## Fuentes de verdad

- `ss-keel-cli/cmd/*`: definición real de comandos, argumentos, aliases y flags.
- `ss-keel-cli/internal/generator/templates/*`: archivos y estructura exacta que genera el CLI.
- `ss-keel-cli/cmd/*_test.go`: casos de comportamiento esperado y errores.
- `ss-keel-core/core/*`: runtime HTTP resultante (`/health`, `/docs`, OpenAPI, lifecycle).

## Qué resuelve el CLI

- Creación de proyectos listos para trabajar (`keel new`)
- Adopción de Keel en proyectos existentes (`keel init`)
- Generación de componentes con wiring automático (`keel generate`)
- Ejecución de scripts del proyecto (`keel run`)
- Autocompletado para shell (`keel completion`)

## Comandos disponibles hoy

| Comando | Alias | Propósito |
|---|---|---|
| `keel new [project-name]` | `keel n` | Crea un proyecto nuevo desde plantillas oficiales |
| `keel init` | — | Genera `keel.toml` en un proyecto existente |
| `keel generate [type] [name]` | `keel g` | Genera módulos/componentes y ajusta `cmd/main.go` |
| `keel run [script]` | — | Ejecuta scripts de `[scripts]` en `keel.toml` |
| `keel completion ...` | — | Genera/instala autocompletado (`zsh`, `bash`, `fish`, `powershell`) |
| `keel --version` | `keel -v` | Muestra versión, commit, build date y plataforma |

:::caution[Importante]
El binario actual no expone subcomando `keel upgrade` en `--help`. Para actualizar, usa el método de instalación (`go install`, `brew` o release manual).
:::

## Flujo recomendado

```bash
# 1) Instalar CLI
go install github.com/slice-soft/keel@latest

# 2) Crear proyecto
keel new my-api
cd my-api

# 3) Ejecutar entorno dev
keel run dev

# 4) Generar primer módulo
keel generate module users --with-repository

# 5) Verificar comandos y versión
keel --help
keel --version
```

## Relación con `ss-keel-core`

El CLI genera código que usa directamente `ss-keel-core`:

- `core.New(core.KConfig{...})`
- `app.Use(...)`
- `app.RegisterController(...)`
- `app.Listen()`

Cuando ejecutas un proyecto generado, heredas el comportamiento del core:

- `GET /health` (si `DisableHealth` es `false`)
- `GET /docs` y `GET /docs/openapi.json` cuando `Env != "production"`
- manejo de errores HTTP estandarizado y shutdown graceful

## Siguientes pasos

- [Instalación](/cli/installation/)
- [Inicio Rápido](/cli/quickstart/)
- [Comando `new`](/cli/new/)
- [Comando `generate`](/cli/generate/)
- [Resolución de problemas](/cli/troubleshooting/)

:::note[Repositorio]
Código fuente del CLI: [github.com/slice-soft/keel](https://github.com/slice-soft/keel)
:::
