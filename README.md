# ⚡ EnergyOrder

> A full-stack order booking system built with **NestJS** and **React + TypeScript**, simulating an energy product order lifecycle from placement to completion.

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Backend | NestJS, TypeScript, class-validator |
| Frontend | React, TypeScript, Vite |
| CI/CD | GitHub Actions |
| Deploy | Vercel (frontend) |

---

## Project Structure

```
energy-order-api/
├── backend/    # NestJS REST API
└── frontend/   # React + TypeScript UI
```

---

## Features

- **POST /orders** — Create a new order with validation via DTOs
- **GET /orders** — Fetch all orders
- **PATCH /orders/:id/status** — Advance order status: `PENDING → CONFIRMED → COMPLETED`
- Global `ValidationPipe` with whitelist and transform
- CORS configured for local frontend dev
- Clean module structure with dependency injection

---

## Getting Started

### Backend
```bash
cd backend
npm install
npm run start:dev
# API running at http://localhost:3000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# UI running at http://localhost:5173
```

---

## Architecture Notes

- **In-memory store** — no DB dependency for simplicity; swap with TypeORM/Prisma module by injecting a repository
- **Status progression** is handled via a lookup map in the service — easy to extend with webhooks or event emitters
- **DTO validation** uses `class-validator` decorators, enforced globally via NestJS `ValidationPipe`
- Frontend uses only `useState`/`useEffect` — no external state library needed at this scale

---

## Extending This

- Add **TypeORM + PostgreSQL** by replacing the in-memory array with a TypeORM repository
- Add **authentication** via NestJS Guards + JWT
- Deploy backend to **GCP Cloud Run** with a Dockerfile
- Add **E2E tests** with Supertest on the NestJS side
