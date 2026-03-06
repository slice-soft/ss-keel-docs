---
title: Comando init
description: Inicializa keel.toml en proyectos existentes y configura Air de forma opcional.
---

## Uso

```bash
keel init
```

`init` no recibe argumentos ni flags.

## Cuándo usarlo

- Ya tienes un proyecto Go y quieres usar `keel run`.
- Migraste un proyecto al layout de Keel y te falta `keel.toml`.

## Comportamiento exacto

1. Verifica que `keel.toml` no exista.
2. Pregunta si deseas usar Air para hot reload.
3. Si eliges Air y no está en `PATH`, intenta instalarlo con:
   ```bash
   go install github.com/air-verse/air@latest
   ```
4. Genera `keel.toml`.
5. Si Air está habilitado y no existe `.air.toml`, lo crea.

## Archivos generados

Siempre:

- `keel.toml`

Opcional:

- `.air.toml`

## Contenido inicial de `keel.toml`

En modo `init`, la sección `[app]` se crea vacía para que la completes:

```toml
[app]
name    = ""
version = ""
```

Además incluye scripts base (`dev`, `build`, `test`, `lint`) y `[features]`.

## Variantes del script `dev`

El valor de `dev` depende de la elección de Air y del estado de `.air.toml`:

- sin Air: `dev = "go run ./cmd/main.go"`
- con Air y `.air.toml` ya existente: `dev = "air -c .air.toml"`
- con Air y `.air.toml` nuevo (creado por init): `dev = "air"`

## Ejemplo típico de adopción

```bash
cd existing-service
keel init
keel run test
```

## Errores frecuentes

- `keel.toml already exists in this directory`
- `failed to install Air: ...`
- `failed generating keel.toml: ...`

## Buenas prácticas después de `init`

1. Completa `[app]` con nombre/versión reales.
2. Revisa scripts para tu flujo real de CI/CD.
3. Ejecuta `keel run test` para validar que el proyecto ya quedó integrado.
