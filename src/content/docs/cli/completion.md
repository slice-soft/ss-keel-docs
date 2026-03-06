---
title: Completions
description: Configura autocompletado de shell para Keel CLI (zsh, bash, fish y powershell).
---

## Subcomandos

```bash
keel completion bash
keel completion zsh
keel completion fish
keel completion powershell
keel completion install
```

## Instalación automática (zsh, bash, fish)

```bash
keel completion install
```

Qué hace:

1. Detecta shell (`zsh`, `bash` o `fish`)
2. Genera script
3. Escribe el script en:
   - `~/.config/keel/completion/keel.<shell>`
4. Agrega línea `source "..."` en archivo de configuración del shell (`.zshrc`, `.bashrc`, etc.)

## Instalación manual

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
keel completion powershell > $HOME\\keel.ps1
. $HOME\\keel.ps1
```

## Verificar

Abre una nueva terminal y prueba:

```bash
keel <TAB>
keel generate <TAB>
```

## Troubleshooting

- Si no funciona tras instalar, abre una sesión nueva del shell.
- Si hay múltiples archivos de config (`.zshrc`, `.zprofile`, etc.), valida dónde quedó el `source`.
- Si quieres regenerar desde cero, borra el script en `~/.config/keel/completion/` y ejecuta `keel completion install` de nuevo.
