---
title: ss-keel-kafka
description: Mensajería Kafka vía franz-go con implementación de Publisher y Subscriber.
---

:::caution[Próximamente]
Este addon está en desarrollo. Las interfaces que implementa ya son estables. Ver [Publisher / Subscriber](/reference/interfaces#publisher-y-subscriber).
:::

`ss-keel-kafka` provee implementaciones de `Publisher` y `Subscriber` basadas en [franz-go](https://github.com/twmb/franz-go), un cliente Kafka de alto rendimiento para Go.

**Implementa:** [`Publisher`](/reference/interfaces#publisher-y-subscriber) / [`Subscriber`](/reference/interfaces#publisher-y-subscriber)

## Instalación (planificada)

```bash
go get github.com/slice-soft/ss-keel-kafka
```

## Uso (planificado)

```go
import "github.com/slice-soft/ss-keel-kafka"

client, err := sskafka.Connect(sskafka.Config{
    Brokers:       strings.Split(os.Getenv("KAFKA_BROKERS"), ","),
    ConsumerGroup: "my-api",
})

publisher  := client.Publisher()
subscriber := client.Subscriber()
```

### Publicar

```go
payload, _ := json.Marshal(event)

publisher.Publish(ctx, contracts.Message{
    Topic:   "user.registered",
    Key:     []byte(user.ID),
    Payload: payload,
})
```

### Suscribirse

```go
subscriber.Subscribe(ctx, "user.registered", func(ctx context.Context, msg contracts.Message) error {
    var user User
    json.Unmarshal(msg.Payload, &user)
    return sendWelcomeEmail(ctx, &user)
})
```

### Shutdown

```go
app.OnShutdown(func(ctx context.Context) error {
    publisher.Close()
    return subscriber.Close()
})
```

## Verificación de salud

```go
app.RegisterHealthChecker(sskafka.NewHealthChecker(client))
// → "kafka": "UP" en GET /health
```
