---
title: Redis Overview
description: What ss-keel-redis provides for cache integration in Keel.
---

`ss-keel-redis` is the official cache addon for Keel.

**Implements:** [`Cache`](/en/reference/interfaces#cache)

## What you get

- `ssredis.New(...)` for Redis client bootstrap.
- A `contracts.Cache` implementation backed by go-redis v9.
- `ssredis.NewHealthChecker(...)` for `/health`.
- Access to the raw client through `RDB()` when the generic cache contract is not enough.

## When to use it

- Cache-aside reads in service code.
- TTL-based caching for API responses or entities.
- A small cache surface in modules while keeping the option to drop down to the full Redis client.

## Continue with

- [Installation](/en/addons/ss-keel-redis/installation/)
- [Configuration](/en/addons/ss-keel-redis/configuration/)
- [Examples](/en/addons/ss-keel-redis/examples/)
