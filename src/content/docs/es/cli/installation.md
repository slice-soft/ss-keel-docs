---
title: Instalación
description: Instala Keel CLI con Homebrew tap, go install o binarios de GitHub Releases.
---

## Métodos soportados

| Método | Cuándo usarlo |
|---|---|
| Homebrew tap | **Recomendado** · macOS/Linux, gestiona actualizaciones automáticamente |
| `go install` | Si tu entorno principal es Go y quieres actualización rápida |
| GitHub Releases | Si prefieres instalar un binario manual por plataforma |

## Opción 1: Homebrew tap — recomendada (macOS/Linux)

El pipeline de release del CLI publica la fórmula `keel` en el tap:

- Repo del tap: `slice-soft/homebrew-tap`
- Tap name: `slice-soft/tap`
- Fórmula: `keel`

Instalar:

```bash
brew tap slice-soft/tap
brew install slice-soft/tap/keel
```

Validar:

```bash
keel --version
```

Actualizar:

```bash
brew update
brew upgrade slice-soft/tap/keel
```

## Opción 2: `go install`

Requiere Go `1.25+` y Git.

Instalar última versión:

```bash
go install github.com/slice-soft/keel@latest
```

Instalar versión específica:

```bash
go install github.com/slice-soft/keel@v1.0.0
```

Validar:

```bash
keel --version
keel --help
```

### Si `keel` no aparece en PATH

```bash
go env GOBIN
go env GOPATH
```

Si `GOBIN` está vacío, normalmente el binario queda en `$(go env GOPATH)/bin`.

## Opción 3: Binario desde GitHub Releases

1. Abre [github.com/slice-soft/keel/releases](https://github.com/slice-soft/keel/releases).
2. Descarga el artefacto de tu plataforma.

Según la configuración de release, los nombres de archivo son:

- Linux/macOS: `keel_<os>_<arch>.tar.gz`
- Windows: `keel_windows_<arch>.zip`

### Linux/macOS

```bash
# ejemplo: reemplaza por el archivo descargado
tar -xzf keel_darwin_arm64.tar.gz
chmod +x keel
sudo mv keel /usr/local/bin/keel
```

### Windows (PowerShell)

```powershell
# ejemplo: reemplaza por el archivo descargado
Expand-Archive .\keel_windows_amd64.zip -DestinationPath .\keel-bin
Move-Item .\keel-bin\keel.exe $HOME\bin\keel.exe
```

Asegúrate de tener el directorio de destino dentro de `PATH`.

:::caution[Advertencia de seguridad en macOS]
El binario de Keel aún no está firmado con código — obtener un certificado de Apple Developer es un costo que mantenemos fuera de presupuesto mientras el proyecto está en etapas tempranas. Por este motivo, macOS Gatekeeper bloqueará la primera ejecución con una advertencia de seguridad.

Para permitirlo, abre **Configuración del Sistema → Privacidad y seguridad**, desplázate hasta la entrada del app bloqueado y haz clic en **Abrir de todas formas**. Alternativamente, elimina el atributo de cuarentena antes de mover el binario:

```bash
xattr -d com.apple.quarantine ./keel
```

Este es un paso de una sola vez por instalación. Si prefieres evitarlo por completo, usa el Homebrew tap (Opción 1), que gestiona esto de forma transparente.
:::

## Verificación completa

```bash
which -a keel
keel --version
keel --help
```

Debes ver, al menos, los comandos:

- `new`
- `init`
- `generate`
- `run`
- `completion`

## Actualización por método

- Si instalaste con Homebrew: `brew upgrade slice-soft/tap/keel`
- Si instalaste con `go install`: vuelve a ejecutar `go install github.com/slice-soft/keel@latest`
- Si instalaste por release manual: descarga e instala el nuevo binario

:::caution[Nota sobre mensajes de actualización]
Si ves sugerencias del tipo `Update with: keel upgrade`, prioriza el método de instalación que usaste. El binario actual no expone `keel upgrade` como subcomando.
:::

## Evitar conflictos de múltiples instalaciones

Si tienes más de un binario `keel` en tu máquina:

```bash
which -a keel
```

Deja solo una instalación activa para evitar inconsistencias de versión.
