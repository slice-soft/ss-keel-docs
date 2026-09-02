---
title: doctor command
description: Diagnose the health of the current Keel project — keel.toml, addons, env vars, and build integrity.
---

## Usage

```bash
keel doctor
```

No arguments or flags. Must be run inside a Keel project.

A directory holding neither `keel.toml` nor `go.mod` is not a project: `doctor`
reports it as an error and exits non-zero instead of grading it, so a wrong
working directory or a broken checkout cannot pass CI in green. A Go project that
has not adopted `keel.toml` yet — the `keel init` path — is only a warning.

## What it checks

`keel doctor` runs a set of static checks in sequence:

### 1. `keel.toml` validity

- Verifies the file exists.
- Parses it as valid TOML.
- If missing: emits a warning and skips addon/env checks.
- If malformed: emits an error and stops that check group.

### 2. `application.properties` (new runtime config contract)

- If present, parses and validates it.
- Takes precedence over `keel.toml` for env var checks.
- If missing: emits a soft warning (non-blocking).

### 3. Addons installed in `go.mod`

For each `[[addons]]` entry in `keel.toml`:

- Searches for the addon's module path in `go.mod`.
- `✓` if found, `✗` if missing (blocks with error).
- Also warns if no addons are declared.

### 4. Addon version freshness

For each official `ss-keel-*` addon declared in `keel.toml`:

- Fetches the latest version from GitHub in parallel.
- Compares against the installed version in `go.mod`.
- `⚠` if outdated: shows current → latest.
- `✓` if up to date.
- Skips non-official or community addons.
- Timeout: 8 seconds total across all parallel checks.

### 5. Required env vars

Reads variables from `application.properties` (if present) or from `[[env]]` entries in `keel.toml`:

- Checks `.env` first, then OS environment.
- Required vars with no value → `✗` error.
- Optional vars with placeholder values (e.g. `change-me`, `your-secret`) → `⚠` warning.

### 6. OAuth configuration sanity

If the `oauth` addon is declared in `keel.toml`:

- Checks for at least one complete provider pair: `OAUTH_<PROVIDER>_CLIENT_ID` + `OAUTH_<PROVIDER>_CLIENT_SECRET`.
- Supported providers: `GOOGLE`, `GITHUB`, `GITLAB`.
- If none are configured → `⚠` warning (the addon would mount zero routes at runtime).

### 7. Base schema of GORM-backed modules

Keel runs no migrations, so a GORM-backed module only works once its table has
been created. For each module under `internal/modules/` that imports
`ss-keel-gorm`:

- Resolves the table from the entity's `TableName()` method.
- Requires `db/schema/<table>.sql` to exist.
- `✓` if present, `✗` **error** if missing — the table would not exist and every
  endpoint of that module would answer 500 at the first request.

When an entity declares no `TableName()`, the check reports the table GORM itself
derives from the Go type (`OrderItemEntity` → `order_item_entities`) and suggests
pinning a stable name. Mongo-backed modules are skipped: MongoDB creates
collections on demand.

### 8. Module and build readiness

Runs two Go commands:

```bash
go mod tidy -diff   # checks whether go.mod/go.sum are tidy
go build ./...      # verifies the project compiles
```

- If `go.mod` or `cmd/main.go` are missing, this check is skipped with a warning.
- If `go mod tidy -diff` fails → `✗` error; `go build` is skipped.
- If `go build ./...` fails → `✗` error; output is shown (first 8 lines).

## Output symbols

| Symbol | Meaning |
|--------|---------|
| `✓` | Check passed |
| `✗` | Error — must fix |
| `⚠` | Warning — should fix |

## Summary

After all checks:

- All pass → `✓ project looks healthy`
- Warnings only → `⚠ project looks healthy, but review warnings before production`
- Any error → `✗ doctor found issues — fix them before running the application`

The command exits with a non-zero code when there are errors.

:::note[Static checks only]
`keel doctor` does not verify runtime connectivity. Databases, Redis, external APIs, and network reachability are not tested.
:::

## Example output

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

## Common errors

- `no Keel project here — no keel.toml and no go.mod found`
- `keel.toml is not valid TOML: ...`
- `addon "X" not found in go.mod — run: keel add X`
- `required var X is not set — add it to .env`
- `module "X" is GORM-backed but db/schema/<table>.sql is missing`
- `go.mod/go.sum are not tidy — run: go mod tidy`
- `go build ./... failed`

## Recommended usage

Run `keel doctor` after:

- installing or removing an addon (`keel add`, `keel addon remove`)
- generating a module with `--gorm` (it checks the schema file landed)
- editing `keel.toml` manually
- pulling changes from teammates
- before shipping to production

Because it exits non-zero on errors, it works as a CI gate:

```yaml
- run: keel doctor
```

```bash
keel doctor
```
