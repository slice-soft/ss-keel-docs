---
title: Comando telemetry
description: Verifica y controla la recolección anónima de datos de uso del CLI de Keel.
---

## Uso

```bash
keel telemetry <subcomando>
```

Tres subcomandos:

```bash
keel telemetry status   # muestra la configuración actual
keel telemetry enable   # activa la recolección de datos
keel telemetry disable  # desactiva la recolección de datos
```

---

## Qué recolecta la telemetría

El CLI de Keel envía datos anónimos de uso — específicamente, el **nombre del comando** y la **versión del CLI** — cada vez que se ejecuta un comando. No se recolectan nombres de proyectos, contenidos de archivos, rutas de módulos ni información personal.

Estos datos ayudan al equipo de Keel a entender qué comandos se usan más y priorizar mejoras.

---

## `keel telemetry status`

```bash
keel telemetry status
```

Imprime si la telemetría está actualmente habilitada o deshabilitada.

```text
  ✓  telemetry is enabled
     Opt out: keel telemetry disable  or  KEEL_TELEMETRY=off
```

o:

```text
  ✗  telemetry is disabled
     Opt in:  keel telemetry enable
```

---

## `keel telemetry enable`

```bash
keel telemetry enable
```

Habilita la recolección anónima de datos de uso.

```text
  ✓  telemetry enabled — thank you!
```

Persiste la configuración en `~/.keel/config.json`.

---

## `keel telemetry disable`

```bash
keel telemetry disable
```

Deshabilita la recolección anónima de datos de uso.

```text
  ✓  telemetry disabled
     You can also set KEEL_TELEMETRY=off in your shell profile.
```

Persiste la configuración en `~/.keel/config.json`.

---

## Variable de entorno

Configura `KEEL_TELEMETRY=off` para deshabilitar la telemetría globalmente sin modificar `~/.keel/config.json`:

```bash
export KEEL_TELEMETRY=off
```

Útil en entornos CI o máquinas compartidas donde no quieres modificar el archivo de configuración.

---

## Archivo de configuración

La preferencia de telemetría se guarda en:

```
~/.keel/config.json
```

Puedes editar este archivo directamente si lo necesitas.

---

## Estado por defecto

La telemetría está **habilitada** por defecto en nuevas instalaciones. No se te pregunta al instalar — ejecuta `keel telemetry disable` o configura `KEEL_TELEMETRY=off` para desactivarla.
