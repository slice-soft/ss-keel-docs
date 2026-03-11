---
title: ss-keel-i18n
description: Internationalization and translations with locale detection.
---

:::caution[Coming Soon]
This addon is under development. The interface it implements is already stable. See [Translator](/reference/interfaces#translator).
:::

`ss-keel-i18n` provides a `Translator` implementation that loads translation files and resolves keys by locale. The locale is automatically detected from `Accept-Language`.

**Implements:** [`Translator`](/reference/interfaces#translator)

## Installation (planned)

```bash
go get github.com/slice-soft/ss-keel-i18n
```

## Usage (planned)

### Initial setup

```go
import "github.com/slice-soft/ss-keel-i18n"

translator, err := ssi18n.New(ssi18n.Config{
    DefaultLocale: "en",
    Path:          "./locales",  // folder with translation files
})

app.SetTranslator(translator)
```

### Translation files

```
locales/
├── en.json
├── es.json
└── pt-BR.json
```

```json
// locales/en.json
{
  "welcome": "Welcome, {{.Name}}!",
  "errors": {
    "user_not_found": "User not found",
    "email_taken": "This email is already in use"
  }
}
```

```json
// locales/es.json
{
  "welcome": "¡Bienvenido, {{.Name}}!",
  "errors": {
    "user_not_found": "Usuario no encontrado",
    "email_taken": "Este correo ya está en uso"
  }
}
```

### Usage in handlers

```go
func (c *UserController) create(ctx *httpx.Ctx) error {
    var dto CreateUserDTO
    if err := ctx.ParseBody(&dto); err != nil {
        return err
    }

    if emailTaken {
        // ctx.T reads Accept-Language automatically
        msg := ctx.T("errors.email_taken")
        return core.Conflict(msg)
    }

    welcome := ctx.T("welcome", dto.Name)
    return ctx.Created(map[string]string{"message": welcome})
}
```

`ctx.T(key, args...)` resolves the key for the locale detected in `Accept-Language`. If the requested locale doesn't exist, it falls back to `DefaultLocale`.

### Reading the current locale

```go
locale := ctx.Lang() // "en", "es", "pt-BR"
```

### Supported formats

| Format | Extension |
|---|---|
| JSON | `.json` |
| YAML | `.yaml` / `.yml` (planned) |
| TOML | `.toml` (planned) |

### Pluralization

```json
{
  "items": {
    "one": "{{.Count}} item",
    "other": "{{.Count}} items"
  }
}
```

```go
ctx.T("items", map[string]int{"Count": 5}) // "5 items"
ctx.T("items", map[string]int{"Count": 1}) // "1 item"
```
