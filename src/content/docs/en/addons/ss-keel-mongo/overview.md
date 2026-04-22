---
title: Mongo Overview
description: What ss-keel-mongo provides for document-first persistence in Keel.
---

`ss-keel-mongo` is the official MongoDB persistence addon for Keel.

**Current stable release:** `v1.7.0` (2026-04-22)

## What you get

- `mongo.New(...)` for typed client bootstrap.
- `mongo.NewRepository[T, ID](...)` for collection-backed CRUD.
- `mongo.EntityBase` with UUID string IDs and millisecond timestamps.
- Mongo-native helpers for filter queries and direct collection access.
- `mongo.NewHealthChecker(...)` for `/health`.

## Shared contract

Like the relational addon, Mongo implements:

```go
contracts.Repository[T, ID, httpx.PageQuery, httpx.Page[T]]
```

## When to use it

- Document-first services.
- Workloads that benefit from direct filter queries and collection access.
- Projects that want to keep the same high-level Keel repository contract across different persistence backends.

## Continue with

- [Installation](/en/addons/ss-keel-mongo/installation/)
- [Configuration](/en/addons/ss-keel-mongo/configuration/)
- [Examples](/en/addons/ss-keel-mongo/examples/)
