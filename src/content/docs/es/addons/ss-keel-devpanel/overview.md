---
title: Resumen de DevPanel
description: Que agrega ss-keel-devpanel para observabilidad e inspeccion de addons en Keel.
---

`ss-keel-devpanel` es el addon oficial de observabilidad para Keel.

## Que obtienes

- Una UI en navegador montada dentro del mismo proceso Keel.
- Captura de requests, listado de rutas, logs y vistas de eventos de addons.
- Soporte para manifests y vistas custom mediante los contratos del core.
- Cero servicios UI externos: el panel vive dentro del binario Go.

## Contratos relevantes

- [`Debuggable`](/es/reference/interfaces#debuggable-y-panelregistry)
- [`PanelRegistry`](/es/reference/interfaces#debuggable-y-panelregistry)
- [`Manifestable`](/es/reference/interfaces#manifestable)
- [`PanelComponent`](/es/reference/interfaces#panelcomponent-y-debuggablewithview)

## Cuando usarlo

- Diagnostico local y en staging.
- Desarrollo de addons donde importan los eventos en vivo.
- Inspeccion de config runtime y manifests sin herramientas extra.

## Continua con

- [Instalacion](/es/addons/ss-keel-devpanel/installation/)
- [Configuracion](/es/addons/ss-keel-devpanel/configuration/)
- [Ejemplos](/es/addons/ss-keel-devpanel/examples/)
