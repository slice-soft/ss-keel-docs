---
title: ss-keel-mail
description: Envío de correos vía SMTP, Resend o SendGrid.
---

:::caution[Próximamente]
Este addon está en desarrollo. La interfaz que implementa ya es estable. Ver [Mailer](/reference/interfaces#mailer).
:::

`ss-keel-mail` provee una implementación de `Mailer` con soporte para múltiples transportes: SMTP, [Resend](https://resend.com) y [SendGrid](https://sendgrid.com).

**Implementa:** [`Mailer`](/reference/interfaces#mailer)

## Instalación (planificada)

```bash
go get github.com/slice-soft/ss-keel-mail
```

## Uso (planificado)

### SMTP

```go
import "github.com/slice-soft/ss-keel-mail"

mailer := ssmail.NewSMTP(ssmail.SMTPConfig{
    Host:     os.Getenv("SMTP_HOST"),
    Port:     587,
    Username: os.Getenv("SMTP_USER"),
    Password: os.Getenv("SMTP_PASS"),
    From:     "noreply@example.com",
})
```

### Resend

```go
mailer := ssmail.NewResend(ssmail.ResendConfig{
    APIKey: os.Getenv("RESEND_API_KEY"),
    From:   "noreply@example.com",
})
```

### SendGrid

```go
mailer := ssmail.NewSendGrid(ssmail.SendGridConfig{
    APIKey: os.Getenv("SENDGRID_API_KEY"),
    From:   "noreply@example.com",
})
```

### Enviar correo

Todos los transportes implementan la misma interfaz `Mailer`:

```go
err := mailer.Send(ctx, core.Mail{
    To:       []string{"user@example.com"},
    Subject:  "Bienvenido a My App",
    HTMLBody: "<h1>¡Bienvenido!</h1><p>Gracias por registrarte.</p>",
    TextBody: "Bienvenido. Gracias por registrarte.",
})
```

### Con adjuntos

```go
pdfData, _ := os.ReadFile("invoice.pdf")

mailer.Send(ctx, core.Mail{
    To:      []string{"user@example.com"},
    Subject: "Tu factura",
    HTMLBody: "<p>Adjuntamos tu factura.</p>",
    Attachments: []core.MailAttachment{
        {
            Filename:    "invoice.pdf",
            ContentType: "application/pdf",
            Data:        pdfData,
        },
    },
})
```

### Inyectar en módulo

```go
func (m *AuthModule) Register(app *core.App) {
    mailer := ssmail.NewResend(ssmail.ResendConfig{
        APIKey: os.Getenv("RESEND_API_KEY"),
        From:   "noreply@example.com",
    })
    app.RegisterController(NewAuthController(mailer))
}
```
