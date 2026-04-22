---
title: Mongo Installation
description: Install ss-keel-mongo and understand the generated bootstrap.
---

Install the addon with:

```bash
keel add mongo
```

Manual install:

```bash
go get github.com/slice-soft/ss-keel-mongo
```

## What `keel add mongo` generates

- Adds `github.com/slice-soft/ss-keel-mongo` to dependencies.
- Creates `cmd/setup_mongo.go`.
- Injects `mongoClient := setupMongo(app, appLogger)` into `cmd/main.go`.
- Adds property keys and `.env` examples for the Mongo connection.

Generated config keys:

```properties
mongo.uri=${MONGO_URI:mongodb://localhost:27017}
mongo.database=${MONGO_DATABASE:app}
```

Generated env examples:

```bash
MONGO_URI=mongodb://localhost:27017
MONGO_DATABASE=app
```
