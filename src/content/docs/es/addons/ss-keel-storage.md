---
title: ss-keel-storage
description: Almacenamiento de objetos unificado para S3, Google Cloud Storage y disco local.
---

:::caution[Próximamente]
Este addon está en desarrollo. La interfaz que implementa ya es estable. Ver [Storage](/reference/interfaces#storage).
:::

`ss-keel-storage` provee una implementación de `Storage` con API unificada para AWS S3, Google Cloud Storage (GCS) y disco local. Puedes cambiar proveedor con configuración sin cambiar código de aplicación.

**Implementa:** [`Storage`](/reference/interfaces#storage)

## Instalación (planificada)

```bash
go get github.com/slice-soft/ss-keel-storage
```

## Uso (planificado)

### AWS S3

```go
import "github.com/slice-soft/ss-keel-storage"

storage, err := ssstorage.NewS3(ssstorage.S3Config{
    Bucket:    os.Getenv("S3_BUCKET"),
    Region:    os.Getenv("AWS_REGION"),
    AccessKey: os.Getenv("AWS_ACCESS_KEY_ID"),
    SecretKey: os.Getenv("AWS_SECRET_ACCESS_KEY"),
})
```

### Google Cloud Storage

```go
storage, err := ssstorage.NewGCS(ssstorage.GCSConfig{
    Bucket:          os.Getenv("GCS_BUCKET"),
    CredentialsFile: os.Getenv("GOOGLE_APPLICATION_CREDENTIALS"),
})
```

### Disco local (desarrollo)

```go
storage, err := ssstorage.NewLocal(ssstorage.LocalConfig{
    BaseDir: "./uploads",
    BaseURL: "http://localhost:3000/uploads",
})
```

### Uso de Storage

Todos los proveedores comparten la misma interfaz:

```go
// Upload
file, _ := c.FormFile("avatar")
src, _ := file.Open()
defer src.Close()

err := storage.Put(ctx, "avatars/"+userID+".jpg", src, file.Size, "image/jpeg")

// URL firmada (expira en 1 hora)
url, err := storage.URL(ctx, "avatars/"+userID+".jpg", time.Hour)

// Download
reader, err := storage.Get(ctx, "avatars/"+userID+".jpg")
defer reader.Close()

// Delete
err := storage.Delete(ctx, "avatars/"+userID+".jpg")

// File info
obj, err := storage.Stat(ctx, "avatars/"+userID+".jpg")
// obj.Size, obj.ContentType, obj.LastModified
```

### En un handler

```go
func (c *AvatarController) upload(ctx *core.Ctx) error {
    file, err := ctx.FormFile("avatar")
    if err != nil {
        return core.BadRequest("no se recibió archivo")
    }

    src, _ := file.Open()
    defer src.Close()

    key := fmt.Sprintf("avatars/%s.jpg", uuid.New())
    if err := c.storage.Put(ctx.Context(), key, src, file.Size, file.Header.Get("Content-Type")); err != nil {
        return core.Internal("falló upload", err)
    }

    url, _ := c.storage.URL(ctx.Context(), key, 365*24*time.Hour)
    return ctx.Created(map[string]string{"url": url})
}
```
