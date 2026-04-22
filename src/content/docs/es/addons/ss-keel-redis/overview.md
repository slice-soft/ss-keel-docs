---
title: Resumen de Redis
description: Que provee ss-keel-redis para integrar cache en Keel.
---

`ss-keel-redis` es el addon oficial de cache para Keel.

**Implementa:** [`Cache`](/es/reference/interfaces#cache)

## Que obtienes

- `ssredis.New(...)` para bootstrap del cliente Redis.
- Una implementacion de `contracts.Cache` sobre go-redis v9.
- `ssredis.NewHealthChecker(...)` para `/health`.
- Acceso al cliente crudo mediante `RDB()` cuando el contrato generico no alcanza.

## Cuando usarlo

- Lecturas cache-aside en servicios.
- Caches con TTL para respuestas API o entidades.
- Un surface pequeno de cache en modulos con opcion de bajar al cliente Redis completo.

## Continua con

- [Instalacion](/es/addons/ss-keel-redis/installation/)
- [Configuracion](/es/addons/ss-keel-redis/configuration/)
- [Ejemplos](/es/addons/ss-keel-redis/examples/)
