---
title: Shell Completion
description: Set up shell autocompletion for Keel CLI in zsh, bash, fish, and powershell.
---

## Available subcommands

```bash
keel completion bash
keel completion zsh
keel completion fish
keel completion powershell
keel completion install
```

## Automatic installation

```bash
keel completion install
```

### What `install` does

1. Resolves your shell (`zsh`, `bash`, `fish`; in some flows it selects by `$SHELL` and found config files).
2. Generates the completion script.
3. Saves it to:
   - `~/.config/keel/completion/keel.<shell>`
4. Adds a `source "..."` line to the shell config file.

### Candidate config files

- `zsh`: `~/.zshrc`, `~/.zprofile`
- `bash`: `~/.bashrc`, `~/.bash_profile`, `~/.profile`
- `fish`: `~/.config/fish/config.fish`

If multiple candidates are found and there is an interactive terminal, the CLI asks which one to update.

## Manual installation

### Zsh

```bash
mkdir -p ~/.config/keel/completion
keel completion zsh > ~/.config/keel/completion/keel.zsh
echo 'source "$HOME/.config/keel/completion/keel.zsh"' >> ~/.zshrc
```

### Bash

```bash
mkdir -p ~/.config/keel/completion
keel completion bash > ~/.config/keel/completion/keel.bash
echo 'source "$HOME/.config/keel/completion/keel.bash"' >> ~/.bashrc
```

### Fish

```bash
mkdir -p ~/.config/keel/completion
keel completion fish > ~/.config/keel/completion/keel.fish
echo 'source "$HOME/.config/keel/completion/keel.fish"' >> ~/.config/fish/config.fish
```

### PowerShell

```powershell
keel completion powershell > $HOME\keel.ps1
. $HOME\keel.ps1
```

## Verify

Open a new terminal and test:

```bash
keel <TAB>
keel generate <TAB>
```

## Idempotent behavior

`keel completion install` avoids duplicating the same `source` line when it already exists.

## Quick troubleshooting

- Open a new shell session after installing.
- Check which file the `source` was written to.
- If you changed your default shell, run `keel completion install` again.
