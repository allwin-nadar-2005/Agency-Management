# Real-Time Client Project Dashboard

Role-scoped, real-time project management dashboard (Admin / PM / Developer) with API-enforced RBAC and a WebSocket-driven live activity feed.

## Stack
- Frontend: React + TypeScript + Vite + Tailwind + shadcn/ui
- Backend: Node.js + Fastify
- DB: PostgreSQL + Prisma
- Real-time: Socket.IO (room-based: admin-global / pm-project:<id> / dev:<userId>)
- Background jobs: node-cron (hourly overdue check)
- Auth: JWT access token + HttpOnly refresh cookie

## Setup (Docker)
```bash
docker compose up -d          # starts Postgres on :5432
cd apps/api
cp .env.example .env          # fill in JWT secrets
npm install
npm run prisma:migrate
npm run seed
npm run dev                   # API on :4000
```

In a second terminal:
```bash
cd apps/web
npm install
npm run dev                   # Web on :5173
```

## Seed accounts
All seeded users share the password `password123`.
- Admin: amara@agency.dev
- PM: ravi@agency.dev / sara@agency.dev
- Developer: divya@agency.dev / karan@agency.dev / leo@agency.dev / maya@agency.dev

## Architecture justifications
_(to be expanded — Fastify over Express, Socket.IO over raw WS, node-cron over Bull, JWT+refresh-cookie over session store)_

## Known limitations
_(to be filled in during polish pass)_

## Schema diagram
_(to be generated from prisma/schema.prisma once ERD tooling is run)_
