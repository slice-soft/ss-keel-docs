---
title: Comando run
description: Ejecuta scripts definidos en keel.toml de forma consistente en desarrollo y automatización.
---

## Uso

```bash
keel run [script]
```

`run` toma el comando desde `[scripts]` en `keel.toml`.

## Ejemplo de configuración

```toml
[scripts]
dev   = "air -c .air.toml"
build = "go build -o bin/my-api ./cmd/main.go"
test  = "go test ./..."
lint  = "golangci-lint run"
```

## Ejecución

```bash
keel run dev
keel run test
keel run build
```

También puedes definir scripts propios:

```toml
[scripts]
migrate = "go run ./cmd/migrate/main.go up"
```

```bash
keel run migrate
```

## Cómo ejecuta internamente el script

- Unix/macOS: `sh -c "<script>"`
- Windows: `cmd /C "<script>"`

Eso permite comandos compuestos como `&&`, pipes y redirecciones.

## Comportamiento de errores

El comando falla cuando:

- no existe `keel.toml`
- no existe sección `[scripts]`
- el script solicitado no existe o está vacío
- el comando shell devuelve error

Errores típicos:

- `keel.toml not found in current directory`
- `no scripts defined in keel.toml`
- `script '<name>' does not exist in keel.toml`

## Buenas prácticas

1. Mantén scripts reproducibles (`build`, `test`, `lint`, `dev`).
2. Evita comandos destructivos sin confirmación.
3. Deja `keel.toml` versionado junto al código para estandarizar el flujo del equipo.
