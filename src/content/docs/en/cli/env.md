---
title: env command
description: Sync, generate, and validate environment variables from application.properties or keel.toml.
---

## Usage

```bash
keel env <subcommand>
```

Three subcommands:

```bash
keel env sync      # generate/update .env.example
keel env generate  # generate .env (only missing keys)
keel env check     # validate required vars
```

No standalone flags on `keel env` itself. Each subcommand takes no flags.

## Source of truth for env vars

`keel env` reads variable declarations from, in order of priority:

1. `application.properties` — if it exists (new runtime config contract)
2. `keel.toml` — `[[env]]` entries (legacy)

---

## `keel env sync`

```bash
keel env sync
```

Generates or updates `.env.example` from declared variables.

### Rules

- `${KEY}` placeholder → appends `KEY=` to `.env.example`
- `${KEY:default}` placeholder → appends `KEY=default`
- Sensitive keys with no default → placeholder value: `your-secret-here`
- Keys already present in `.env.example` are **not** overwritten (idempotent)
- Manual entries in `.env.example` that are not declared in `application.properties` are **preserved**

### Output

```text
  ✓  added 3 key(s) to .env.example
```

or:

```text
  ✓  .env.example is up to date
```

### Example

Given `application.properties`:

```properties
server.port=${PORT:8080}
database.dsn=${DB_DSN}
jwt.secret=${JWT_SECRET}
```

Running `keel env sync` appends to `.env.example`:

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

Generates or updates `.env` from declared variables. Only adds **missing** keys.

### Rules

- Required vars (no default) → `KEY=` (empty, must be filled)
- Optional vars (with default) → `# KEY=default` (commented out)
- Keys already present in `.env` (active or commented) are **not** duplicated
- Existing `.env` content is **never overwritten**

### Output

```text
  ✓  added 2 key(s) to .env
```

or:

```text
  ✓  .env already has all declared keys
```

### Typical workflow

```bash
git pull
keel env generate   # adds keys declared by teammates
# fill in empty values
keel run dev
```

---

## `keel env check`

```bash
keel env check
```

Validates that required variables are set. Reads from `.env` first, then OS environment.

### Output symbols

| Symbol | Meaning |
|--------|---------|
| `✓` | Variable is set |
| `✗` | Required variable is missing (exits non-zero) |
| `⚠` | Optional variable is not set |

### Example output

```text
  ✓  PORT is set
  ✓  DB_DSN is set (via OS env)
  ✗  JWT_SECRET is missing
  ⚠  REDIS_URL is not set (optional)
```

The command exits with non-zero if any required variable is missing.

---

## Relationship with `keel doctor`

`keel doctor` also checks required env vars, but `keel env check` is narrower and faster — useful in CI pipelines to validate the environment before deploying.

```bash
# Minimal CI env validation
keel env check || exit 1
```

---

## Common errors

- `reading application.properties: ...`
- `reading keel.toml: ...`
- `opening .env.example: ...`
- `missing required environment variables` (exit code from `keel env check`)

---

## Best practices

1. Commit `.env.example` — it's safe (no real values).
2. Never commit `.env` — add it to `.gitignore`.
3. Run `keel env sync` after updating `application.properties` to keep `.env.example` current.
4. Run `keel env check` in CI before deploying.
