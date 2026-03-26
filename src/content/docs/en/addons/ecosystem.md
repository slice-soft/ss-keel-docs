---
title: Addon Ecosystem
description: Create, install, and publish Keel addons using the template, CLI add command, and official registry.
---

This page is based on:

- `keel` source code (`cmd/add` and `internal/addon/*`)
- `ss-keel-addon-template` repository structure and README
- `ss-keel-addons` registry and contribution process

## Ecosystem repositories

| Repository | Role in the ecosystem |
|---|---|
| `keel` | Installs addons with `keel add`, resolves aliases, reads `keel-addon.json`, and runs integration steps |
| `ss-keel-addon-template` | GitHub template to bootstrap a new addon repository |
| `ss-keel-addons` | Public alias registry used by `keel add <alias>` |

## End-to-end flow

1. Create addon repository from `ss-keel-addon-template`.
2. Implement addon code and define `keel-addon.json` with CLI-supported steps.
3. Publish a public GitHub repository and release a stable version.
4. Open PR in `ss-keel-addons` to register alias metadata.
5. Install in user projects with `keel add <alias>` (or direct repo path).

## 1) Create an addon from the GitHub template

Template repository: [github.com/slice-soft/ss-keel-addon-template](https://github.com/slice-soft/ss-keel-addon-template)

Recommended path:

1. Open template repository.
2. Click **Use this template**.
3. Create your addon repository.
4. Clone your new repository locally.

Then update module path:

```bash
go mod edit -module github.com/your-org/your-addon
go mod tidy
```

Template note: workflow files are commented by default in `.github/workflows/ci.yml` and `.github/workflows/release.yml`. Uncomment them if you want CI/CD enabled.

## 2) Define `keel-addon.json` for current CLI behavior

The CLI expects `keel-addon.json` at:

`https://raw.githubusercontent.com/<owner>/<repo>/main/keel-addon.json`

Current repo support is GitHub only.

Minimal practical example:

```json
{
  "name": "my-addon",
  "version": "0.1.0",
  "description": "Example addon",
  "repo": "github.com/your-org/your-addon",
  "depends_on": ["jwt"],
  "steps": [
    { "type": "go_get", "package": "github.com/your-org/your-addon@v0.1.0" },
    { "type": "env", "key": "MY_ADDON_ENABLED", "example": "true" },
    { "type": "create_provider_file", "filename": "cmd/setup_myaddon.go", "guard": "func setupMyAddon(", "content": "package main\n\n// ..." },
    { "type": "main_code", "anchor": "before_modules", "guard": "setupMyAddon(", "code": "setupMyAddon(app, appLogger)" },
    { "type": "note", "message": "Next step: wire a protected route or docs hint" }
  ]
}
```

Step types supported by CLI today:

- `go_get`
- `env`
- `main_import`
- `main_code`
- `create_provider_file`
- `note`

If you use an unknown step type, installation fails.

### `depends_on`

Optional array of addon aliases that must be installed before this addon works. The CLI checks for missing dependencies and prompts to install them before the target addon, defaulting to yes when the user presses Enter. In automated flows, `--yes` auto-approves all prompts and `--no-input` accepts the dependency default without blocking on stdin. Example: `ss-keel-oauth` declares `"depends_on": ["jwt"]` because it needs `ss-keel-jwt` to sign tokens after authentication.

### `create_provider_file`

This step creates a dedicated Go file (e.g. `cmd/setup_gorm.go`) containing the addon's initialization function, instead of inserting all the setup code directly into `cmd/main.go`. A companion `main_code` step then calls that function.

This keeps each addon isolated and `cmd/main.go` readable regardless of how many addons are installed. The `guard` field contains a string that is checked in the target file before creating it — if the string is already present, the file is not overwritten.

## 3) Install addons in a Keel project

Official alias (registry-backed):

```bash
keel add gorm
keel add mongo
```

Direct repository path:

```bash
keel add github.com/your-org/your-addon
```

Refresh registry cache:

```bash
keel add gorm --refresh
```

Scripted install with dependency auto-accept:

```bash
keel add oauth --yes
```

CLI details:

- Requires `go.mod`, `cmd/main.go`, and `internal/`.
- Uses `~/.keel/registry.json` cache (1 hour TTL).
- For non-official targets, asks confirmation before install.
- `--no-input` disables prompts; dependency prompts accept their default answer, while non-official installs require `--yes`.

## 4) Submit addon to official registry (`ss-keel-addons`)

Registry repository: [github.com/slice-soft/ss-keel-addons](https://github.com/slice-soft/ss-keel-addons)

Based on `ss-keel-addons/CONTRIBUTING.md`, submit flow is:

1. Ensure addon repository is public.
2. Follow template conventions (`ss-keel-addon-template`).
3. Prepare a stable version and test evidence in your addon repository.
4. Open PR editing `registry.json`.
5. Include addon repo links, test evidence, and documentation context in PR description.
6. Share the PR in Discord for review.

Registry entries include:

- `alias`
- `repo`
- `description`
- `source`
- `tags`

After merge, users can install using alias. If they recently cached the registry, use `--refresh` to pull the latest alias list immediately.
