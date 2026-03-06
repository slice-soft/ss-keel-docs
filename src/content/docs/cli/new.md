---
title: Comando new
description: Crea un proyecto Keel nuevo con estructura, scripts y wiring base.
---

## Uso

```bash
keel new [project-name]
```

Alias:

```bash
keel n [project-name]
```

## Qué genera

Base del proyecto:

- `cmd/main.go`
- `go.mod`
- `keel.toml`
- `README.md`
- `.gitignore`

Opcionales según respuestas:

- `.env` y `.env.example`
- `.air.toml`
- módulo `internal/modules/starter/*`
- estructura adicional: `internal/middleware`, `internal/guards`, `internal/scheduler`, `internal/checkers`, `internal/events`, `internal/hooks`

## Flujo interactivo

Si no usas `--yes`, el comando solicita:

1. Nombre de proyecto (si no lo pasaste por argumento)
2. Host del módulo (`GitHub`, `GitLab`, `custom`, `local`)
3. Owner/grupo o dominio
4. Confirmación/edición del módulo final
5. Uso de Air y creación de `.air.toml`
6. Soporte `.env`
7. Inicializar repositorio Git
8. Instalar dependencias (`go mod tidy`)

## Flags

| Flag | Descripción |
|---|---|
| `--yes`, `-y` | Salta prompts y aplica defaults |
| `--without-starter-module` | No crea el módulo `starter` |
| `--with-folder-structure` | Crea estructura opinada de carpetas internas |

## Ejemplos

Proyecto interactivo:

```bash
keel new payments-api
```

Proyecto automático + estructura completa:

```bash
keel new payments-api --yes --with-folder-structure
```

Proyecto sin módulo starter:

```bash
keel new payments-api --without-starter-module
```

## Notas importantes

- Si la carpeta destino ya existe, el comando falla.
- Con `--yes`, el módulo por defecto es `github.com/my-github-user/<app>`.
- En modo automático, también intenta:
  - `git init`
  - `go mod tidy`
  - commit inicial (`feat: initial commit keel framework`)

Si estás en red restringida o sin acceso al proxy de Go, `go mod tidy` puede fallar y debes ejecutarlo luego en tu entorno de red.
