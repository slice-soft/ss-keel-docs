---
title: run command
description: Run scripts defined in keel.toml consistently in development and automation.
---

## Usage

```bash
keel run [script]
```

`run` takes the command from `[scripts]` in `keel.toml`.

## Configuration example

```toml
[scripts]
dev   = "air -c .air.toml"
build = "go build -o bin/my-api ./cmd/main.go"
test  = "go test ./..."
lint  = "golangci-lint run"
```

## Execution

```bash
keel run dev
keel run test
keel run build
```

You can also define your own scripts:

```toml
[scripts]
migrate = "go run ./cmd/migrate/main.go up"
```

```bash
keel run migrate
```

## How the script is executed internally

- Unix/macOS: `sh -c "<script>"`
- Windows: `cmd /C "<script>"`

This allows compound commands like `&&`, pipes, and redirections.

## Error behavior

The command fails when:

- `keel.toml` does not exist
- the `[scripts]` section does not exist
- the requested script does not exist or is empty
- the shell command returns an error

Typical errors:

- `keel.toml not found in current directory`
- `no scripts defined in keel.toml`
- `script '<name>' does not exist in keel.toml`

## Best practices

1. Keep scripts reproducible (`build`, `test`, `lint`, `dev`).
2. Avoid destructive commands without confirmation.
3. Keep `keel.toml` versioned alongside the code to standardize the team's workflow.
