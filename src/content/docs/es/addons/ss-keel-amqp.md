---
title: ss-keel-amqp
description: Mensajería RabbitMQ vía amqp091-go, con implementación de Publisher y Subscriber.
---

:::caution[Próximamente]
Este addon está en desarrollo. Las interfaces que implementa ya son estables. Ver [Publisher / Subscriber](/reference/interfaces#publisher-y-subscriber).
:::

`ss-keel-amqp` provee implementaciones de `Publisher` y `Subscriber` basadas en [amqp091-go](https://github.com/rabbitmq/amqp091-go), el cliente oficial de RabbitMQ para Go.

**Implementa:** [`Publisher`](/reference/interfaces#publisher-y-subscriber) / [`Subscriber`](/reference/interfaces#publisher-y-subscriber)

## Instalación (planificada)

```bash
go get github.com/slice-soft/ss-keel-amqp
```

## Uso (planificado)

```go
import "github.com/slice-soft/ss-keel-amqp"

conn, err := ssamqp.Connect(ssamqp.Config{
    URL: os.Getenv("RABBITMQ_URL"), // amqp://user:pass@localhost:5672/
})

publisher  := conn.Publisher()
subscriber := conn.Subscriber()
```

### Publicar

```go
payload, _ := json.Marshal(order)

publisher.Publish(ctx, core.Message{
    Topic:   "orders.created",
    Key:     []byte(order.ID),
    Payload: payload,
    Headers: map[string]string{
        "content-type": "application/json",
    },
})
```

### Suscribirse

```go
subscriber.Subscribe(ctx, "orders.created", func(ctx context.Context, msg core.Message) error {
    var order Order
    if err := json.Unmarshal(msg.Payload, &order); err != nil {
        return err
    }
    return processOrder(ctx, &order)
})
```

### Shutdown

Registra hooks de apagado para cerrar conexiones correctamente:

```go
app.OnShutdown(func(ctx context.Context) error {
    publisher.Close()
    return subscriber.Close()
})
```

## Verificación de salud

```go
app.RegisterHealthChecker(ssamqp.NewHealthChecker(conn))
// → "rabbitmq": "UP" en GET /health
```
