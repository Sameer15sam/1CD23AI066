# Notification App Backend

Flask REST API for the campus notification system.

## Run locally

```bash
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

Requires PostgreSQL with schema applied (`schema.sql`).

## Environment variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | HTTP port (default 5000) |

## Project files

| File | Purpose |
|------|---------|
| `app.py` | Flask app, blueprint registration, health route |
| `db.py` | `query()` and `execute()` helpers |
| `schema.sql` | Tables, indexes, seed data |
| `routes/auth.py` | Login and profile endpoints |
| `routes/notifications.py` | Notification CRUD and statistics |

See the root [notification-system-design.md](../notification-system-design.md) for API and database design details.
