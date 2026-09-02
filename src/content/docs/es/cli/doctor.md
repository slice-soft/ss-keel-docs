---
title: Comando doctor
description: Diagnostica la salud del proyecto Keel — keel.toml, addons, variables de entorno e integridad del build.
---

## Uso

```bash
keel doctor
```

Sin argumentos ni flags. Debe ejecutarse dentro de un proyecto Keel.

Un directorio que no tiene ni `keel.toml` ni `go.mod` no es un proyecto: `doctor`
lo reporta como error y sale con código distinto de cero en lugar de calificarlo,
de modo que un directorio de trabajo equivocado o un checkout roto no puedan pasar
el CI en verde. Un proyecto Go que todavía no ha adoptado `keel.toml` — el camino
de `keel init` — es sólo un aviso.

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

### 7. Esquema base de los módulos con GORM

Keel no ejecuta migraciones, así que un módulo con GORM sólo funciona una vez que
su tabla existe. Para cada módulo bajo `internal/modules/` que importe
`ss-keel-gorm`:

- Resuelve la tabla desde el método `TableName()` de la entidad.
- Exige que exista `db/schema/<tabla>.sql`.
- `✓` si está, `✗` **error** si falta — la tabla no existiría y todos los
  endpoints de ese módulo responderían 500 en la primera petición.

Cuando una entidad no declara `TableName()`, el chequeo reporta la tabla que GORM
deriva del tipo Go (`OrderItemEntity` → `order_item_entities`) y sugiere fijar un
nombre estable. Los módulos con Mongo se omiten: MongoDB crea las colecciones bajo
demanda.

### 8. Módulo y disponibilidad de build

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
  ✓  application.properties is valid
  ✓  addon "gorm" found in go.mod
  ✓  addon "jwt" found in go.mod
  ✓  addon "gorm" is up to date (v1.7.1)
  ✓  addon "jwt" is up to date (v1.8.2)
  ⚠  sensitive var JWT_SECRET uses an insecure placeholder (.env) — replace it before production
  ✓  module "tasks" has its base schema (db/schema/tasks.sql)
  ✓  go.mod/go.sum are tidy
  ✓  go build ./... passed

  ⚠  project looks healthy, but review warnings before production
  ℹ  checks are static (keel.toml, go.mod, env vars, go build) — runtime connectivity to databases, Redis, or external services is not verified
```

## Errores comunes

- `no Keel project here — no keel.toml and no go.mod found`
- `keel.toml is not valid TOML: ...`
- `addon "X" not found in go.mod — run: keel add X`
- `required var X is not set — add it to .env`
- `module "X" is GORM-backed but db/schema/<tabla>.sql is missing`
- `go.mod/go.sum are not tidy — run: go mod tidy`
- `go build ./... failed`

## Uso recomendado

Ejecuta `keel doctor` después de:

- instalar o remover un addon (`keel add`, `keel addon remove`)
- generar un módulo con `--gorm` (verifica que el esquema quedó escrito)
- editar `keel.toml` manualmente
- hacer pull de cambios de tus compañeros de equipo
- antes de desplegar a producción

Como sale con código distinto de cero cuando hay errores, sirve de gate de CI:

```yaml
- run: keel doctor
```

```bash
keel doctor
```
