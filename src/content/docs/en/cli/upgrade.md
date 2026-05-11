---
title: upgrade command
description: Update Keel CLI to the latest version using the detected installation source.
---

## Usage

```bash
keel upgrade
```

No arguments or flags.

---

## What it does

`keel upgrade` detects how Keel was installed and runs the appropriate update command:

| Installation source | Command executed |
|---------------------|-----------------|
| Homebrew | `brew upgrade keel` |
| `go install` | `go install github.com/slice-soft/keel@latest` |
| Unknown | Prints manual update instructions |

The detection is automatic — you don't need to specify the source.

---

## Examples

Upgrade via Homebrew:

```bash
keel upgrade
# runs: brew upgrade keel
```

Upgrade via `go install`:

```bash
keel upgrade
# runs: go install github.com/slice-soft/keel@latest
```

---

## Update notifications

When running any other `keel` command, the CLI checks for a newer version in the background. If a newer version is available, it prints a notice after the command completes:

```text
  💡 New version available: v1.19.0 (current: v1.18.0)
     Run: keel upgrade
```

This background check does not slow down the command being run.

---

## Manual update

If `keel upgrade` cannot detect the installation source, follow the manual instructions shown in the output. Alternatively:

```bash
# Homebrew
brew upgrade keel

# go install
go install github.com/slice-soft/keel@latest
```

---

## Version command

To check the current installed version before upgrading:

```bash
keel version
```

Output includes: version, commit hash, build date, Go version, OS/arch, and installation source.
