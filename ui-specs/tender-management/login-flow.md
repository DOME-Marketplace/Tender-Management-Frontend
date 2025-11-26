# Tender Management – User Login Flow (Example)

Mermaid diagram showing the static login journey used in this frontend (fake login, session/local storage, guard).

```mermaid
flowchart TD
    A[User opens app] --> B{Has token/userId?}
    B -- yes --> C[Auth guard allows /providers]
    B -- no --> D[/login route]
    D --> E[Enter User ID or Quick Login]
    E --> F[Click Login]
    F --> G[LoginService.setUserId(sessionStorage)]
    F --> H[AuthService.fakeLogin -> set token+userId in localStorage + sessionStorage]
    H --> I[isAuthenticated=true]
    I --> J[Router navigate to /providers]
    J --> K[Dashboard loads with nav + routes]

    %% Error handling
    F -->|empty ID| D
    subgraph Notes
      note1[Auth guard redirects unauthenticated users to /login]
      note2[Interceptor adds Bearer token from session/local storage when present]
    end
```

Key points:
- Auth guard checks `LoginService.isLoggedIn()`; if false, user is sent to `/login`.
- Fake login stores token/userId; no password; used until real backend auth arrives.
- Interceptor reads token from storage and adds `Authorization: Bearer <token>` to API calls.
