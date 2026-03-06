---
title: new command
description: Create a new Keel project with base structure, scripts, wiring, and optional initial setup.
---

## Usage

```bash
keel new [project-name]
```

Alias:

```bash
keel n [project-name]
```

## `project-name` argument rules

- Cannot be empty.
- Cannot contain spaces.
- Cannot contain `/` or `\`.
- With `--yes` (`-y`) the name must be passed as an argument.

## Interactive flow (without `--yes`)

The command prompts, in this order:

1. Project name (if not passed as argument)
2. Module host: `GitHub`, `GitLab`, `Custom domain` or `Local module`
3. Owner/group/domain based on host
4. Confirmation or manual editing of `module path`
5. Use of Air and creation of `.air.toml`
6. `.env` support
7. Initialize Git repository
8. Install dependencies (`go mod tidy`)

## Flags

| Flag | Description |
|---|---|
| `--yes`, `-y` | Skips prompts and applies defaults |
| `--without-starter-module` | Does not create `internal/modules/starter` |
| `--with-folder-structure` | Creates an opinionated structure (`middleware`, `guards`, `scheduler`, etc.) |

## Generated files

Base:

- `cmd/main.go`
- `go.mod`
- `keel.toml`
- `README.md`
- `.gitignore`

Optional:

- `.env`, `.env.example`
- `.air.toml`
- `internal/modules/starter/*`
- folders: `internal/middleware`, `internal/guards`, `internal/scheduler`, `internal/checkers`, `internal/events`, `internal/hooks`

## Post-setup it may run

Depending on your answers:

- `git init <appName>`
- `go mod tidy`
- initial commit with message: `feat: initial commit keel framework`

If something fails, the command continues and shows warnings (`⚠`) in the console.

## Automatic mode (`--yes`)

Defaults applied by the CLI:

- `moduleName = github.com/my-github-user/<app>`
- `useAir = true`
- `includeAirConfig = true`
- `useEnv = true`
- `initGit = true`
- `installDeps = true`

:::caution[Required review]
With `--yes`, fix the `module` in `go.mod` before pushing the project.
:::

## Examples

Interactive project:

```bash
keel new payments-api
```

Automatic project with full structure:

```bash
keel new payments-api --yes --with-folder-structure
```

Project without starter module:

```bash
keel new payments-api --without-starter-module
```

## Common errors

- `directory '<name>' already exists`
- `project name cannot be empty`
- `project name cannot contain spaces`
- `project name must not contain '/' or '\\'`
- `project name is required when using --yes/-y`

## Practical recommendation

If you use `--without-starter-module` and don't use `--with-folder-structure`, create `internal/` manually before using `keel generate`, because that command requires a valid Keel project structure.
