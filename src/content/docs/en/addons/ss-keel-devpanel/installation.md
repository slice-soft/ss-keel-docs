---
title: DevPanel Installation
description: Install ss-keel-devpanel and understand the generated mounting flow.
---

Install the addon with:

```bash
keel add devpanel
```

Manual install:

```bash
go get github.com/slice-soft/ss-keel-devpanel
```

## What `keel add devpanel` generates

- Adds `github.com/slice-soft/ss-keel-devpanel` to dependencies.
- Creates `cmd/setup_devpanel.go`.
- Injects `panel := setupDevPanel(app)` into `cmd/main.go`.
- Adds panel-related env examples.

Generated env examples:

```bash
KEEL_PANEL_ENABLED=true
KEEL_PANEL_SECRET=
KEEL_PANEL_PATH=/keel/panel
```

With the default config, open `http://localhost:7331/keel/panel` after the server starts.
