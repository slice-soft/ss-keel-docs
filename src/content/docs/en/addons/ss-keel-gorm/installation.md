---
title: GORM Installation
description: Install ss-keel-gorm and understand the generated Keel wiring.
---

Install the addon with:

```bash
keel add gorm
```

Manual install:

```bash
go get github.com/slice-soft/ss-keel-gorm
```

## What `keel add gorm` generates

- Adds `github.com/slice-soft/ss-keel-gorm` to dependencies.
- Creates `cmd/setup_gorm.go`.
- Injects `db := setupGorm(app, appLogger)` into `cmd/main.go`.
- Adds database property keys and `.env` examples.

Generated config keys:

```properties
database.engine=${DATABASE_ENGINE:sqlite}
database.url=${DATABASE_URL:./app.db}
```

Generated env examples:

```bash
DATABASE_ENGINE=sqlite
DATABASE_URL=./app.db
```

The generated bootstrap also registers the built-in health checker so `/health` reflects database connectivity.
