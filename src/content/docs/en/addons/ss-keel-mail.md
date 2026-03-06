---
title: ss-keel-mail
description: Email sending via SMTP, Resend or SendGrid.
---

:::caution[Coming Soon]
This addon is under development. The interface it implements is already stable. See [Mailer](/reference/interfaces#mailer).
:::

`ss-keel-mail` provides a `Mailer` implementation with support for multiple transports: SMTP, [Resend](https://resend.com) and [SendGrid](https://sendgrid.com).

**Implements:** [`Mailer`](/reference/interfaces#mailer)

## Installation (planned)

```bash
go get github.com/slice-soft/ss-keel-mail
```

## Usage (planned)

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

### Send email

All transports implement the same `Mailer` interface:

```go
err := mailer.Send(ctx, core.Mail{
    To:       []string{"user@example.com"},
    Subject:  "Welcome to My App",
    HTMLBody: "<h1>Welcome!</h1><p>Thank you for signing up.</p>",
    TextBody: "Welcome. Thank you for signing up.",
})
```

### With attachments

```go
pdfData, _ := os.ReadFile("invoice.pdf")

mailer.Send(ctx, core.Mail{
    To:      []string{"user@example.com"},
    Subject: "Your invoice",
    HTMLBody: "<p>Please find your invoice attached.</p>",
    Attachments: []core.MailAttachment{
        {
            Filename:    "invoice.pdf",
            ContentType: "application/pdf",
            Data:        pdfData,
        },
    },
})
```

### Inject into module

```go
func (m *AuthModule) Register(app *core.App) {
    mailer := ssmail.NewResend(ssmail.ResendConfig{
        APIKey: os.Getenv("RESEND_API_KEY"),
        From:   "noreply@example.com",
    })
    app.RegisterController(NewAuthController(mailer))
}
```
