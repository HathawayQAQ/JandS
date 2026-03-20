# J&S Niagara Tours — Web Platform

A full-stack customer-facing booking platform for guided tours across the Niagara Falls region. Visitors can explore tour routes, compare itineraries and pricing, view Canadian and U.S. office details, and complete end-to-end bookings and payments online.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React |
| Backend API | FastAPI (Python) |
| Database | PostgreSQL |
| Containerization | Docker / Docker Compose |
| CI/CD | GitHub Actions |
| Reverse Proxy / TLS | Nginx + Let's Encrypt |

---

## Features

- Browse tour routes and itineraries across the Niagara Falls region
- View seasonal pricing and fleet information
- Dual-office contact details (Canadian and U.S. locations)
- Real-time seat availability queries
- End-to-end online booking and reservation management
- Integrated payment processing with webhook support
- Admin interface for content and booking management

---

## Project Structure

```
.
├── frontend/          # React application
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/  # API client layer
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── api/       # Route handlers
│   │   ├── models/    # SQLAlchemy ORM models
│   │   ├── schemas/   # Pydantic request/response schemas
│   │   └── services/  # Business logic (booking, pricing, payments)
│   └── tests/
├── db/
│   └── migrations/    # Database schema migrations
├── docker-compose.yml
└── .github/
    └── workflows/     # CI/CD pipeline definitions
```

---

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- Node.js 18+ (for local frontend development)
- Python 3.11+ (for local backend development)

### Run with Docker Compose

```bash
# Copy and configure environment variables
cp .env.example .env

# Start all services
docker compose up --build
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

### Local Development (without Docker)

**Backend**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Apply database migrations
alembic upgrade head

uvicorn app.main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

---

## Environment Variables

Create a `.env` file at the project root based on `.env.example`:

```env
# Database
DATABASE_URL=postgresql://user:password@db:5432/jands

# API
SECRET_KEY=your-secret-key
ALLOWED_ORIGINS=http://localhost:3000

# Payment Gateway
PAYMENT_GATEWAY_API_KEY=
PAYMENT_WEBHOOK_SECRET=

# Notifications
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASSWORD=
```

---

## API Overview

Full interactive API documentation is available at `/docs` (Swagger UI) when the backend is running.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tours` | List all tour routes and itineraries |
| GET | `/tours/{id}/availability` | Check seat availability for a tour |
| POST | `/bookings` | Submit a new booking |
| GET | `/bookings/{id}` | Retrieve booking details |
| POST | `/payments/checkout` | Initiate a payment session |
| POST | `/payments/webhook` | Receive payment gateway callbacks |

---

## Database Schema (Overview)

| Table | Description |
|---|---|
| `customers` | Registered customer profiles |
| `tours` | Tour routes, descriptions, and fleet info |
| `pricing` | Seasonal and per-tour pricing rules |
| `reservations` | Booking records linked to customers and tours |
| `transactions` | Payment records and statuses |

Schema migrations are managed with [Alembic](https://alembic.sqlalchemy.org/).

---

## Testing

```bash
# Backend unit and integration tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

CI runs all tests automatically on every pull request via GitHub Actions.

---

## Deployment

The production environment is containerized and deployed behind an Nginx reverse proxy with SSL/TLS termination via Let's Encrypt.

```bash
# Production build
docker compose -f docker-compose.prod.yml up -d
```

Refer to `docs/deployment.md` for full infrastructure setup, domain configuration, and SSL renewal procedures.

---

## Documentation

| Document | Location |
|---|---|
| System Architecture | `docs/architecture.md` |
| API Specification | `/docs` (live) or `docs/api.md` |
| Database Schema | `docs/database.md` |
| Deployment Guide | `docs/deployment.md` |
| Admin Guide | `docs/admin-guide.md` |

---

## Offices

**Canada Office** — Niagara Falls, ON
**U.S. Office** — Niagara Falls, NY
