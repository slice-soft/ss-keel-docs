---
title: init command
description: Initialize keel.toml in existing projects and optionally configure Air.
---

## Usage

```bash
keel init
```

`init` takes no arguments or flags.

## When to use it

- You already have a Go project and want to use `keel run`.
- You migrated a project to the Keel layout and are missing `keel.toml`.

## Exact behavior

1. Verifies that `keel.toml` does not exist.
2. Asks if you want to use Air for hot reload.
3. If you choose Air and it is not in `PATH`, tries to install it with:
   ```bash
   go install github.com/air-verse/air@latest
   ```
4. Generates `keel.toml`.
5. If Air is enabled and `.air.toml` does not exist, creates it.

## Generated files

Always:

- `keel.toml`

Optional:

- `.air.toml`

## Initial `keel.toml` content

In `init` mode, the `[app]` section is created empty for you to fill in:

```toml
[app]
name    = ""
version = ""
```

It also includes base scripts (`dev`, `build`, `test`, `lint`) and `[features]`.

## Variants of the `dev` script

The value of `dev` depends on the Air choice and the state of `.air.toml`:

- without Air: `dev = "go run ./cmd/main.go"`
- with Air and existing `.air.toml`: `dev = "air -c .air.toml"`
- with Air and new `.air.toml` (created by init): `dev = "air"`

## Typical adoption example

```bash
cd existing-service
keel init
keel run test
```

## Common errors

- `keel.toml already exists in this directory`
- `failed to install Air: ...`
- `failed generating keel.toml: ...`

## Best practices after `init`

1. Fill in `[app]` with real name/version.
2. Review scripts for your actual CI/CD flow.
3. Run `keel run test` to validate that the project is already integrated.
