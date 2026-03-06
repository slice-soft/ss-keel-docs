---
title: ss-keel-amqp
description: RabbitMQ messaging via amqp091-go, with Publisher and Subscriber implementations.
---

:::caution[Coming Soon]
This addon is under development. The interfaces it implements are already stable. See [Publisher / Subscriber](/reference/interfaces#publisher-and-subscriber).
:::

`ss-keel-amqp` provides `Publisher` and `Subscriber` implementations based on [amqp091-go](https://github.com/rabbitmq/amqp091-go), the official RabbitMQ client for Go.

**Implements:** [`Publisher`](/reference/interfaces#publisher-and-subscriber) / [`Subscriber`](/reference/interfaces#publisher-and-subscriber)

## Installation (planned)

```bash
go get github.com/slice-soft/ss-keel-amqp
```

## Usage (planned)

```go
import "github.com/slice-soft/ss-keel-amqp"

conn, err := ssamqp.Connect(ssamqp.Config{
    URL: os.Getenv("RABBITMQ_URL"), // amqp://user:pass@localhost:5672/
})

publisher  := conn.Publisher()
subscriber := conn.Subscriber()
```

### Publish

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

### Subscribe

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

Register shutdown hooks to close connections properly:

```go
app.OnShutdown(func(ctx context.Context) error {
    publisher.Close()
    return subscriber.Close()
})
```

## Health check

```go
app.RegisterHealthChecker(ssamqp.NewHealthChecker(conn))
// → "rabbitmq": "UP" in GET /health
```
