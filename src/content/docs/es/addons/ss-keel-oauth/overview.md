---
title: Resumen de OAuth
description: Que provee ss-keel-oauth para flujos de login con proveedores en Keel.
---

`ss-keel-oauth` es el addon oficial OAuth2 para Keel.

**Release estable actual:** `v1.10.0` (2026-04-22)  
**Depende de:** [`ss-keel-jwt`](/es/addons/ss-keel-jwt/)

## Que obtienes

- Flujos de login con Google, GitHub y GitLab.
- Firma automatica de JWT despues de un callback exitoso.
- Modos de respuesta JSON y redirect al frontend.
- Configuracion tipada generada para credenciales y normalizacion de rutas.

## Cuando usarlo

- Social login o entry points tipo SSO para apps web.
- Backends API que quieren devolver un JWT firmado despues del auth del proveedor.
- Servicios Keel que ya usan `ss-keel-jwt` para proteger rutas.

## Flujo principal

1. El usuario entra a `/auth/<provider>`.
2. El proveedor hace callback a la ruta generada por Keel.
3. El addon normaliza la informacion del usuario.
4. `jwtProvider` firma el token final.

## Continua con

- [Instalacion](/es/addons/ss-keel-oauth/installation/)
- [Configuracion](/es/addons/ss-keel-oauth/configuration/)
- [Ejemplos](/es/addons/ss-keel-oauth/examples/)
