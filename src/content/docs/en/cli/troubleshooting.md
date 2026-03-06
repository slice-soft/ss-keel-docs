---
title: Troubleshooting
description: Diagnosis and solutions for common issues when using Keel CLI.
---

## 1) `keel: command not found`

Verify installation and PATH:

```bash
which -a keel
go env GOBIN
go env GOPATH
```

If installed with `go install`, add `$(go env GOPATH)/bin` to your `PATH` (when `GOBIN` is empty).

## 2) I have multiple versions of `keel`

```bash
which -a keel
keel --version
```

Keep only one active installation method (`go install`, `brew` or manual binary).

## 3) I see a `keel upgrade` suggestion

In the current binary, the `upgrade` subcommand does not appear in `keel --help`.

Update with your actual method:

- `go install github.com/slice-soft/keel@latest`
- `brew upgrade slice-soft/tap/keel`
- manual replacement from release

## 4) `keel new ...` fails

Common cases:

- `directory '<name>' already exists`
- `project name cannot contain spaces`
- `project name is required when using --yes/-y`

Additionally, in post-setup these may fail:

- `go mod tidy` (network/proxy)
- `git init` or initial commit (git config)

## 5) `keel generate` doesn't work in my project

Validate minimum structure:

- `go.mod`
- `cmd/main.go`
- `internal/`

If missing, you'll see:

```text
keel generate must be executed inside a Keel project
```

## 6) `keel generate` fails due to existing files

Typical error:

```text
file already exists: ...
```

For non-module types, the CLI does not overwrite files. Rename/delete manually or generate another component.

## 7) `module package mismatch`

If you manually edited packages inside `internal/modules/<module>/`, this may appear:

```text
module package mismatch: expected 'x', found 'y' in <file>
```

Align the `package` of the module's files to the expected name.

## 8) `keel run <script>` says it doesn't exist

Check `keel.toml`:

- `[scripts]` must exist
- the name must match exactly
- the value cannot be empty

## 9) `keel init` does not complete Air installation

The CLI tries:

```bash
go install github.com/air-verse/air@latest
```

If it fails:

1. install Air manually,
2. verify that `air` is in `PATH`,
3. open a new terminal.

## 10) Completion doesn't work

1. Run `keel completion install`.
2. Verify that the shell file has the `source` line.
3. Open a new session.

## 11) `/docs` doesn't appear

Behavior of `ss-keel-core`: if `Env == "production"`, it does not mount `GET /docs` or `GET /docs/openapi.json`.

## 12) Port in use

`ss-keel-core` tries to find the next available port from the configured one and reports it in the logs. Check the startup output to confirm the final port.

## Quick diagnostic checklist

```bash
keel --version
keel --help
which -a keel
cat keel.toml
go test ./...
```

If the error persists, share:

- exact command executed
- complete error message
- output of `keel --version`
- relevant fragment of `keel.toml`
