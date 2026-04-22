---
title: OAuth Overview
description: What ss-keel-oauth provides for provider login flows in Keel.
---

`ss-keel-oauth` is the official OAuth2 addon for Keel.

**Current stable release:** `v1.10.0` (2026-04-22)  
**Depends on:** [`ss-keel-jwt`](/en/addons/ss-keel-jwt/)

## What you get

- Provider login flows for Google, GitHub, and GitLab.
- Automatic JWT signing after a successful callback.
- JSON and frontend redirect callback modes.
- Generated typed config for provider credentials and route normalization.

## When to use it

- Social login or SSO-style entry points for browser apps.
- API backends that want a signed JWT returned after provider auth.
- Keel services that already use `ss-keel-jwt` for protected routes.

## Core flow

1. User hits `/auth/<provider>`.
2. Provider callback returns to the generated Keel route.
3. The addon normalizes the user info.
4. `jwtProvider` signs the final token.

## Continue with

- [Installation](/en/addons/ss-keel-oauth/installation/)
- [Configuration](/en/addons/ss-keel-oauth/configuration/)
- [Examples](/en/addons/ss-keel-oauth/examples/)
