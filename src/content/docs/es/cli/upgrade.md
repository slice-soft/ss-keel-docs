---
title: Comando upgrade
description: Actualiza el CLI de Keel a la última versión usando la fuente de instalación detectada.
---

## Uso

```bash
keel upgrade
```

Sin argumentos ni flags.

---

## Qué hace

`keel upgrade` detecta cómo se instaló Keel y ejecuta el comando de actualización apropiado:

| Fuente de instalación | Comando ejecutado |
|-----------------------|------------------|
| Homebrew | `brew upgrade keel` |
| `go install` | `go install github.com/slice-soft/keel@latest` |
| Desconocida | Imprime instrucciones de actualización manual |

La detección es automática — no necesitas especificar la fuente.

---

## Ejemplos

Actualizar vía Homebrew:

```bash
keel upgrade
# ejecuta: brew upgrade keel
```

Actualizar vía `go install`:

```bash
keel upgrade
# ejecuta: go install github.com/slice-soft/keel@latest
```

---

## Notificaciones de actualización

Al ejecutar cualquier otro comando de `keel`, el CLI verifica si hay una versión más nueva en segundo plano. Si hay una versión disponible, muestra un aviso al finalizar el comando:

```text
  💡 New version available: v1.19.0 (current: v1.18.0)
     Run: keel upgrade
```

Esta verificación en segundo plano no ralentiza el comando que se está ejecutando.

---

## Actualización manual

Si `keel upgrade` no puede detectar la fuente de instalación, sigue las instrucciones manuales que muestra en el output. Alternativamente:

```bash
# Homebrew
brew upgrade keel

# go install
go install github.com/slice-soft/keel@latest
```

---

## Comando version

Para verificar la versión instalada actualmente antes de actualizar:

```bash
keel version
```

El output incluye: versión, hash de commit, fecha de build, versión de Go, OS/arch y fuente de instalación.
