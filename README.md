# Campus Notification System

A full-stack campus notification inbox for students. Students view, filter, sort, and manage notifications; a priority inbox highlights the ten most urgent items.

## Repository layout

```
Campus-Evaluation-FS/
├── notification-app-be/    Flask REST API + PostgreSQL
├── notification-app-fe/    React (Vite) student portal
├── logging-middleware/     Placeholder for future request logging
├── docs/                   Additional documentation
├── notification-system-design.md
└── README.md
```

## Tech stack

| Layer | Technology |
|-------|------------|
| Backend | Flask, psycopg2 (raw SQL), flask-cors |
| Database | PostgreSQL |
| Frontend | React 19, Vite |
| Styling | Plain CSS (`src/styles/notifications.css`) |

There is **no** SQLAlchemy, Redis, or UI component library in the active codebase.

## Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL running locally

## Setup

### 1. Database

```bash
psql -U postgres -c "CREATE DATABASE campus_notifications;"
psql -U postgres -d campus_notifications -f notification-app-be/schema.sql
```

### 2. Backend

```bash
cd notification-app-be
python -m venv venv
venv\Scripts\activate        # Windows
pip install -r requirements.txt
python app.py
```

API runs at `http://localhost:5000`. Health check: `GET /api/health`.

Configure `DATABASE_URL` in `notification-app-be/.env` if your PostgreSQL credentials differ.

### 3. Frontend

```bash
cd notification-app-fe
npm install
npm run dev
```

Open the URL shown by Vite (default `http://localhost:5173`).

Set `VITE_API_URL` in `notification-app-fe/.env` if the API is not on port 5000.

## Default student

The frontend sends `X-Student-ID: 1` by default (student **Ayesha Khan** in seed data). After login via `POST /api/auth/login`, store the returned student id in `localStorage` under `studentId`.

## API overview

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/notifications/` | List (filter, sort, paginate) |
| GET | `/api/notifications/unread-count` | Unread badge count |
| GET | `/api/notifications/statistics` | Per-type summary |
| PATCH | `/api/notifications/<id>/read` | Mark read |
| PATCH | `/api/notifications/read-all` | Mark all read |
| DELETE | `/api/notifications/<id>` | Soft delete |
| POST | `/api/auth/login` | Student lookup |

Full API and architecture notes: [notification-system-design.md](./notification-system-design.md).

## Frontend features

- **All** tab — server-side filter (type, read/unread), sort (newest, oldest, priority), pagination
- **Priority Inbox** tab — top 10 notifications via min-heap (placement > result > event; newer first within type)
- Unread count, statistics sidebar, mark-all-read, delete, 30 s auto-refresh

## License

See [LICENSE](./LICENSE).
