---
title: ss-keel-i18n
description: Internationalization and translations with locale detection.
---

:::caution[Coming Soon]
This addon is under development. The interface it implements is stable — see [Translator](/reference/interfaces#translator).
:::

`ss-keel-i18n` provides a `Translator` implementation that loads translation files and resolves keys by locale. Locale is detected automatically from the `Accept-Language` header.

**Implements:** [`Translator`](/reference/interfaces#translator)

## Planned Installation

```bash
go get github.com/slice-soft/ss-keel-i18n
```

## Planned Usage

### Setup

```go
import "github.com/slice-soft/ss-keel-i18n"

translator, err := ssi18n.New(ssi18n.Config{
    DefaultLocale: "en",
    Path:          "./locales",  // directory with translation files
})

app.SetTranslator(translator)
```

### Translation Files

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

### Using in Handlers

```go
func (c *UserController) create(ctx *core.Ctx) error {
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

`ctx.T(key, args...)` resolves the key for the locale detected from the `Accept-Language` header. Falls back to `DefaultLocale` if the requested locale is not available.

### Reading the Current Locale

```go
locale := ctx.Lang() // "en", "es", "pt-BR"
```

### Supported Formats

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
