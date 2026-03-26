---
title: Comando add
description: Instala addons oficiales o comunitarios de Keel y los integra en el proyecto actual.
---

## Uso

```bash
keel add [alias|repo]
```

Opciones no interactivas:

```bash
keel add [alias|repo] --yes
keel add [alias|repo] --no-input
```

Con refresh de registry:

```bash
keel add [alias|repo] --refresh
```

`add` requiere exactamente un argumento.

## Requisitos de proyecto

`add` solo funciona dentro de un proyecto Keel con:

- `go.mod`
- `cmd/main.go`
- carpeta `internal/`

Si no se cumple, devuelve:

```text
keel add must be executed inside a Keel project
```

## Cómo funciona la resolución del objetivo

| Entrada | Resolución |
|---|---|
| `gorm` | Se busca como alias en el registry oficial |
| `github.com/acme/my-addon` | Se trata como ruta de repositorio directa (sin lookup de alias) |
| alias desconocido (por ejemplo `my-addon`) | Se trata como objetivo no oficial y pide confirmación |

## Comportamiento del registry y caché

- Fuente del registry: `https://raw.githubusercontent.com/slice-soft/ss-keel-addons/main/registry.json`
- Archivo de caché local: `~/.keel/registry.json`
- TTL de caché: 1 hora
- `--refresh` ignora caché fresca y fuerza fetch por red
- Si falla el fetch por red, el CLI intenta usar caché
- Si no se puede obtener el registry, la instalación puede continuar por repo directo

## Flujo oficial vs no oficial

- Alias oficial (encontrado en registry): instala directamente.
- Objetivo no oficial: solicita confirmación:

```text
Install anyway? [y/N]
```

Solo `y` continúa. Cualquier otra respuesta cancela la instalación.

- `--yes` auto-confirma este prompt y cualquier prompt de dependencias.
- `--no-input` deshabilita prompts. Las dependencias con default en sí se aceptan automáticamente, mientras que los prompts con default en no para addons no oficiales fallan rápido y te indican relanzar con `--yes`.

## Contrato `keel-addon.json`

Para un repositorio objetivo, el CLI descarga:

`https://raw.githubusercontent.com/<owner>/<repo>/main/keel-addon.json`

Actualmente solo se soportan rutas de módulo GitHub (`github.com/...`).

El CLI parsea esta estructura:

```json
{
  "name": "my-addon",
  "version": "0.1.0",
  "description": "Description",
  "repo": "github.com/your-org/my-addon",
  "depends_on": ["jwt"],
  "steps": [
    { "type": "go_get", "package": "github.com/your-org/my-addon@v0.1.0" },
    { "type": "env", "key": "MY_ADDON_KEY", "example": "value", "description": "Optional note" },
    { "type": "main_import", "path": "github.com/your-org/my-addon" },
    { "type": "main_code", "anchor": "before_modules", "guard": "myaddon.Setup(", "code": "myaddon.Setup(app, appLogger)" },
    { "type": "create_provider_file", "filename": "cmd/setup_myaddon.go", "guard": "func setupMyAddon(", "content": "package main\n\n// ..." },
    { "type": "note", "message": "Siguiente paso: integra una ruta protegida /api/me" }
  ]
}
```

`depends_on` es opcional. Cuando está presente, el CLI verifica si cada alias listado ya está instalado. Si falta alguno, muestra un prompt con default en sí para instalar la dependencia antes del addon solicitado. Para flujos automatizados, usa `--yes` para auto-aprobar todos los prompts, o `--no-input` para aceptar la respuesta por defecto de dependencias sin bloquear. Por ejemplo, `ss-keel-oauth` declara `"depends_on": ["jwt"]` porque necesita `ss-keel-jwt` para firmar tokens.

## Tipos de paso soportados

| Tipo de paso | Qué hace |
|---|---|
| `go_get` | Ejecuta `go get <package>` (agrega `@latest` si no incluyes versión) |
| `env` | Agrega `KEY=example` en `.env` y `.env.example` si la llave no existe |
| `main_import` | Inserta import en `cmd/main.go` si falta |
| `main_code` | Inserta código en `cmd/main.go`; `guard` evita duplicados; `anchor` acepta `"before_listen"` o `"before_modules"` |
| `create_provider_file` | Crea un archivo Go (ej. `cmd/setup_gorm.go`) con una función de inicialización autocontenida, manteniendo `cmd/main.go` limpio; `guard` verifica la firma de la función antes de crear el archivo |
| `note` | Imprime una nota post-instalación al terminar el wiring y `go mod tidy` |

Tipos de paso desconocidos fallan la instalación.

### Patrón `create_provider_file`

En lugar de llenar `cmd/main.go` con código de inicialización, los addons usan este paso para generar un archivo dedicado. Por ejemplo, `keel add gorm` crea `cmd/setup_gorm.go`:

```go
// cmd/setup_gorm.go — generado por keel add gorm
package main

func setupGorm(app *core.App, log *logger.Logger) *database.DBinstance {
    dbConfig := config.MustLoadConfig[database.Config]()
    dbConfig.Logger = log

    db, err := database.New(dbConfig)
    if err != nil {
        log.Error("failed to initialize database: %v", err)
    }
    app.RegisterHealthChecker(database.NewHealthChecker(db))
    return db
}
```

Y un paso `main_code` agrega la llamada en `cmd/main.go`:

```go
db := setupGorm(app, appLogger)
defer db.Close()
```

Esto mantiene el wiring de cada addon aislado y `cmd/main.go` legible sin importar cuántos addons estén instalados.

## Comportamiento después de instalar

- Los pasos se ejecutan en orden.
- Luego el CLI ejecuta `go mod tidy`.
- Al final imprime los pasos `note`, si existen.
- Si `go mod tidy` falla, el CLI muestra advertencia pero no falla toda la instalación.
- Si aceptas prompts de dependencias, esas instalaciones ocurren antes del addon objetivo y comparten el `tidy` final.
- En ejecuciones no interactivas, los prompts de dependencias usan su respuesta por defecto en lugar de esperar stdin.

## Ejemplos

Instalar addon oficial por alias:

```bash
keel add gorm
```

Instalar addon MongoDB por alias:

```bash
keel add mongo
```

Instalar addon comunitario por repo:

```bash
keel add github.com/acme/ss-keel-feature-flags
```

Forzar refresh del registry de aliases:

```bash
keel add gorm --refresh
```

Instalar OAuth y auto-aceptar su dependencia JWT en CI:

```bash
keel add oauth --yes
```

## Errores frecuentes

- `keel add must be executed inside a Keel project`
- `could not fetch addon registry: ...`
- `only github.com repos are supported (got "...")`
- `<repo> does not have a keel-addon.json — it may not be a Keel addon`
- `invalid keel-addon.json in <repo>: ...`
- `step "<type>" failed: ...`
