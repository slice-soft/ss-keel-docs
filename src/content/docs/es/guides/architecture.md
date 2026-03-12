---
title: Arquitectura
description: Arquitectura oficial de Keel a través de ss-keel-core, la capa de contratos, los addons oficiales, el CLI y los ejemplos oficiales.
---

El ecosistema oficial de Keel se organiza alrededor de cuatro piezas:

| Pieza | Repositorios | Responsabilidad |
|---|---|---|
| Core | `ss-keel-core` | Runtime, abstracciones HTTP, ciclo de vida de la app, endpoint de health, bridge OpenAPI |
| Contratos | `ss-keel-core/contracts` | Interfaces estables compartidas por el runtime, los addons y las aplicaciones |
| Addons | `ss-keel-gorm`, `ss-keel-mongo` y otros repos oficiales de addons | Integraciones opcionales de infraestructura que implementan contratos |
| CLI | `ss-keel-cli`, `ss-keel-addons`, `ss-keel-addon-template` | Scaffold de proyectos, generación de código, instalación de addons y ejecución de scripts |

Esta separación mantiene a Keel alineado con los principios de SliceSoft: arquitectura modular, límites SOLID, abstracciones DRY y separación clara entre el runtime del core y la infraestructura de addons.

## Core

El runtime vive en `ss-keel-core/core` y `ss-keel-core/core/httpx`.

- `core.New(...)` crea la app y registra el middleware por defecto.
- `app.Use(...)` registra módulos.
- `app.RegisterController(...)` registra rutas.
- `app.RegisterHealthChecker(...)`, `app.SetTracer(...)`, `app.SetTranslator(...)` y `app.SetMetricsCollector(...)` aceptan implementaciones de contratos.

Ejemplos oficiales del runtime del core:

- `ss-keel-examples/examples/01-hello-world`
- `ss-keel-examples/examples/03-health-check`
- `ss-keel-examples/examples/04-rest-crud`

Esos ejemplos muestran el runtime antes de introducir cualquier addon de persistencia.

## Contratos

El paquete `contracts` es el límite estable entre el runtime y las integraciones.

Define interfaces como:

- `Module[A]` y `Controller[R]`
- `Repository[T, ID, Q, P]`
- `HealthChecker`, `Logger`, `Guard`, `Cache`, `Mailer`, `Storage`
- `Publisher`, `Subscriber`, `Scheduler`, `Tracer`, `MetricsCollector`, `Translator`

El propósito de la capa de contratos es:

- mantener el runtime independiente de paquetes de infraestructura
- permitir que los addons oficiales se conecten al runtime sin modificar `ss-keel-core`
- dar a las aplicaciones una superficie estable de abstracción para sus adapters y límites entre módulos
- evitar acoplar módulos mediante imports cruzados de implementaciones

En el código oficial, ambos addons de persistencia prueban compatibilidad con el contrato en tiempo de compilación:

```go
var _ contracts.Repository[any, any, httpx.PageQuery, httpx.Page[any]] =
    (*database.GormRepository[any, any])(nil)

var _ contracts.Repository[any, any, httpx.PageQuery, httpx.Page[any]] =
    (*mongo.MongoRepository[any, any])(nil)
```

## Addons

Los addons son módulos Go separados que implementan contratos.

Las integraciones oficiales de persistencia hoy son:

- `ss-keel-gorm` para bases de datos relacionales vía GORM
- `ss-keel-mongo` para MongoDB vía el driver oficial de Go

Ejemplos oficiales relacionados con addons:

- `ss-keel-examples/examples/08-gorm-postgres` muestra la integración con GORM + PostgreSQL
- `ss-keel-examples/examples/10-addon-example` muestra patrones de consumo de addons y conceptos de metadata de addons

El runtime se mantiene estable mientras los addons aportan comportamiento específico de infraestructura.

## CLI

El CLI es la capa oficial de workflow del ecosistema Keel.

Según el código en `ss-keel-cli`:

- `keel new` crea un proyecto con `cmd/main.go`, `keel.toml` y opcionalmente `internal/modules/starter`
- `keel generate` crea módulos, controllers, services, repositories, middleware, guards, schedulers y más
- `keel generate repository ... --gorm` o `--mongo` usa templates oficiales de repositorio para los addons de persistencia
- `keel add <alias|repo>` resuelve aliases oficiales a través de `ss-keel-addons`, valida `keel-addon.json` y aplica los pasos de integración del addon
- `keel run <script>` ejecuta scripts definidos en `keel.toml`

El CLI no forma parte del runtime, pero sí forma parte de la arquitectura y del workflow oficial de Keel.

## Dirección de dependencias

La dirección de dependencias es intencionalmente unidireccional:

```text
aplicaciones y ejemplos
    -> importan core + contracts + paquetes addon

addons oficiales
    -> importan contracts (+ paquetes helper compartidos como core/httpx)

runtime del core
    -> importa contracts

CLI
    -> genera y conecta proyectos alrededor de core/addons, pero no es una dependencia de runtime
```

## Reglas de límites

- Mantén el ciclo de vida HTTP, enrutamiento, middleware, health y OpenAPI dentro del runtime del core.
- Mantén las interfaces compartidas en `contracts`.
- Mantén persistencia, mensajería, storage y otras preocupaciones de infraestructura en addons.
- Mantén scaffold, generación de código, instalación de addons y ejecución de scripts en el CLI.
- Prefiere abstracciones locales del módulo antes que acoplamiento entre implementaciones de módulos.

Consulta [Contratos](/es/reference/interfaces) para el catálogo de contratos y [Persistencia](/es/guides/persistence) para las integraciones oficiales de persistencia.
