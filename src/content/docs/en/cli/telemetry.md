---
title: telemetry command
description: Check and control anonymous usage data collection for Keel CLI.
---

## Usage

```bash
keel telemetry <subcommand>
```

Three subcommands:

```bash
keel telemetry status   # show current setting
keel telemetry enable   # turn on data collection
keel telemetry disable  # turn off data collection
```

---

## What telemetry collects

Keel CLI sends anonymous usage data — specifically, the **command name** and the **CLI version** — each time a command is run. No project names, file contents, module paths, or personal information are collected.

This data helps the Keel team understand which commands are most used and prioritize improvements.

---

## `keel telemetry status`

```bash
keel telemetry status
```

Prints whether telemetry is currently enabled or disabled.

```text
  ✓  telemetry is enabled
     Opt out: keel telemetry disable  or  KEEL_TELEMETRY=off
```

or:

```text
  ✗  telemetry is disabled
     Opt in:  keel telemetry enable
```

---

## `keel telemetry enable`

```bash
keel telemetry enable
```

Enables anonymous usage data collection.

```text
  ✓  telemetry enabled — thank you!
```

Persists the setting to `~/.keel/config.json`.

---

## `keel telemetry disable`

```bash
keel telemetry disable
```

Disables anonymous usage data collection.

```text
  ✓  telemetry disabled
     You can also set KEEL_TELEMETRY=off in your shell profile.
```

Persists the setting to `~/.keel/config.json`.

---

## Environment variable override

Set `KEEL_TELEMETRY=off` to disable telemetry globally without touching `~/.keel/config.json`:

```bash
export KEEL_TELEMETRY=off
```

This is useful in CI environments or shared machines where you don't want to modify the config file.

---

## Config file

Telemetry preference is stored in:

```
~/.keel/config.json
```

You can edit this file directly if needed.

---

## Default state

Telemetry is **enabled** by default on new installations. You are not prompted at install time — run `keel telemetry disable` or set `KEEL_TELEMETRY=off` to opt out.
