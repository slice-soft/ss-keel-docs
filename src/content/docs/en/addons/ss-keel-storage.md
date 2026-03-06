---
title: ss-keel-storage
description: Unified object storage for S3, Google Cloud Storage and local disk.
---

:::caution[Coming Soon]
This addon is under development. The interface it implements is already stable. See [Storage](/reference/interfaces#storage).
:::

`ss-keel-storage` provides a `Storage` implementation with a unified API for AWS S3, Google Cloud Storage (GCS), and local disk. You can switch providers via configuration without changing application code.

**Implements:** [`Storage`](/reference/interfaces#storage)

## Installation (planned)

```bash
go get github.com/slice-soft/ss-keel-storage
```

## Usage (planned)

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

### Local disk (development)

```go
storage, err := ssstorage.NewLocal(ssstorage.LocalConfig{
    BaseDir: "./uploads",
    BaseURL: "http://localhost:3000/uploads",
})
```

### Using Storage

All providers share the same interface:

```go
// Upload
file, _ := c.FormFile("avatar")
src, _ := file.Open()
defer src.Close()

err := storage.Put(ctx, "avatars/"+userID+".jpg", src, file.Size, "image/jpeg")

// Signed URL (expires in 1 hour)
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

### In a handler

```go
func (c *AvatarController) upload(ctx *core.Ctx) error {
    file, err := ctx.FormFile("avatar")
    if err != nil {
        return core.BadRequest("no file received")
    }

    src, _ := file.Open()
    defer src.Close()

    key := fmt.Sprintf("avatars/%s.jpg", uuid.New())
    if err := c.storage.Put(ctx.Context(), key, src, file.Size, file.Header.Get("Content-Type")); err != nil {
        return core.Internal("upload failed", err)
    }

    url, _ := c.storage.URL(ctx.Context(), key, 365*24*time.Hour)
    return ctx.Created(map[string]string{"url": url})
}
```
