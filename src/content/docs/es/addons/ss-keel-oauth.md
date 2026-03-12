---
title: ss-keel-oauth
description: Autenticación OAuth2 con Google, GitHub y otros proveedores.
---

:::caution[Próximamente]
Este addon está en desarrollo. La interfaz que implementa ya es estable. Ver [Guard](/es/reference/interfaces#guard).
:::

`ss-keel-oauth` provee middleware de autenticación OAuth2 con soporte para proveedores populares. Tras un flujo OAuth exitoso, el perfil autenticado se guarda en contexto de request con `SetUser`, compatible con `UserAs[T]`.

**Implementa:** [`Guard`](/es/reference/interfaces#guard)

## Instalación (planificada)

```bash
go get github.com/slice-soft/ss-keel-oauth
```

## Proveedores (planificados)

| Proveedor | Estado |
|---|---|
| Google | Planificado |
| GitHub | Planificado |
| Microsoft | Planificado |
| Discord | Planificado |
| Custom (cualquier OAuth2) | Planificado |

## Uso (planificado)

```go
import "github.com/slice-soft/ss-keel-oauth"

oauth := ssoauth.New(ssoauth.Config{
    Google: &ssoauth.ProviderConfig{
        ClientID:     os.Getenv("GOOGLE_CLIENT_ID"),
        ClientSecret: os.Getenv("GOOGLE_CLIENT_SECRET"),
        RedirectURL:  "https://myapp.com/auth/google/callback",
        Scopes:       []string{"email", "profile"},
    },
    GitHub: &ssoauth.ProviderConfig{
        ClientID:     os.Getenv("GITHUB_CLIENT_ID"),
        ClientSecret: os.Getenv("GITHUB_CLIENT_SECRET"),
        RedirectURL:  "https://myapp.com/auth/github/callback",
    },
})

// Registra rutas OAuth (redirect + callbacks)
app.Use(oauth)
```

### Acceder al usuario OAuth

```go
func callbackHandler(c *httpx.Ctx) error {
    profile, ok := core.UserAs[*ssoauth.Profile](c)
    if !ok {
        return core.Unauthorized("oauth falló")
    }

    // profile.Provider — "google", "github"
    // profile.ID
    // profile.Email
    // profile.Name
    // profile.AvatarURL
}
```

## Rutas generadas

El addon registra automáticamente:

| Ruta | Descripción |
|---|---|
| `GET /auth/{provider}` | Redirige al proveedor |
| `GET /auth/{provider}/callback` | Procesa callback OAuth |
