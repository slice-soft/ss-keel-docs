---
title: Comando run
description: Ejecuta scripts declarados en keel.toml para desarrollo y automatización.
---

## Uso

```bash
keel run [script]
```

`run` toma scripts desde la sección `[scripts]` de `keel.toml`.

## Ejemplo de `keel.toml`

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

También puedes agregar scripts propios:

```toml
[scripts]
migrate = "go run ./cmd/migrate/main.go up"
```

Y ejecutarlos:

```bash
keel run migrate
```

## Cómo se ejecuta internamente

- En Unix/macOS: `sh -c "<script>"`
- En Windows: `cmd /C "<script>"`

Esto significa que puedes usar comandos compuestos tal como lo harías en shell.

## Errores comunes

- `keel.toml not found in current directory`
  - Debes estar en el root del proyecto.
- `no scripts defined in keel.toml`
  - Falta sección `[scripts]`.
- `script '<name>' does not exist in keel.toml`
  - El nombre solicitado no está definido o está vacío.
