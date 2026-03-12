---
title: ss-keel-i18n
description: Internacionalización y traducciones con detección de locale.
---

:::caution[Próximamente]
Este addon está en desarrollo. La interfaz que implementa ya es estable. Ver [Translator](/es/reference/interfaces#translator).
:::

`ss-keel-i18n` provee una implementación de `Translator` que carga archivos de traducción y resuelve claves por locale. El locale se detecta automáticamente desde `Accept-Language`.

**Implementa:** [`Translator`](/es/reference/interfaces#translator)

## Instalación (planificada)

```bash
go get github.com/slice-soft/ss-keel-i18n
```

## Uso (planificado)

### Configuración inicial

```go
import "github.com/slice-soft/ss-keel-i18n"

translator, err := ssi18n.New(ssi18n.Config{
    DefaultLocale: "en",
    Path:          "./locales",  // carpeta con archivos de traducción
})

app.SetTranslator(translator)
```

### Archivos de traducción

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

### Uso en handlers

```go
func (c *UserController) create(ctx *httpx.Ctx) error {
    var dto CreateUserDTO
    if err := ctx.ParseBody(&dto); err != nil {
        return err
    }

    if emailTaken {
        // ctx.T lee Accept-Language automáticamente
        msg := ctx.T("errors.email_taken")
        return core.Conflict(msg)
    }

    welcome := ctx.T("welcome", dto.Name)
    return ctx.Created(map[string]string{"message": welcome})
}
```

`ctx.T(key, args...)` resuelve la clave para el locale detectado en `Accept-Language`. Si el locale solicitado no existe, cae al `DefaultLocale`.

### Leer locale actual

```go
locale := ctx.Lang() // "en", "es", "pt-BR"
```

### Formatos soportados

| Formato | Extensión |
|---|---|
| JSON | `.json` |
| YAML | `.yaml` / `.yml` (planificado) |
| TOML | `.toml` (planificado) |

### Pluralización

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
