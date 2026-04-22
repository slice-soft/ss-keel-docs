---
title: Resumen de GORM
description: Que provee ss-keel-gorm para persistencia relacional en Keel.
---

`ss-keel-gorm` es el addon oficial de persistencia relacional para Keel.

**Release estable actual:** `v1.7.0` (2026-04-22)

## Que obtienes

- `database.New(...)` para bootstrap tipado de base de datos.
- `database.GormRepository[T, ID]` implementando el contrato compartido.
- `database.EntityBase` para campos comunes de persistencia.
- `database.NewHealthChecker(...)` para `/health`.
- Soporte para PostgreSQL, MySQL, MariaDB, SQLite, SQL Server y dialectors personalizados.

## Contrato compartido

El addon implementa el mismo contrato de persistencia usado en Keel:

```go
contracts.Repository[T, ID, httpx.PageQuery, httpx.Page[T]]
```

## Cuando usarlo

- Servicios SQL-first con datos relacionales.
- Proyectos que quieren bootstrap generado mas acceso completo a GORM.
- Apps que necesitan un contrato de repositorio estandar con espacio para queries custom.

## Continua con

- [Instalacion](/es/addons/ss-keel-gorm/installation/)
- [Configuracion](/es/addons/ss-keel-gorm/configuration/)
- [Ejemplos](/es/addons/ss-keel-gorm/examples/)
