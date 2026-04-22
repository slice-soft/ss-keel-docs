---
title: GORM Overview
description: What ss-keel-gorm provides for relational persistence in Keel.
---

`ss-keel-gorm` is the official relational persistence addon for Keel.

**Current stable release:** `v1.7.0` (2026-04-22)

## What you get

- `database.New(...)` for typed database bootstrap.
- `database.GormRepository[T, ID]` implementing the shared repository contract.
- `database.EntityBase` for common persistence fields.
- `database.NewHealthChecker(...)` for `/health`.
- Support for PostgreSQL, MySQL, MariaDB, SQLite, SQL Server, and custom dialectors.

## Shared contract

The addon implements the same persistence contract used across Keel:

```go
contracts.Repository[T, ID, httpx.PageQuery, httpx.Page[T]]
```

## When to use it

- SQL-first services with relational data.
- Projects that want a generated bootstrap plus GORM access.
- Apps that need a standard repository contract with room for custom queries.

## Continue with

- [Installation](/en/addons/ss-keel-gorm/installation/)
- [Configuration](/en/addons/ss-keel-gorm/configuration/)
- [Examples](/en/addons/ss-keel-gorm/examples/)
