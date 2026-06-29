# Campus Notification System — Design Document

This document describes the architecture of the implementation in this repository. All decisions below refer to code that exists under `notification-app-be/` and `notification-app-fe/`.

---

## Stage 1 — REST API Design

### Overview

The backend is a Flask application (`notification-app-be/app.py`) exposing JSON endpoints under `/api`. Routes are split into blueprints:

| Blueprint | Prefix | File |
|-----------|--------|------|
| Auth | `/api/auth` | `routes/auth.py` |
| Notifications | `/api/notifications` | `routes/notifications.py` |

Database access uses raw SQL via `psycopg2` in `db.py` (`query` for reads, `execute` for writes). There is no ORM layer.

### Endpoints

| Method | Path | Description | Response shape |
|--------|------|-------------|----------------|
| `GET` | `/api/health` | Service health check | `{ status, service }` |
| `POST` | `/api/auth/login` | Look up student by `student_id` | `{ token, student }` |
| `GET` | `/api/auth/me` | Current student profile | `{ data }` |
| `GET` | `/api/notifications/` | Paginated notification list | `{ data, meta }` |
| `GET` | `/api/notifications/<id>` | Single notification | `{ data }` |
| `PATCH` | `/api/notifications/<id>/read` | Mark one notification read | `{ message }` |
| `PATCH` | `/api/notifications/read-all` | Mark all unread as read | `{ message }` |
| `DELETE` | `/api/notifications/<id>` | Soft-delete for current student | `{ message }` |
| `GET` | `/api/notifications/unread-count` | Unread count | `{ unread_count }` |
| `GET` | `/api/notifications/statistics` | Per-type totals | `{ data }` |

### Query parameters (list endpoint)

| Parameter | Values | Default |
|-----------|--------|---------|
| `type` | `placement`, `result`, `event`, `circular`, `fee`, `general` | all types |
| `status` | `read`, `unread` | all |
| `sort` | `newest`, `oldest`, `priority` | `newest` |
| `page` | integer ≥ 1 | `1` |
| `per_page` | integer ≤ 50 | `20` |

### Authentication model

Students are identified by the `X-Student-ID` request header (internal numeric `students.id`). The login endpoint returns a mock token for demonstration; the frontend stores the student id in `localStorage` and sends it on every request via `src/api/base.js`.

Static routes (`/read-all`, `/unread-count`, `/statistics`) are registered alongside parameterized routes so Flask does not treat those path segments as notification ids.

### Design choices

- **Soft delete** — DELETE sets `is_deleted = TRUE` on `notification_status`, preserving audit history.
- **Per-student state** — Read/unread/delete state lives in `notification_status`, not on the notification row itself, so one broadcast notification can have independent state per student.
- **Expiry filter** — List and detail queries exclude rows where `expires_at` is in the past.

---

## Stage 2 — PostgreSQL Schema

### Normalization

The schema in `schema.sql` uses third normal form:

| Table | Role |
|-------|------|
| `students` | Student identity and profile |
| `notification_types` | Lookup for category slug, label, and priority |
| `notifications` | Shared notification content (title, body, timestamps) |
| `notification_status` | Per-student read/delete state |

Storing type metadata in `notification_types` avoids repeating labels and priority values on every notification row. Storing status separately avoids duplicating notification content for each student.

### Relationships

```
students ──< notification_status >── notifications ──> notification_types
```

- `notifications.type_id` → `notification_types(id)` with `ON DELETE RESTRICT` (types cannot be removed while in use).
- `notification_status.student_id` → `students(id)` with `ON DELETE CASCADE`.
- `notification_status.notification_id` → `notifications(id)` with `ON DELETE CASCADE`.
- `UNIQUE (student_id, notification_id)` prevents duplicate status rows.

### Priority values

| slug | label | priority |
|------|-------|----------|
| placement | Placement Opportunity | 1 (highest) |
| result | Examination Result | 2 |
| event | College Event | 3 |
| circular | Circular | 4 |
| fee | Fee Reminder | 4 |
| general | General Announcement | 5 |

Lower numeric priority means higher urgency in SQL `ORDER BY nt.priority ASC`.

### Indexes

| Index | Purpose |
|-------|---------|
| `idx_status_student` | Filter status rows by student |
| `idx_status_unread` | Partial index for unread, non-deleted rows per student |
| `idx_status_active` | Partial index for active (non-deleted) rows per student |
| `idx_status_composite` | Lookups by student + notification + read flag |
| `idx_notifications_type` | Filter/join on notification type |
| `idx_notifications_date` | Sort by `created_at` |

Indexes target the actual query patterns in `routes/notifications.py`: filter by student, optionally by type and read state, then sort by date or priority.

---

## Stage 3 — SQL Query Optimization

### List query pattern

The list endpoint builds a dynamic `WHERE` clause with parameterized `%s` placeholders (SQL injection safe). It joins three tables once per request:

```sql
notification_status ns
JOIN notifications n ON n.id = ns.notification_id
JOIN notification_types nt ON nt.id = n.type_id
```

Filters applied in the database (not in Python):

- `ns.student_id = %s`
- `ns.is_deleted = FALSE`
- `(n.expires_at IS NULL OR n.expires_at > NOW())`
- Optional type slug and read/unread status

Sorting is delegated to PostgreSQL:

- `newest` → `n.created_at DESC`
- `oldest` → `n.created_at ASC`
- `priority` → `nt.priority ASC, n.created_at DESC`

Pagination uses `LIMIT` / `OFFSET` with a separate `COUNT(*)` query sharing the same `WHERE` clause for accurate `meta.total`.

### Unread count

The unread-count endpoint queries only `notification_status` (no joins) because read state is stored there:

```sql
SELECT COUNT(*) FROM notification_status
WHERE student_id = %s AND is_read = FALSE AND is_deleted = FALSE
```

This is cheaper than the full list join and uses the partial index `idx_status_unread`.

### Mark read / delete

Updates target `notification_status` by `(student_id, notification_id)` composite key, avoiding joins entirely.

### Connection handling

`db.py` opens one connection per request and closes it in a `finally` block. For the current scale (campus demo, paginated reads) this is sufficient. Connection pooling would be the next step at higher load (documented in Stage 4).

---

## Stage 4 — Performance and Scalability (Architectural)

### What is implemented now

| Concern | Implementation |
|---------|----------------|
| Pagination | Server-side `LIMIT`/`OFFSET` with `meta.total_pages` |
| Filtering | SQL `WHERE` clauses, not client-side filtering |
| Sorting | SQL `ORDER BY` for the All tab |
| Auto-refresh | Frontend polls every 30 seconds (`useNotifications.js`) |
| CORS | Enabled for `/api/*` during development |

### What is documented but not deployed

The following are **architectural recommendations** for production scale, not runtime dependencies in this project:

| Technique | When to add | Rationale |
|-----------|-------------|-----------|
| **Redis cache** | Unread count called very frequently | Cache `{student_id → unread_count}` with short TTL; invalidate on read/delete |
| **Connection pooling** | Many concurrent Flask workers | Use `psycopg2.pool` or PgBouncer instead of per-request connect |
| **Read replicas** | Heavy read load | Route list/statistics queries to a replica |
| **CDN / static assets** | Production frontend | Serve Vite build from CDN |

Redis was removed from `requirements.txt` because no application code reads or writes cache today. Adding it without a consumer would increase operational cost without benefit.

### Pagination note

Offset pagination is simple and correct for student inboxes of moderate size. For very deep pages, keyset pagination (`WHERE created_at < %s`) would perform better; the current API exposes page numbers, which suits the assignment scope.

---

## Stage 5 — Notification Processing

### Current model (synchronous)

This implementation does **not** run a background job queue. Notification delivery works as follows:

1. An administrator inserts rows into `notifications` and fan-out rows into `notification_status` (see seed data in `schema.sql`).
2. The student frontend polls the REST API and renders results.

All processing is request-driven: mark-read and delete are single-row `UPDATE` statements executed during the HTTP request.

### Why no queue in this codebase

A message queue (Redis + Celery, RabbitMQ, etc.) is valuable when notifications must be **pushed** to thousands of students asynchronously (email, SMS, mobile push). The assignment inbox reads pre-existing status rows; there is no broadcast API or worker in scope.

### Scalable architecture (future)

```
Admin API → Queue (e.g. Redis/RQ) → Worker
    ↓                                    ↓
notifications table              INSERT notification_status per student
                                        ↓
                              Optional: push via WebSocket / FCM
```

The `logging-middleware/` folder is reserved for cross-cutting request logging middleware (not wired into `app.py` yet). In production, structured logs from Flask and workers would feed observability tooling.

### Global notifications

The `is_global` column marks notifications intended for all students. Seed data pre-populates `notification_status` for three students. A production worker would create status rows for each student when a global notification is published.

---

## Stage 6 — React Frontend

### Structure

```
src/
├── api/           fetch wrappers (base.js, notifications.js, auth.js)
├── hooks/         useNotifications, usePriorityInbox
├── components/    presentational UI
├── pages/         NotificationsPage
├── utils/         priority scoring, min-heap, constants
└── styles/        notifications.css
```

### Features

| Feature | Implementation |
|---------|----------------|
| API integration | `apiFetch` in `base.js` with `X-Student-ID` header |
| Loading state | `LoadingSpinner` while `useNotifications.loading` is true |
| Error handling | Error banner with retry button |
| Filtering | Type, status, and sort selects in `NotificationFilter` |
| Sorting (All tab) | Server-side via `sort` query param |
| Unread count | Fetched from `/unread-count`; shown in header and sidebar |
| Mark read | Click unread card or "Mark all read" |
| Delete | Per-card delete button |
| Statistics | Sidebar `StatisticsPanel` from `/statistics` |
| Auto-refresh | 30 s interval in `useNotifications` |
| Priority Inbox | Separate tab using client-side top-N selection |

### Priority Inbox algorithm

Assignment rules:

1. Placement > Result > Event > other types
2. Newer notifications rank higher within the same type
3. Only the top 10 are shown
4. Avoid sorting the entire list on every render

**Scoring** (`priorityCalculator.js`):

```javascript
score = typeWeight * 1e6 + ageSeconds
```

`typeWeight` comes from `PRIORITY_WEIGHTS` (placement = 1, general = 5). Multiplying by `1e6` ensures type always dominates recency. Lower score = higher priority. Newer items have smaller `ageSeconds`.

**Top-N selection** (`heap.js`):

`topNByPriority` maintains a size-N min-heap while iterating notifications once (O(n log 10) ≈ O(n)). When the heap is full, a new notification replaces the current lowest-priority entry only if its score is better (lower). This avoids sorting the full dataset.

The heap result is sorted once for display (at most 10 items), with a secondary tie-break on `created_at` descending.

The **All** tab uses server-side sorting. The **Priority Inbox** tab applies the heap to the currently loaded page of notifications returned by the API. For a full inbox-wide priority view at scale, the server would expose a dedicated endpoint; the heap approach satisfies the assignment's client-side efficiency requirement.

### UI approach

The UI uses plain CSS (`notifications.css`) and semantic HTML. No component library is required. Layout includes a sidebar (tabs + statistics) and a main content area (header, filters, list).

---

## Summary

| Stage | Status in this repo |
|-------|---------------------|
| 1 REST API | Implemented — Flask blueprints, 10 endpoints |
| 2 Schema | Implemented — normalized PostgreSQL with indexes |
| 3 SQL | Implemented — parameterized queries, partial indexes |
| 4 Performance | Pagination + polling implemented; Redis/cache documented only |
| 5 Processing | Synchronous CRUD; queue-based push documented for scale |
| 6 Frontend | React + hooks + min-heap priority inbox |
