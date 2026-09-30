# DeepAstro Database Architecture, Fallback, & Resilience Model

## 1. Dual-Engine Architecture
DeepAstro employs a high-reliability dual-engine storage strategy:

```
                  Client Request
                         │
                         ▼
                  [PostgresService]
                         │
        ┌────────────────┴────────────────┐
        ▼                                 ▼
   [Primary]                         [Resilient Fallback]
PostgreSQL / Supabase               InMemoryFallbackClient
(Connection Pooling, SSL)           (Zero-dependency mock DB)
```

1. **Primary Store:** PostgreSQL / Supabase connection pool (`DATABASE_URL` via Supabase connection pooler port 6543 or direct port 5432).
2. **Resilience Fallback:** `InMemoryFallbackClient` activates automatically when the remote database is unreachable (`ENOTFOUND`, `ECONNREFUSED`, `ETIMEDOUT`).

---

## 2. Telemetry & Truthful Transparency
- The API never masquerades fallback as active PostgreSQL storage.
- The health endpoint (`/api/health`) reports:
  - `databaseMode: "postgres"` when PostgreSQL queries succeed.
  - `databaseMode: "in-memory"` when fallback is currently active.
- When fallback activates, structured log events are emitted:
  ```json
  {
    "event": "DATABASE_FALLBACK_ACTIVATED",
    "reason": "Connection dropped or host unavailable",
    "databaseMode": "in-memory",
    "timestamp": "ISO-TIMESTAMP"
  }
  ```

---

## 3. Auto-Reconnection Lifecycle
`PostgresService` continuously monitors connection health. If a previous query caused a fallback:
- Every 30 seconds, `PostgresService` attempts a lightweight `SELECT 1 as live` ping to the pool.
- Once the remote PostgreSQL database comes online, `PostgresService` seamlessly restores primary mode:
  ```
  [PostgresService] Remote database reconnected successfully. Active mode: postgres
  ```
- **Zero code redeployments or container restarts required.**
