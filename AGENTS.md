# AGENTS.md — J&S Niagara Tours Web Platform

This file gives AI agents the full context needed to work on this codebase effectively.
Read this before making any changes.

---

## Project Overview

J&S Niagara Tours is a full-stack customer-facing booking platform for guided tours across the Niagara Falls region. The platform allows visitors to:
- Browse tour routes and itineraries
- View seasonal pricing, fleet info, and office details (Canadian and U.S.)
- Check real-time seat availability
- Complete end-to-end bookings and payments online

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | React | 18+ |
| Backend API | FastAPI | 0.100+ |
| ORM | SQLAlchemy (async) | 2.x |
| Schema validation | Pydantic | v2 |
| Database | PostgreSQL | 15+ |
| Migrations | Alembic | latest |
| Payment gateway | Stripe | latest SDK |
| Containerization | Docker / Docker Compose | — |
| Reverse proxy / TLS | Nginx + Let's Encrypt | — |
| CI/CD | GitHub Actions | — |

---

## Repository Layout

```
.
├── frontend/                  # React SPA
│   ├── public/
│   └── src/
│       ├── components/        # Reusable UI components
│       ├── pages/             # Route-level page components
│       └── services/          # Axios API client wrappers
│
├── backend/
│   └── app/
│       ├── api/               # FastAPI routers (one file per resource)
│       ├── models/            # SQLAlchemy ORM models
│       │   ├── base.py        # DeclarativeBase + TimestampMixin
│       │   ├── customer.py
│       │   ├── tour.py        # Tour + TourStop
│       │   ├── pricing.py     # PricingRule (seasonal)
│       │   ├── reservation.py # Reservation (booking state machine)
│       │   └── transaction.py # Payment transaction record
│       ├── schemas/           # Pydantic v2 request/response models
│       │   ├── customer.py
│       │   ├── tour.py
│       │   ├── booking.py
│       │   └── payment.py
│       └── services/          # Business logic (no DB queries in routers)
│           ├── pricing_service.py
│           ├── booking_service.py
│           └── payment_service.py
│
├── db/
│   └── migrations/            # Alembic migration scripts
│
├── docker-compose.yml
├── docker-compose.prod.yml
└── .github/
    └── workflows/             # CI pipeline definitions
```

---

## Architecture Rules

1. **Routers are thin.** All business logic lives in `services/`. Routers only parse requests, call a service method, and return a response.
2. **Services own transactions.** Each service method that writes to the DB should commit or let the router-level dependency manage the session lifecycle.
3. **No raw SQL.** Use SQLAlchemy ORM or Core expressions only. Never use `text()` unless there is no ORM equivalent.
4. **Async everywhere.** All DB access uses `AsyncSession`. Do not import or use synchronous SQLAlchemy sessions.
5. **Pydantic v2 syntax.** Use `model_config = {"from_attributes": True}` (not `class Config`). Use `model_dump()` (not `.dict()`).
6. **Enums are string enums.** All model enums inherit from `(str, enum.Enum)` so they serialize cleanly to/from JSON.
7. **Currency is Decimal, not float.** All monetary values use `Decimal` (Python) and `Numeric(10, 2)` (PostgreSQL). Never use `float` for money.
8. **Prices are in CAD.** All pricing is stored in Canadian dollars. Currency conversion (if needed) happens at the API response layer only.

---

## Data Models

### `customers`
| Column | Type | Notes |
|---|---|---|
| id | int PK | |
| first_name | varchar(100) | |
| last_name | varchar(100) | |
| email | varchar(255) | unique |
| phone | varchar(30) | nullable |
| country | varchar(100) | nullable |
| created_at / updated_at | timestamptz | auto-managed |

### `tours`
| Column | Type | Notes |
|---|---|---|
| id | int PK | |
| name | varchar(200) | |
| slug | varchar(200) | unique, URL-safe identifier |
| description | text | nullable |
| duration_hours | float | |
| max_seats | int | total capacity per departure |
| vehicle_type | varchar(100) | e.g. "minibus", "coach" |
| departure_office | enum | `canada` / `us` / `both` |
| is_active | bool | soft-disable without deleting |

### `tour_stops`
| Column | Type | Notes |
|---|---|---|
| id | int PK | |
| tour_id | int FK → tours | |
| order | int | display order |
| name | varchar(200) | |
| description | text | nullable |
| duration_minutes | int | nullable |

### `pricing_rules`
| Column | Type | Notes |
|---|---|---|
| id | int PK | |
| tour_id | int FK → tours | |
| passenger_type | enum | `adult` / `child` / `senior` |
| price_cad | numeric(10,2) | |
| season_label | varchar(50) | e.g. "peak", "off-peak" |
| valid_from | date | nullable = always valid |
| valid_until | date | nullable = always valid |

Pricing resolution: the most specific rule (narrowest date window) matching the travel date wins. See `PricingService.get_price()`.

### `reservations`
| Column | Type | Notes |
|---|---|---|
| id | int PK | |
| reference | varchar(20) | unique human-readable code (e.g. "A3BX92K1") |
| customer_id | int FK → customers | |
| tour_id | int FK → tours | |
| tour_date | date | |
| adults / children / seniors | int | seat counts per passenger type |
| status | enum | `pending` → `confirmed` → `completed` or `cancelled` |
| special_requests | text | nullable |
| cancelled_at | timestamptz | nullable |
| cancel_reason | varchar(255) | nullable |

State transitions:
- `pending` — created, awaiting payment capture
- `confirmed` — Stripe `checkout.session.completed` received
- `completed` — tour has been taken (set by admin/cron)
- `cancelled` — cancelled by customer or after refund

### `transactions`
| Column | Type | Notes |
|---|---|---|
| id | int PK | |
| reservation_id | int FK → reservations | unique (1-to-1) |
| gateway | varchar(50) | always `"stripe"` for now |
| gateway_payment_id | varchar(255) | Stripe session or PaymentIntent ID |
| amount_cad | numeric(10,2) | |
| currency | varchar(3) | default `"CAD"` |
| status | enum | `pending` / `succeeded` / `failed` / `refunded` |
| gateway_response | text | raw JSON from gateway |
| failure_reason | varchar(255) | nullable |

---

## Service Layer

### `PricingService`
- `get_price(tour_id, passenger_type, travel_date)` → `Decimal`
- `calculate_total(tour_id, travel_date, adults, children, seniors)` → `Decimal`

### `BookingService`
- `get_availability(tour_id, tour_date)` → `AvailabilityResponse`
- `create_booking(payload: BookingRequest)` → `(Reservation, total_cad)`
  - Upserts customer by email
  - Checks seat availability before creating
  - Returns a `PENDING` reservation
- `confirm_booking(reservation_id)` → `Reservation` (sets status to `CONFIRMED`)
- `cancel_booking(reservation_id, reason?)` → `Reservation` (sets status to `CANCELLED`)

### `PaymentService`
- `create_checkout_session(reservation, amount_cad, success_url, cancel_url)` → Stripe session
  - Also creates a `PENDING` `Transaction` record
- `verify_webhook_signature(payload, sig_header)` → parsed event dict
- `handle_webhook(event)` — dispatches to:
  - `checkout.session.completed` → confirms reservation, marks transaction `SUCCEEDED`
  - `payment_intent.payment_failed` → marks transaction `FAILED`
  - `charge.refunded` → marks transaction `REFUNDED`, cancels reservation

---

## API Endpoints (planned)

| Method | Path | Service call |
|---|---|---|
| GET | `/tours` | list active tours |
| GET | `/tours/{id}` | single tour with stops + pricing |
| GET | `/tours/{id}/availability?date=` | `BookingService.get_availability` |
| POST | `/bookings` | `BookingService.create_booking` → `PaymentService.create_checkout_session` |
| GET | `/bookings/{id}` | reservation detail |
| POST | `/payments/webhook` | `PaymentService.handle_webhook` |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | `postgresql+asyncpg://user:pass@host:5432/jands` |
| `SECRET_KEY` | yes | FastAPI signing key |
| `ALLOWED_ORIGINS` | yes | CORS origins (comma-separated) |
| `STRIPE_SECRET_KEY` | yes | Stripe secret key (`sk_...`) |
| `STRIPE_WEBHOOK_SECRET` | yes | Stripe webhook signing secret (`whsec_...`) |
| `SMTP_HOST` | no | Outbound email host |
| `SMTP_PORT` | no | Outbound email port |
| `SMTP_USER` | no | SMTP username |
| `SMTP_PASSWORD` | no | SMTP password |

---

## Key Conventions

- **File naming:** snake_case for Python files, PascalCase for React components.
- **Service injection:** Services are instantiated inside route handlers with the DB session injected via FastAPI `Depends()`. Never instantiate services at module level.
- **Webhook security:** Always verify Stripe signatures in `PaymentService.verify_webhook_signature` before processing any webhook payload. Never trust raw webhook body without verification.
- **Migrations:** Every schema change requires an Alembic migration. Never alter tables manually in production.
- **No business logic in models.** Models are plain data containers. The only exception is simple computed properties (e.g. `Reservation.total_seats`).
- **Test coverage required for:** pricing rule resolution, booking state transitions, payment webhook handlers, and seat availability logic.

---

## Local Dev Quick Reference

```bash
# Backend
cd backend && source .venv/bin/activate
alembic upgrade head
uvicorn app.main:app --reload

# Frontend
cd frontend && npm run dev

# All services via Docker
docker compose up --build
```

Services:
- Frontend → http://localhost:3000
- API → http://localhost:8000
- Swagger UI → http://localhost:8000/docs
- PostgreSQL → localhost:5432
