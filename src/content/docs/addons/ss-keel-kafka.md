---
title: ss-keel-kafka
description: Kafka messaging via franz-go — Publisher and Subscriber implementation.
---

:::caution[Coming Soon]
This addon is under development. The interfaces it implements are stable — see [Publisher / Subscriber](/reference/interfaces#publisher--subscriber).
:::

`ss-keel-kafka` provides `Publisher` and `Subscriber` implementations backed by [franz-go](https://github.com/twmb/franz-go), a high-performance Kafka client for Go.

**Implements:** [`Publisher`](/reference/interfaces#publisher--subscriber) / [`Subscriber`](/reference/interfaces#publisher--subscriber)

## Planned Installation

```bash
go get github.com/slice-soft/ss-keel-kafka
```

## Planned Usage

```go
import "github.com/slice-soft/ss-keel-kafka"

client, err := sskafka.Connect(sskafka.Config{
    Brokers:       strings.Split(os.Getenv("KAFKA_BROKERS"), ","),
    ConsumerGroup: "my-api",
})

publisher  := client.Publisher()
subscriber := client.Subscriber()
```

### Publishing

```go
payload, _ := json.Marshal(event)

publisher.Publish(ctx, core.Message{
    Topic:   "user.registered",
    Key:     []byte(user.ID),
    Payload: payload,
})
```

### Subscribing

```go
subscriber.Subscribe(ctx, "user.registered", func(ctx context.Context, msg core.Message) error {
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

## Health Check

```go
app.RegisterHealthChecker(sskafka.NewHealthChecker(client))
// → "kafka": "UP" in GET /health
```
