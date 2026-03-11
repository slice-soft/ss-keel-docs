---
title: ss-keel-kafka
description: Kafka messaging via franz-go with Publisher and Subscriber implementations.
---

:::caution[Coming Soon]
This addon is under development. The interfaces it implements are already stable. See [Publisher / Subscriber](/reference/interfaces#publisher-and-subscriber).
:::

`ss-keel-kafka` provides `Publisher` and `Subscriber` implementations based on [franz-go](https://github.com/twmb/franz-go), a high-performance Kafka client for Go.

**Implements:** [`Publisher`](/reference/interfaces#publisher-and-subscriber) / [`Subscriber`](/reference/interfaces#publisher-and-subscriber)

## Installation (planned)

```bash
go get github.com/slice-soft/ss-keel-kafka
```

## Usage (planned)

```go
import "github.com/slice-soft/ss-keel-kafka"

client, err := sskafka.Connect(sskafka.Config{
    Brokers:       strings.Split(os.Getenv("KAFKA_BROKERS"), ","),
    ConsumerGroup: "my-api",
})

publisher  := client.Publisher()
subscriber := client.Subscriber()
```

### Publish

```go
payload, _ := json.Marshal(event)

publisher.Publish(ctx, contracts.Message{
    Topic:   "user.registered",
    Key:     []byte(user.ID),
    Payload: payload,
})
```

### Subscribe

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

## Health check

```go
app.RegisterHealthChecker(sskafka.NewHealthChecker(client))
// → "kafka": "UP" in GET /health
```
