---
title: Comando doctor
description: Diagnostica la salud del proyecto Keel — keel.toml, addons, variables de entorno e integridad del build.
---

## Uso

```bash
keel doctor
```

Sin argumentos ni flags. Debe ejecutarse dentro de un proyecto Keel.

## Qué verifica

`keel doctor` ejecuta un conjunto de verificaciones estáticas en secuencia:

### 1. Validez de `keel.toml`

- Verifica que el archivo existe.
- Lo parsea como TOML válido.
- Si falta: emite un warning y omite las verificaciones de addons y env.
- Si está malformado: emite un error y detiene ese grupo de checks.

### 2. `application.properties` (nuevo contrato de config en tiempo de ejecución)

- Si existe, lo parsea y valida.
- Tiene precedencia sobre `keel.toml` para los checks de variables de entorno.
- Si falta: emite un warning suave (no bloquea).

### 3. Addons instalados en `go.mod`

Por cada entrada `[[addons]]` en `keel.toml`:

- Busca el módulo del addon en `go.mod`.
- `✓` si lo encuentra, `✗` si falta (bloquea con error).
- También advierte si no hay addons declarados.

### 4. Versiones de addons actualizadas

Por cada addon oficial `ss-keel-*` declarado en `keel.toml`:

- Obtiene la última versión desde GitHub en paralelo.
- Compara contra la versión instalada en `go.mod`.
- `⚠` si está desactualizado: muestra actual → última.
- `✓` si está al día.
- Omite addons no oficiales o de comunidad.
- Timeout: 8 segundos total entre todos los checks paralelos.

### 5. Variables de entorno requeridas

Lee variables de `application.properties` (si existe) o de las entradas `[[env]]` en `keel.toml`:

- Verifica `.env` primero, luego el entorno del OS.
- Variables requeridas sin valor → error `✗`.
- Variables opcionales con valores placeholder (ej. `change-me`, `your-secret`) → warning `⚠`.

### 6. Sanidad de configuración OAuth

Si el addon `oauth` está declarado en `keel.toml`:

- Verifica al menos un par de proveedor completo: `OAUTH_<PROVEEDOR>_CLIENT_ID` + `OAUTH_<PROVEEDOR>_CLIENT_SECRET`.
- Proveedores soportados: `GOOGLE`, `GITHUB`, `GITLAB`.
- Si ninguno está configurado → warning `⚠` (el addon montaría cero rutas en tiempo de ejecución).

### 7. Módulo y disponibilidad de build

Ejecuta dos comandos de Go:

```bash
go mod tidy -diff   # verifica si go.mod/go.sum están en orden
go build ./...      # verifica que el proyecto compila
```

- Si `go.mod` o `cmd/main.go` no existen, este check se omite con un warning.
- Si `go mod tidy -diff` falla → error `✗`; `go build` se omite.
- Si `go build ./...` falla → error `✗`; se muestra el output (primeras 8 líneas).

## Símbolos de salida

| Símbolo | Significado |
|---------|-------------|
| `✓` | Check pasó |
| `✗` | Error — debe corregirse |
| `⚠` | Warning — debería corregirse |

## Resumen

Al finalizar todos los checks:

- Todos pasan → `✓ project looks healthy`
- Solo warnings → `⚠ project looks healthy, but review warnings before production`
- Algún error → `✗ doctor found issues — fix them before running the application`

El comando sale con código no cero cuando hay errores.

:::note[Solo checks estáticos]
`keel doctor` no verifica conectividad en tiempo de ejecución. Bases de datos, Redis, APIs externas y alcanzabilidad de red no son testeadas.
:::

## Ejemplo de salida

```text
  Keel Doctor — project health check

  ✓  keel.toml is valid
  ⚠  application.properties not found — generate it for the new runtime config contract
  ✓  addon "gorm" found in go.mod
  ✓  addon "jwt" found in go.mod
  ✓  addon "gorm" is up to date (v0.4.1)
  ✓  addon "jwt" is up to date (v0.3.0)
  ✓  required var DB_DSN is set
  ✓  required var JWT_SIGNING_KEY is set
  ⚠  sensitive var JWT_SIGNING_KEY uses an insecure placeholder (.env) — replace it before production
  ✓  go.mod/go.sum are tidy
  ✓  go build ./... passed

  ⚠  project looks healthy, but review warnings before production
  ℹ  checks are static (keel.toml, go.mod, env vars, go build) — runtime connectivity to databases, Redis, or external services is not verified
```

## Errores comunes

- `keel.toml is not valid TOML: ...`
- `addon "X" not found in go.mod — run: keel add X`
- `required var X is not set — add it to .env`
- `go.mod/go.sum are not tidy — run: go mod tidy`
- `go build ./... failed`

## Uso recomendado

Ejecuta `keel doctor` después de:

- instalar o remover un addon (`keel add`, `keel addon remove`)
- editar `keel.toml` manualmente
- hacer pull de cambios de tus compañeros de equipo
- antes de desplegar a producción

```bash
keel doctor
```
