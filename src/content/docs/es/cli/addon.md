---
title: Comando addon
description: Elimina y actualiza addons de Keel instalados en el proyecto actual.
---

## Uso

```bash
keel addon <subcomando>
```

Dos subcomandos:

```bash
keel addon remove <alias>    # elimina un addon instalado
keel addon upgrade [alias]   # actualiza uno o todos los addons
```

Ambos subcomandos requieren un proyecto Keel válido (`go.mod`, `cmd/main.go`, `internal/`).

---

## `keel addon remove`

```bash
keel addon remove <alias>
keel addon remove <alias> --yes
```

Elimina un addon de Keel del proyecto actual.

### Qué deshace

- Elimina el módulo Go de `go.mod` (vía los pasos de desinstalación del addon)
- Elimina el wiring de `cmd/main.go` (imports, llamadas de setup)
- Elimina las entradas de env agregadas por el addon de `.env` y `.env.example`
- Elimina la entrada `[[addons]]` de `keel.toml`

### Flags

| Flag | Descripción |
|------|-------------|
| `--yes`, `-y` | Omite el prompt de confirmación |

### Prompt de confirmación

Sin `--yes`, el comando muestra:

```text
  Remove addon "gorm" (v0.4.1)?
  This will undo wiring in cmd/main.go, env files, and keel.toml. [y/N]
```

Solo `y` continúa. Cualquier otra entrada aborta.

### Ejemplos

```bash
keel addon remove gorm
keel addon remove jwt --yes
```

### Errores comunes

- `keel addon must be executed inside a Keel project`
- `addon "X" not found in keel.toml`
- `could not fetch addon manifest for X: ...`

:::tip[Tip]
Si la obtención del manifest falla (ej. error de red), puedes eliminar manualmente la entrada `[[addons]]` de `keel.toml` y ejecutar `go mod tidy`.
:::

---

## `keel addon upgrade`

```bash
keel addon upgrade            # actualiza todos los addons instalados
keel addon upgrade <alias>    # actualiza un addon específico
keel addon upgrade --refresh  # fuerza refresco del registry antes de actualizar
```

Actualiza uno o todos los addons declarados en `keel.toml` a su última versión.

### Cómo funciona

Por cada addon objetivo:

1. Ejecuta `go get <repo>@latest`
2. Compara la nueva versión contra la versión anterior en `go.mod`
3. Actualiza el campo `version` en `keel.toml` si cambió
4. Después de todas las actualizaciones, ejecuta `go mod tidy`

### Flags

| Flag | Descripción |
|------|-------------|
| `--refresh` | Fuerza refresco del caché del registry de addons antes de resolver aliases |

### Salida

```text
  Upgrading 2 addon(s)...

  → go get github.com/slice-soft/ss-keel-gorm@latest
  ✓ gorm v0.4.0 → v0.4.1
  → go get github.com/slice-soft/ss-keel-jwt@latest
  ✓ jwt already at v0.3.0

  ✓ upgrade complete (1 updated)
```

### Ejemplos

```bash
# Actualizar todos los addons
keel addon upgrade

# Actualizar solo gorm
keel addon upgrade gorm

# Forzar fetch del registry más reciente
keel addon upgrade --refresh
```

### Errores comunes

- `keel addon must be executed inside a Keel project`
- `addon "X" not found in keel.toml`
- `no repo in keel.toml for addon "X"`
- `go get <repo>@latest: ...` (error de red o resolución de módulo)

---

## Relación con `keel add`

| Comando | Propósito |
|---------|-----------|
| `keel add <alias>` | Instala un addon nuevo (aún no en el proyecto) |
| `keel addon upgrade [alias]` | Actualiza addons ya instalados |
| `keel addon remove <alias>` | Elimina un addon instalado |

Usa `keel doctor` después de cualquier operación de addon para verificar que el proyecto esté saludable.
