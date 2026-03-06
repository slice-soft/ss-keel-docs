---
title: Testing
description: Write unit and integration tests for your controllers using TestApp.
---

ss-keel-core includes the `TestApp` helper, which lets you test controllers and routes without exposing a real port.

## TestApp

`TestApp` wraps `App` and uses Fiber's internal test request mechanism.

```go
func core.NewTestApp() *TestApp
```

## Writing a test

```go
package users_test

import (
    "net/http"
    "strings"
    "testing"

    "github.com/slice-soft/ss-keel-core/core"
)

func TestGetUsers(t *testing.T) {
    app := core.NewTestApp()
    app.RegisterController(&UserController{})

    resp := app.RequestJSON("GET", "/users", nil)

    if resp.StatusCode != http.StatusOK {
        t.Fatalf("expected 200, got %d", resp.StatusCode)
    }
}
```

## Making requests

### `Request`: full control

```go
resp := app.Request(method, path, body, headers...)
```

```go
resp := app.Request(
    "POST",
    "/users",
    strings.NewReader(`{"name":"Alice","email":"alice@example.com"}`),
    map[string]string{
        "Content-Type":  "application/json",
        "Authorization": "Bearer test-token",
    },
)
```

### `RequestJSON`: JSON shortcut

Automatically sets `Content-Type: application/json`:

```go
resp := app.RequestJSON("POST", "/users",
    strings.NewReader(`{"name":"Alice","email":"alice@example.com"}`),
)
```

Both methods return a standard `*http.Response`.

## Reading the response body

```go
import (
    "encoding/json"
    "io"
)

body, _ := io.ReadAll(resp.Body)
defer resp.Body.Close()

var result map[string]any
json.Unmarshal(body, &result)
```

Or with a typed struct:

```go
var user User
json.NewDecoder(resp.Body).Decode(&user)
```

## Testing with dependencies

Inject mocked dependencies into your controller to isolate the test:

```go
type MockUserService struct{}

func (m *MockUserService) GetByID(_ context.Context, id string) (*User, error) {
    return &User{ID: id, Name: "Alice"}, nil
}

func TestGetUserByID(t *testing.T) {
    app := core.NewTestApp()
    app.RegisterController(NewUserController(&MockUserService{}))

    resp := app.RequestJSON("GET", "/users/abc-123", nil)

    if resp.StatusCode != http.StatusOK {
        t.Fatalf("expected 200, got %d", resp.StatusCode)
    }

    var user User
    json.NewDecoder(resp.Body).Decode(&user)

    if user.Name != "Alice" {
        t.Errorf("expected Alice, got %s", user.Name)
    }
}
```

## Testing error responses

```go
func TestUserNotFound(t *testing.T) {
    app := core.NewTestApp()
    app.RegisterController(NewUserController(&MockNotFoundService{}))

    resp := app.RequestJSON("GET", "/users/nonexistent", nil)

    if resp.StatusCode != http.StatusNotFound {
        t.Fatalf("expected 404, got %d", resp.StatusCode)
    }

    var errResp map[string]any
    json.NewDecoder(resp.Body).Decode(&errResp)

    if errResp["code"] != "NOT_FOUND" {
        t.Errorf("expected NOT_FOUND code, got %v", errResp["code"])
    }
}
```

## Testing validation

```go
func TestCreateUserValidation(t *testing.T) {
    app := core.NewTestApp()
    app.RegisterController(&UserController{})

    resp := app.RequestJSON("POST", "/users",
        strings.NewReader(`{"name":"","email":"not-an-email"}`),
    )

    if resp.StatusCode != http.StatusUnprocessableEntity {
        t.Fatalf("expected 422, got %d", resp.StatusCode)
    }
}
```

## Testing with auth headers

```go
func TestProtectedRoute(t *testing.T) {
    app := core.NewTestApp()
    app.RegisterController(&AdminController{})

    // Without token should return 401
    resp := app.Request("GET", "/admin/users", nil)
    if resp.StatusCode != http.StatusUnauthorized {
        t.Fatalf("expected 401, got %d", resp.StatusCode)
    }

    // With token should return 200
    resp = app.Request("GET", "/admin/users", nil, map[string]string{
        "Authorization": "Bearer valid-test-token",
    })
    if resp.StatusCode != http.StatusOK {
        t.Fatalf("expected 200, got %d", resp.StatusCode)
    }
}
```

## Table-driven tests

```go
func TestUserEndpoints(t *testing.T) {
    app := core.NewTestApp()
    app.RegisterController(NewUserController(&MockUserService{}))

    tests := []struct {
        name           string
        method         string
        path           string
        body           string
        expectedStatus int
    }{
        {"list users", "GET", "/users", "", http.StatusOK},
        {"get user", "GET", "/users/123", "", http.StatusOK},
        {"user not found", "GET", "/users/999", "", http.StatusNotFound},
        {"create valid", "POST", "/users", `{"name":"Bob","email":"bob@example.com"}`, http.StatusCreated},
        {"create invalid", "POST", "/users", `{"name":""}`, http.StatusUnprocessableEntity},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            var body io.Reader
            if tt.body != "" {
                body = strings.NewReader(tt.body)
            }
            resp := app.RequestJSON(tt.method, tt.path, body)
            if resp.StatusCode != tt.expectedStatus {
                t.Errorf("expected %d, got %d", tt.expectedStatus, resp.StatusCode)
            }
        })
    }
}
```
