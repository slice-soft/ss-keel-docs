---
title: add command
description: Install official or community Keel addons and wire them into the current project.
---

## Usage

```bash
keel add [alias|repo]
```

With registry refresh:

```bash
keel add [alias|repo] --refresh
```

`add` requires exactly one argument.

## Project requirements

`add` only works inside a Keel project with:

- `go.mod`
- `cmd/main.go`
- `internal/` folder

If not, it returns:

```text
keel add must be executed inside a Keel project
```

## How target resolution works

| Input | Resolution |
|---|---|
| `gorm` | Looked up as alias in the official registry |
| `github.com/acme/my-addon` | Treated as direct repository path (skips alias lookup) |
| unknown alias (for example `my-addon`) | Treated as non-official target and asks for confirmation |

## Registry and cache behavior

- Registry source: `https://raw.githubusercontent.com/slice-soft/ss-keel-addons/main/registry.json`
- Local cache file: `~/.keel/registry.json`
- Cache TTL: 1 hour
- `--refresh` bypasses fresh cache and forces network fetch
- If network fetch fails, the CLI tries cached data first
- If registry cannot be fetched, install can still continue by direct repository path

## Official vs non-official install flow

- Official alias (found in registry): installs directly.
- Non-official target: prompts for confirmation:

```text
Install anyway? [y/N]
```

Only `y` continues. Any other answer aborts the install.

## `keel-addon.json` contract

For a repository target, the CLI downloads:

`https://raw.githubusercontent.com/<owner>/<repo>/main/keel-addon.json`

Current support is GitHub module paths only (`github.com/...`).

The CLI parses this structure:

```json
{
  "name": "my-addon",
  "version": "0.1.0",
  "description": "Description",
  "repo": "github.com/your-org/my-addon",
  "steps": [
    { "type": "go_get", "package": "github.com/your-org/my-addon@v0.1.0" },
    { "type": "env", "key": "MY_ADDON_KEY", "example": "value", "description": "Optional note" },
    { "type": "main_import", "path": "github.com/your-org/my-addon" },
    { "type": "main_code", "guard": "app.Use(myaddon.New())", "code": "app.Use(myaddon.New())" }
  ]
}
```

## Supported installation step types

| Step type | What it does |
|---|---|
| `go_get` | Runs `go get <package>` (adds `@latest` if version is omitted) |
| `env` | Appends `KEY=example` into `.env` if the key does not exist |
| `main_import` | Adds import path to `cmd/main.go` if missing |
| `main_code` | Inserts code before `app.Listen()` in `cmd/main.go`; `guard` avoids duplicates |

Unknown step types fail the install.

## Post-install behavior

- Steps run in order.
- Then CLI runs `go mod tidy`.
- If `go mod tidy` fails, the CLI prints a warning but does not fail the full install.

## Examples

Install official addon by alias:

```bash
keel add gorm
```

Install MongoDB addon by alias:

```bash
keel add mongo
```

Install community addon by repo:

```bash
keel add github.com/acme/ss-keel-feature-flags
```

Force refresh alias registry:

```bash
keel add gorm --refresh
```

## Common errors

- `keel add must be executed inside a Keel project`
- `could not fetch addon registry: ...`
- `only github.com repos are supported (got "...")`
- `<repo> does not have a keel-addon.json — it may not be a Keel addon`
- `invalid keel-addon.json in <repo>: ...`
- `step "<type>" failed: ...`
