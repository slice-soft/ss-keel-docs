---
title: Instalacion de Mongo
description: Instala ss-keel-mongo y entiende el bootstrap generado.
---

Instala el addon con:

```bash
keel add mongo
```

Instalacion manual:

```bash
go get github.com/slice-soft/ss-keel-mongo
```

## Que genera `keel add mongo`

- Agrega `github.com/slice-soft/ss-keel-mongo` a las dependencias.
- Crea `cmd/setup_mongo.go`.
- Inyecta `mongoClient := setupMongo(app, appLogger)` en `cmd/main.go`.
- Agrega property keys y ejemplos `.env` para la conexion Mongo.

Claves generadas:

```properties
mongo.uri=${MONGO_URI:mongodb://localhost:27017}
mongo.database=${MONGO_DATABASE:app}
```

Ejemplos `.env`:

```bash
MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE=app
```
