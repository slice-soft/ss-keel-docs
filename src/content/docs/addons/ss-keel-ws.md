---
title: ss-keel-ws
description: WebSocket support via Fiber's built-in WebSocket handler.
---

:::caution[Coming Soon]
This addon is under development.
:::

`ss-keel-ws` adds WebSocket support to ss-keel-core applications. Built on top of [Fiber's WebSocket middleware](https://docs.gofiber.io/api/middleware/websocket), it provides a clean integration with the controller and module patterns.

## Planned Installation

```bash
go get github.com/slice-soft/ss-keel-ws
```

## Planned Usage

### Basic WebSocket Handler

```go
import "github.com/slice-soft/ss-keel-ws"

type ChatController struct{}

func (c *ChatController) Routes() []core.Route {
    return []core.Route{
        ssws.GET("/ws/chat", c.handleChat).
            Tag("chat").
            Describe("Chat WebSocket connection"),
    }
}

func (c *ChatController) handleChat(conn *ssws.Conn) error {
    for {
        msgType, msg, err := conn.ReadMessage()
        if err != nil {
            return err
        }
        // echo back
        conn.WriteMessage(msgType, msg)
    }
}
```

### With Authentication

```go
core.GET("/ws/chat", c.handleChat).
    Use(jwtGuard.Middleware()) // validate token before upgrade
```

### Broadcasting

```go
hub := ssws.NewHub()

func (c *ChatController) handleChat(conn *ssws.Conn) error {
    hub.Register(conn)
    defer hub.Unregister(conn)

    for {
        _, msg, err := conn.ReadMessage()
        if err != nil {
            return err
        }
        hub.Broadcast(msg) // send to all connected clients
    }
}
```

### Rooms

```go
hub := ssws.NewHub()

func (c *ChatController) handleRoom(conn *ssws.Conn) error {
    roomID := conn.Params("room")
    hub.Join(conn, roomID)
    defer hub.Leave(conn, roomID)

    for {
        _, msg, err := conn.ReadMessage()
        if err != nil {
            return err
        }
        hub.BroadcastTo(roomID, msg)
    }
}
```
