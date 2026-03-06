---
title: Installation
description: Install Keel CLI with go install, Homebrew tap, or GitHub Releases binaries.
---

## Supported methods

| Method | When to use |
|---|---|
| `go install` | If your primary environment is Go and you want quick updates |
| Homebrew tap | If you manage tooling with Homebrew (macOS/Linux) |
| GitHub Releases | If you prefer installing a manual binary per platform |

## Requirements

- Go `1.25+`
- Git
- Network access to the module or GitHub releases

## Option 1: `go install` (recommended)

Install the latest version:

```bash
go install github.com/slice-soft/keel@latest
```

Install a specific version:

```bash
go install github.com/slice-soft/keel@v1.0.0
```

Validate:

```bash
keel --version
keel --help
```

### If `keel` doesn't appear in PATH

```bash
go env GOBIN
go env GOPATH
```

If `GOBIN` is empty, the binary is usually at `$(go env GOPATH)/bin`.

## Option 2: Homebrew tap (macOS/Linux)

The CLI release pipeline publishes the `keel` formula in the tap:

- Tap repo: `slice-soft/homebrew-tap`
- Tap name: `slice-soft/tap`
- Formula: `keel`

Install:

```bash
brew tap slice-soft/tap
brew install slice-soft/tap/keel
```

Validate:

```bash
keel --version
```

Update:

```bash
brew update
brew upgrade slice-soft/tap/keel
```

## Option 3: Binary from GitHub Releases

1. Open [github.com/slice-soft/keel/releases](https://github.com/slice-soft/keel/releases).
2. Download the artifact for your platform.

Depending on the release configuration, file names are:

- Linux/macOS: `keel_<os>_<arch>.tar.gz`
- Windows: `keel_windows_<arch>.zip`

### Linux/macOS

```bash
# example: replace with your downloaded file
tar -xzf keel_darwin_arm64.tar.gz
chmod +x keel
sudo mv keel /usr/local/bin/keel
```

### Windows (PowerShell)

```powershell
# example: replace with your downloaded file
Expand-Archive .\keel_windows_amd64.zip -DestinationPath .\keel-bin
Move-Item .\keel-bin\keel.exe $HOME\bin\keel.exe
```

Make sure the destination directory is in your `PATH`.

## Full verification

```bash
which -a keel
keel --version
keel --help
```

You should see at least these commands:

- `new`
- `init`
- `generate`
- `run`
- `completion`

## Updating by method

- If installed with `go install`: run `go install github.com/slice-soft/keel@latest` again
- If installed with Homebrew: `brew upgrade slice-soft/tap/keel`
- If installed via manual release: download and install the new binary

:::caution[Note on update messages]
If you see suggestions like `Update with: keel upgrade`, prioritize the installation method you used. The current binary does not expose `keel upgrade` as a subcommand.
:::

## Avoiding conflicts from multiple installations

If you have more than one `keel` binary on your machine:

```bash
which -a keel
```

Keep only one active installation to avoid version inconsistencies.
