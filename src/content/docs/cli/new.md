---
title: Comando new
description: Crea un proyecto Keel nuevo con estructura base, scripts, wiring y setup inicial opcional.
---

## Uso

```bash
keel new [project-name]
```

Alias:

```bash
keel n [project-name]
```

## Reglas del argumento `project-name`

- No puede estar vacío.
- No puede contener espacios.
- No puede contener `/` ni `\`.
- Con `--yes` (`-y`) es obligatorio pasar el nombre por argumento.

## Flujo interactivo (sin `--yes`)

El comando solicita, en este orden:

1. Nombre del proyecto (si no viene por argumento)
2. Host del módulo: `GitHub`, `GitLab`, `Custom domain` o `Local module`
3. Owner/grupo/dominio según host
4. Confirmación o edición manual de `module path`
5. Uso de Air y creación de `.air.toml`
6. Soporte `.env`
7. Inicializar repositorio Git
8. Instalar dependencias (`go mod tidy`)

## Flags

| Flag | Descripción |
|---|---|
| `--yes`, `-y` | Salta prompts y aplica defaults |
| `--without-starter-module` | No crea `internal/modules/starter` |
| `--with-folder-structure` | Crea estructura opinada (`middleware`, `guards`, `scheduler`, etc.) |

## Archivos generados

Base:

- `cmd/main.go`
- `go.mod`
- `keel.toml`
- `README.md`
- `.gitignore`

Opcionales:

- `.env`, `.env.example`
- `.air.toml`
- `internal/modules/starter/*`
- carpetas: `internal/middleware`, `internal/guards`, `internal/scheduler`, `internal/checkers`, `internal/events`, `internal/hooks`

## Post-setup que puede ejecutar

Dependiendo de tus respuestas:

- `git init <appName>`
- `go mod tidy`
- commit inicial con mensaje: `feat: initial commit keel framework`

Si algo falla, el comando continúa y muestra advertencias (`⚠`) en consola.

## Modo automático (`--yes`)

Defaults aplicados por el CLI:

- `moduleName = github.com/my-github-user/<app>`
- `useAir = true`
- `includeAirConfig = true`
- `useEnv = true`
- `initGit = true`
- `installDeps = true`

:::caution[Revisión obligatoria]
Con `--yes`, corrige el `module` de `go.mod` antes de subir el proyecto.
:::

## Ejemplos

Proyecto interactivo:

```bash
keel new payments-api
```

Proyecto automático y estructura completa:

```bash
keel new payments-api --yes --with-folder-structure
```

Proyecto sin módulo starter:

```bash
keel new payments-api --without-starter-module
```

## Errores frecuentes

- `directory '<name>' already exists`
- `project name cannot be empty`
- `project name cannot contain spaces`
- `project name must not contain '/' or '\\'`
- `project name is required when using --yes/-y`

## Recomendación práctica

Si usas `--without-starter-module` y no usas `--with-folder-structure`, crea `internal/` manualmente antes de usar `keel generate`, porque ese comando exige estructura de proyecto Keel válida.
