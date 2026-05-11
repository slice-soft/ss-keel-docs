---
title: addon command
description: Remove and upgrade Keel addons installed in the current project.
---

## Usage

```bash
keel addon <subcommand>
```

Two subcommands:

```bash
keel addon remove <alias>    # remove an installed addon
keel addon upgrade [alias]   # upgrade one or all addons
```

Both subcommands require a valid Keel project (`go.mod`, `cmd/main.go`, `internal/`).

---

## `keel addon remove`

```bash
keel addon remove <alias>
keel addon remove <alias> --yes
```

Removes a Keel addon from the current project.

### What it undoes

- Removes the Go module from `go.mod` (via the addon's uninstall steps)
- Removes wiring from `cmd/main.go` (imports, setup calls)
- Removes env entries added by the addon from `.env` and `.env.example`
- Removes the `[[addons]]` entry from `keel.toml`

### Flags

| Flag | Description |
|------|-------------|
| `--yes`, `-y` | Skip the confirmation prompt |

### Confirmation prompt

Without `--yes`, the command shows:

```text
  Remove addon "gorm" (v0.4.1)?
  This will undo wiring in cmd/main.go, env files, and keel.toml. [y/N]
```

Only `y` proceeds. Any other input aborts.

### Examples

```bash
keel addon remove gorm
keel addon remove jwt --yes
```

### Common errors

- `keel addon must be executed inside a Keel project`
- `addon "X" not found in keel.toml`
- `could not fetch addon manifest for X: ...`

:::tip[Tip]
If the manifest fetch fails (e.g. network error), you can manually remove the `[[addons]]` entry from `keel.toml` and run `go mod tidy`.
:::

---

## `keel addon upgrade`

```bash
keel addon upgrade            # upgrade all installed addons
keel addon upgrade <alias>    # upgrade a specific addon
keel addon upgrade --refresh  # force refresh addon registry before upgrading
```

Upgrades one or all addons declared in `keel.toml` to their latest version.

### How it works

For each target addon:

1. Runs `go get <repo>@latest`
2. Compares the new version against the previous version in `go.mod`
3. Updates the `version` field in `keel.toml` if changed
4. After all upgrades, runs `go mod tidy`

### Flags

| Flag | Description |
|------|-------------|
| `--refresh` | Force refresh of the addon registry cache before resolving aliases |

### Output

```text
  Upgrading 2 addon(s)...

  → go get github.com/slice-soft/ss-keel-gorm@latest
  ✓ gorm v0.4.0 → v0.4.1
  → go get github.com/slice-soft/ss-keel-jwt@latest
  ✓ jwt already at v0.3.0

  ✓ upgrade complete (1 updated)
```

### Examples

```bash
# Upgrade all addons
keel addon upgrade

# Upgrade only gorm
keel addon upgrade gorm

# Force fetch latest registry data
keel addon upgrade --refresh
```

### Common errors

- `keel addon must be executed inside a Keel project`
- `addon "X" not found in keel.toml`
- `no repo in keel.toml for addon "X"`
- `go get <repo>@latest: ...` (network or module resolution error)

---

## Relationship with `keel add`

| Command | Purpose |
|---------|---------|
| `keel add <alias>` | Install a new addon (not yet in the project) |
| `keel addon upgrade [alias]` | Upgrade already-installed addons |
| `keel addon remove <alias>` | Remove an installed addon |

Use `keel doctor` after any addon operation to verify the project is healthy.
