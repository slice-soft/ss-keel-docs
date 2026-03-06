---
title: Autocompletado
description: Configura autocompletado de shell para Keel CLI en zsh, bash, fish y powershell.
---

## Subcomandos disponibles

```bash
keel completion bash
keel completion zsh
keel completion fish
keel completion powershell
keel completion install
```

## Instalación automática

```bash
keel completion install
```

### Qué hace `install`

1. Resuelve tu shell (`zsh`, `bash`, `fish`; en algunos flujos elige por `$SHELL` y archivos de config encontrados).
2. Genera el script de completion.
3. Lo guarda en:
   - `~/.config/keel/completion/keel.<shell>`
4. Agrega línea `source "..."` en el archivo de config del shell.

### Archivos de config candidatos

- `zsh`: `~/.zshrc`, `~/.zprofile`
- `bash`: `~/.bashrc`, `~/.bash_profile`, `~/.profile`
- `fish`: `~/.config/fish/config.fish`

Si encuentra múltiples candidatos y hay terminal interactiva, el CLI pregunta cuál actualizar.

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
keel completion powershell > $HOME\keel.ps1
. $HOME\keel.ps1
```

## Verificar

Abre una nueva terminal y prueba:

```bash
keel <TAB>
keel generate <TAB>
```

## Comportamiento idempotente

`keel completion install` evita duplicar la misma línea `source` cuando ya existe.

## Resolución rápida de problemas

- Abre una nueva sesión del shell tras instalar.
- Verifica en qué archivo se escribió el `source`.
- Si cambiaste de shell por defecto, vuelve a ejecutar `keel completion install`.
