---
title: Instalacion de GORM
description: Instala ss-keel-gorm y entiende el wiring que genera Keel.
---

Instala el addon con:

```bash
keel add gorm
```

Instalacion manual:

```bash
go get github.com/slice-soft/ss-keel-gorm
```

## Que genera `keel add gorm`

- Agrega `github.com/slice-soft/ss-keel-gorm` a las dependencias.
- Crea `cmd/setup_gorm.go`.
- Inyecta `db := setupGorm(app, appLogger)` en `cmd/main.go`.
- Agrega property keys y ejemplos `.env` para la base de datos.

Claves generadas:

```properties
database.engine=${DATABASE_ENGINE:sqlite}
database.url=${DATABASE_URL:./app.db}
```

Ejemplos `.env`:

```bash
DATABASE_ENGINE=sqlite
DATABASE_URL=./app.db
```

El bootstrap generado tambien registra el health checker para que `/health` refleje la conectividad real.
