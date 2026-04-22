---
title: Redis Installation
description: Install ss-keel-redis and understand the generated setup flow.
---

Install the addon with:

```bash
keel add redis
```

Manual install:

```bash
go get github.com/slice-soft/ss-keel-redis
```

## What `keel add redis` generates

- Adds `github.com/slice-soft/ss-keel-redis` to dependencies.
- Creates `cmd/setup_redis.go`.
- Injects `redisClient := setupRedis(app, appLogger)` into `cmd/main.go`.
- Adds the required Redis connection example to `.env`.

Generated env example:

```bash
REDIS_URL=redis://localhost:6379
```

The generated bootstrap registers the Redis health checker automatically.
