---
title: Comando init
description: Inicializa keel.toml (y opcionalmente Air) en un proyecto existente.
---

## Uso

```bash
keel init
```

`init` está pensado para cuando ya tienes un proyecto y quieres adoptar el flujo de scripts de Keel.

## Comportamiento

1. Verifica que `keel.toml` no exista.
2. Pregunta si quieres usar Air para hot reload.
3. Si Air no está instalado y elegiste usarlo, intenta instalarlo con:
   ```bash
   go install github.com/air-verse/air@latest
   ```
4. Genera `keel.toml`.
5. Si usas Air y no existe `.air.toml`, también lo genera.

## Archivos generados

Siempre:
- `keel.toml`

Opcional:
- `.air.toml`

## Contenido inicial de `keel.toml`

En modo `init`, `[app]` se crea vacío para que completes tus datos:

```toml
[app]
name    = ""
version = ""
```

Además crea scripts base (`dev`, `build`, `test`, `lint`) y sección `[features]`.

## Errores comunes

- `keel.toml already exists in this directory`
  - Ya existe configuración previa.
- `failed to install Air`
  - Faltan permisos, red o configuración de Go.

## Recomendación posterior a init

1. Completa `[app]` en `keel.toml`.
2. Ajusta scripts a tu flujo real.
3. Valida:
   ```bash
   keel run test
   ```
