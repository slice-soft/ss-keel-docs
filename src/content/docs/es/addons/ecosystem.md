---
title: Ecosistema de Addons
description: Crea, instala y publica addons de Keel usando template, comando add del CLI y registry oficial.
---

Esta página se basa en:

- código fuente de `keel` (`cmd/add` e `internal/addon/*`)
- estructura de repositorio y README de `ss-keel-addon-template`
- registry y proceso de contribución de `ss-keel-addons`

## Repositorios del ecosistema

| Repositorio | Rol en el ecosistema |
|---|---|
| `keel` | Instala addons con `keel add`, resuelve aliases, lee `keel-addon.json` y ejecuta pasos de integración |
| `ss-keel-addon-template` | Template de GitHub para bootstrap de repositorios de addons |
| `ss-keel-addons` | Registry público de aliases usado por `keel add <alias>` |

## Flujo end-to-end

1. Crear repositorio del addon desde `ss-keel-addon-template`.
2. Implementar código del addon y definir `keel-addon.json` con pasos soportados por el CLI.
3. Publicar repositorio público en GitHub y una versión estable.
4. Abrir PR en `ss-keel-addons` para registrar metadata del alias.
5. Instalar en proyectos usuarios con `keel add <alias>` (o path directo del repo).

## 1) Crear un addon desde el template de GitHub

Template: [github.com/slice-soft/ss-keel-addon-template](https://github.com/slice-soft/ss-keel-addon-template)

Ruta recomendada:

1. Abre el repositorio template.
2. Haz clic en **Use this template**.
3. Crea tu repositorio del addon.
4. Clona tu repositorio localmente.

Luego actualiza el módulo:

```bash
go mod edit -module github.com/your-org/your-addon
go mod tidy
```

Nota del template: los workflows vienen comentados por defecto en `.github/workflows/ci.yml` y `.github/workflows/release.yml`. Descoméntalos si quieres habilitar CI/CD.

## 2) Definir `keel-addon.json` para el comportamiento actual del CLI

El CLI espera `keel-addon.json` en:

`https://raw.githubusercontent.com/<owner>/<repo>/main/keel-addon.json`

Actualmente solo se soporta GitHub.

Ejemplo práctico mínimo:

```json
{
  "name": "my-addon",
  "version": "0.1.0",
  "description": "Example addon",
  "repo": "github.com/your-org/your-addon",
  "depends_on": ["jwt"],
  "steps": [
    { "type": "go_get", "package": "github.com/your-org/your-addon@v0.1.0" },
    { "type": "env", "key": "MY_ADDON_ENABLED", "example": "true" },
    { "type": "create_provider_file", "filename": "cmd/setup_myaddon.go", "guard": "func setupMyAddon(", "content": "package main\n\n// ..." },
    { "type": "main_code", "anchor": "before_modules", "guard": "setupMyAddon(", "code": "setupMyAddon(app, appLogger)" },
    { "type": "note", "message": "Siguiente paso: integra una ruta protegida o una nota de docs" }
  ]
}
```

Tipos de paso soportados hoy por el CLI:

- `go_get`
- `env`
- `main_import`
- `main_code`
- `create_provider_file`
- `note`

Si usas un tipo de paso desconocido, la instalación falla.

### `depends_on`

Array opcional de aliases de addons que deben estar instalados antes que este addon funcione. El CLI verifica las dependencias faltantes y avisa al usuario. Ejemplo: `ss-keel-oauth` declara `"depends_on": ["jwt"]` porque necesita `ss-keel-jwt` para firmar tokens tras la autenticación.

### `create_provider_file`

Este paso crea un archivo Go dedicado (ej. `cmd/setup_gorm.go`) con la función de inicialización del addon, en lugar de insertar todo el código de setup directamente en `cmd/main.go`. Un paso `main_code` complementario llama esa función.

Esto mantiene cada addon aislado y `cmd/main.go` legible sin importar cuántos addons estén instalados. El campo `guard` contiene una cadena que se verifica en el archivo destino antes de crearlo — si ya está presente, el archivo no se sobreescribe.

## 3) Instalar addons en un proyecto Keel

Alias oficial (resuelto por registry):

```bash
keel add gorm
keel add mongo
```

Path directo de repositorio:

```bash
keel add github.com/your-org/your-addon
```

Refresh de caché del registry:

```bash
keel add gorm --refresh
```

Detalles del CLI:

- Exige `go.mod`, `cmd/main.go` e `internal/`.
- Usa caché `~/.keel/registry.json` (TTL de 1 hora).
- Para objetivos no oficiales, solicita confirmación antes de instalar.

## 4) Enviar addon al registry oficial (`ss-keel-addons`)

Repositorio del registry: [github.com/slice-soft/ss-keel-addons](https://github.com/slice-soft/ss-keel-addons)

Según `ss-keel-addons/CONTRIBUTING.md`, el flujo es:

1. Asegurar que el repositorio del addon sea público.
2. Seguir convenciones del template (`ss-keel-addon-template`).
3. Preparar una versión estable y evidencia de tests en tu repositorio.
4. Abrir PR editando `registry.json`.
5. Incluir links del addon, evidencia de tests y contexto de documentación en el PR.
6. Compartir el PR en Discord para revisión.

Las entradas del registry incluyen:

- `alias`
- `repo`
- `description`
- `source`
- `tags`

Después del merge, los usuarios pueden instalar por alias. Si tienen caché reciente, usar `--refresh` permite tomar la lista actualizada de inmediato.
