---
title: Instalacion de DevPanel
description: Instala ss-keel-devpanel y entiende el flujo de montaje generado.
---

Instala el addon con:

```bash
keel add devpanel
```

Instalacion manual:

```bash
go get github.com/slice-soft/ss-keel-devpanel
```

## Que genera `keel add devpanel`

- Agrega `github.com/slice-soft/ss-keel-devpanel` a las dependencias.
- Crea `cmd/setup_devpanel.go`.
- Inyecta `panel := setupDevPanel(app)` en `cmd/main.go`.
- Agrega ejemplos de variables de entorno del panel.

Ejemplos `.env`:

```bash
KEEL_PANEL_ENABLED=true
KEEL_PANEL_SECRET=
KEEL_PANEL_PATH=/keel/panel
```

Con la configuracion por defecto, abre `http://localhost:7331/keel/panel` cuando el servidor ya este corriendo.
