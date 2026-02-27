---
title: ss-keel-amqp
description: RabbitMQ messaging via amqp091-go — Publisher and Subscriber implementation.
---

:::caution[Coming Soon]
This addon is under development. The interfaces it implements are stable — see [Publisher / Subscriber](/reference/interfaces#publisher--subscriber).
:::

`ss-keel-amqp` provides `Publisher` and `Subscriber` implementations backed by [amqp091-go](https://github.com/rabbitmq/amqp091-go), the official RabbitMQ Go client.

**Implements:** [`Publisher`](/reference/interfaces#publisher--subscriber) / [`Subscriber`](/reference/interfaces#publisher--subscriber)

## Planned Installation

```bash
go get github.com/slice-soft/ss-keel-amqp
```

## Planned Usage

```go
import "github.com/slice-soft/ss-keel-amqp"

conn, err := ssamqp.Connect(ssamqp.Config{
    URL: os.Getenv("RABBITMQ_URL"), // amqp://user:pass@localhost:5672/
})

publisher  := conn.Publisher()
subscriber := conn.Subscriber()
```

### Publishing

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

### Subscribing

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

Register shutdown hooks so connections close cleanly:

```go
app.OnShutdown(func(ctx context.Context) error {
    publisher.Close()
    return subscriber.Close()
})
```

## Health Check

```go
app.RegisterHealthChecker(ssamqp.NewHealthChecker(conn))
// → "rabbitmq": "UP" in GET /health
```
