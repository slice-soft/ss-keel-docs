---
title: Ejemplos de Redis
description: Uso real de cache-aside con ss-keel-redis en el repositorio oficial de ejemplos.
---

El proyecto ejecutable oficial es [`ss-keel-examples/examples/14-redis-cache`](https://github.com/slice-soft/ss-keel-examples/tree/main/examples/14-redis-cache).

## Lectura cache-aside

```go
cached, err := s.cache.Get(ctx, cacheKey)
if err != nil {
    s.log.Warn("redis get failed [key=%s]: %v", cacheKey, err)
} else if cached != nil {
    var note Note
    if err := json.Unmarshal(cached, &note); err == nil {
        return &note, "cache", nil
    }
}
```

## Repoblar en cache miss

```go
payload, err := json.Marshal(note)
if err != nil {
    return nil, "", err
}
if err := s.cache.Set(ctx, cacheKey, payload, s.ttl); err != nil {
    s.log.Warn("redis set failed [key=%s]: %v", cacheKey, err)
}
```

## Invalidar al escribir

```go
if err := s.cache.Delete(ctx, noteCacheKey(saved.ID)); err != nil {
    s.log.Warn("redis delete failed [key=%s]: %v", noteCacheKey(saved.ID), err)
}
```
