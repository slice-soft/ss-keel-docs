---
title: ss-keel-ws
description: Soporte WebSocket usando el handler integrado de WebSocket en Fiber.
---

:::caution[Próximamente]
Este addon está en desarrollo.
:::

`ss-keel-ws` agrega soporte WebSocket a aplicaciones ss-keel-core. Está construido sobre [el middleware WebSocket de Fiber](https://docs.gofiber.io/api/middleware/websocket) e integra de forma limpia con patrones de controller y módulo.

## Instalación (planificada)

```bash
go get github.com/slice-soft/ss-keel-ws
```

## Uso (planificado)

### Handler WebSocket básico

```go
import "github.com/slice-soft/ss-keel-ws"

type ChatController struct{}

func (c *ChatController) Routes() []core.Route {
    return []core.Route{
        ssws.GET("/ws/chat", c.handleChat).
            Tag("chat").
            Describe("Conexión WebSocket de chat"),
    }
}

func (c *ChatController) handleChat(conn *ssws.Conn) error {
    for {
        msgType, msg, err := conn.ReadMessage()
        if err != nil {
            return err
        }
        // echo
        conn.WriteMessage(msgType, msg)
    }
}
```

### Con autenticación

```go
core.GET("/ws/chat", c.handleChat).
    Use(jwtGuard.Middleware()) // valida token antes del upgrade
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
        hub.Broadcast(msg) // envía a todos los clientes conectados
    }
}
```

### Salas

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
