---
title: Resumen de Mongo
description: Que provee ss-keel-mongo para persistencia document-first en Keel.
---

`ss-keel-mongo` es el addon oficial de persistencia MongoDB para Keel.

**Release estable actual:** `v1.7.0` (2026-04-22)

## Que obtienes

- `mongo.New(...)` para bootstrap tipado del cliente.
- `mongo.NewRepository[T, ID](...)` para CRUD respaldado por colecciones.
- `mongo.EntityBase` con IDs UUID string y timestamps en milisegundos.
- Helpers nativos de Mongo para filtros y acceso directo a colecciones.
- `mongo.NewHealthChecker(...)` para `/health`.

## Contrato compartido

Igual que el addon relacional, Mongo implementa:

```go
contracts.Repository[T, ID, httpx.PageQuery, httpx.Page[T]]
```

## Cuando usarlo

- Servicios document-first.
- Cargas que se benefician de filtros y acceso directo a colecciones.
- Proyectos que quieren mantener el mismo contrato alto nivel en distintos backends.

## Continua con

- [Instalacion](/es/addons/ss-keel-mongo/installation/)
- [Configuracion](/es/addons/ss-keel-mongo/configuration/)
- [Ejemplos](/es/addons/ss-keel-mongo/examples/)
