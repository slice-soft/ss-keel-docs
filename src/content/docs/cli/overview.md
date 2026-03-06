---
title: CLI Overview
description: Guía general del CLI de Keel para crear y mantener proyectos basados en ss-keel-core.
---

`keel` es el CLI oficial para acelerar el desarrollo con **ss-keel-core**.

Esta documentación está basada en el código real de:
- `ss-keel-cli` (comandos, flags, templates y tests)
- `ss-keel-core` (estructura y runtime de la app generada)

## Qué hace el CLI

- Crea proyectos listos para trabajar (`keel new`)
- Inicializa `keel.toml` en proyectos existentes (`keel init`)
- Genera componentes y wiring automático (`keel generate`)
- Ejecuta scripts definidos en `keel.toml` (`keel run`)
- Configura autocompletado para shell (`keel completion`)

## Comandos disponibles hoy

| Comando | Propósito |
|---|---|
| `keel new [project-name]` | Crea un proyecto Keel desde cero |
| `keel init` | Crea `keel.toml` en el directorio actual |
| `keel generate [type] [name]` | Genera módulos/componentes y actualiza wiring |
| `keel run [script]` | Ejecuta scripts de `[scripts]` en `keel.toml` |
| `keel completion ...` | Genera o instala completions de shell |
| `keel --version` | Muestra versión, commit, build date y plataforma |

## Flujo recomendado

```bash
# 1) Instala el CLI
go install github.com/slice-soft/keel@latest

# 2) Crea proyecto
keel new my-api

# 3) Ejecuta entorno dev
cd my-api
keel run dev

# 4) Genera tu primer módulo
keel generate module users --with-repository
```

## Siguiente paso

- [Instalación detallada](/cli/installation/)
- [Inicio rápido](/cli/quickstart/)
- [Comando `generate`](/cli/generate/)
- [Troubleshooting](/cli/troubleshooting/)

:::note[Repositorio]
Código fuente del CLI: [github.com/slice-soft/keel](https://github.com/slice-soft/keel)
:::
