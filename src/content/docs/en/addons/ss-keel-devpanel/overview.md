---
title: DevPanel Overview
description: What ss-keel-devpanel adds for observability and addon inspection in Keel.
---

`ss-keel-devpanel` is the official observability addon for Keel.

## What you get

- A real-time browser UI mounted inside the Keel process.
- Request capture, route listing, logs, and addon event views.
- Support for addon manifests and custom panel views through the core contracts.
- Zero external UI service: the panel ships in your Go binary.

## Relevant contracts

- [`Debuggable`](/en/reference/interfaces#debuggable-and-panelregistry)
- [`PanelRegistry`](/en/reference/interfaces#debuggable-and-panelregistry)
- [`Manifestable`](/en/reference/interfaces#manifestable)
- [`PanelComponent`](/en/reference/interfaces#panelcomponent-and-debuggablewithview)

## When to use it

- Local development and staging diagnostics.
- Addon development where live event streams matter.
- Inspecting runtime config and addon manifests without extra tooling.

## Continue with

- [Installation](/en/addons/ss-keel-devpanel/installation/)
- [Configuration](/en/addons/ss-keel-devpanel/configuration/)
- [Examples](/en/addons/ss-keel-devpanel/examples/)
