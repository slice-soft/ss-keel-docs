---
title: Comando env
description: Sincroniza, genera y valida variables de entorno desde application.properties o keel.toml.
---

## Uso

```bash
keel env <subcomando>
```

Tres subcomandos:

```bash
keel env sync      # genera/actualiza .env.example
keel env generate  # genera .env (solo claves faltantes)
keel env check     # valida variables requeridas
```

Sin flags propios en `keel env`. Cada subcomando no tiene flags.

## Fuente de verdad para las variables de entorno

`keel env` lee las declaraciones de variables desde, en orden de prioridad:

1. `application.properties` — si existe (nuevo contrato de config en tiempo de ejecución)
2. `keel.toml` — entradas `[[env]]` (legado)

---

## `keel env sync`

```bash
keel env sync
```

Genera o actualiza `.env.example` a partir de las variables declaradas.

### Reglas

- Placeholder `${KEY}` → agrega `KEY=` a `.env.example`
- Placeholder `${KEY:default}` → agrega `KEY=default`
- Claves sensibles sin default → valor placeholder: `your-secret-here`
- Claves ya presentes en `.env.example` **no se sobreescriben** (idempotente)
- Entradas manuales en `.env.example` que no están en `application.properties` se **preservan**

### Salida

```text
  ✓  added 3 key(s) to .env.example
```

o:

```text
  ✓  .env.example is up to date
```

### Ejemplo

Dado `application.properties`:

```properties
server.port=${PORT:8080}
database.dsn=${DB_DSN}
jwt.secret=${JWT_SECRET}
```

Ejecutar `keel env sync` agrega a `.env.example`:

```env
PORT=8080
DB_DSN=
JWT_SECRET=your-secret-here
```

---

## `keel env generate`

```bash
keel env generate
```

Genera o actualiza `.env` a partir de las variables declaradas. Solo agrega claves **faltantes**.

### Reglas

- Variables requeridas (sin default) → `KEY=` (vacío, debe completarse)
- Variables opcionales (con default) → `# KEY=default` (comentado)
- Claves ya presentes en `.env` (activas o comentadas) **no se duplican**
- El contenido existente de `.env` **nunca se sobreescribe**

### Salida

```text
  ✓  added 2 key(s) to .env
```

o:

```text
  ✓  .env already has all declared keys
```

### Flujo típico

```bash
git pull
keel env generate   # agrega claves declaradas por los compañeros
# completar los valores vacíos
keel run dev
```

---

## `keel env check`

```bash
keel env check
```

Valida que las variables requeridas estén configuradas. Lee desde `.env` primero, luego el entorno del OS.

### Símbolos de salida

| Símbolo | Significado |
|---------|-------------|
| `✓` | Variable está configurada |
| `✗` | Variable requerida falta (sale con código no cero) |
| `⚠` | Variable opcional no está configurada |

### Ejemplo de salida

```text
  ✓  PORT is set
  ✓  DB_DSN is set (via OS env)
  ✗  JWT_SECRET is missing
  ⚠  REDIS_URL is not set (optional)
```

El comando sale con código no cero si alguna variable requerida está faltando.

---

## Relación con `keel doctor`

`keel doctor` también verifica variables de entorno requeridas, pero `keel env check` es más preciso y rápido — útil en pipelines CI para validar el entorno antes de desplegar.

```bash
# Validación mínima de entorno en CI
keel env check || exit 1
```

---

## Errores comunes

- `reading application.properties: ...`
- `reading keel.toml: ...`
- `opening .env.example: ...`
- `missing required environment variables` (código de salida de `keel env check`)

---

## Buenas prácticas

1. Commitea `.env.example` — es seguro (sin valores reales).
2. Nunca commitees `.env` — agrégalo al `.gitignore`.
3. Ejecuta `keel env sync` después de actualizar `application.properties` para mantener `.env.example` al día.
4. Ejecuta `keel env check` en CI antes de desplegar.
