# Shadow Ledger — TypeScript MVP

A secure, private incident registry with JWT authentication, PostgreSQL, and a Next.js frontend.

## Stack

| Layer     | Tech                              |
|-----------|-----------------------------------|
| Backend   | Express · TypeScript · Prisma     |
| Database  | PostgreSQL                        |
| Auth      | JWT (bcrypt passwords)            |
| Frontend  | Next.js 14 · App Router · TypeScript |
| State     | Zustand (persisted auth)          |
| HTTP      | Axios                             |

## Project Structure

```
shadow-ledger/
├── backend/
│   ├── prisma/schema.prisma        ← DB models (User, Incident)
│   ├── src/
│   │   ├── server.ts               ← Express app + startup
│   │   ├── config.ts               ← Env var loading
│   │   ├── prismaClient.ts         ← Singleton Prisma client
│   │   ├── middleware/auth.ts      ← JWT verify middleware
│   │   └── routes/
│   │       ├── auth.ts             ← POST /auth/login|register, GET /auth/me
│   │       ├── incidents.ts        ← CRUD /incidents
│   │       └── timeline.ts         ← GET /timeline (grouped by date)
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── app/
    │   ├── api/client.ts           ← Axios instance + Zustand auth store + typed API helpers
    │   ├── layout.tsx              ← Root layout
    │   ├── page.tsx                ← Redirect to /login or /dashboard
    │   ├── login/page.tsx
    │   ├── dashboard/page.tsx
    │   ├── incidents/
    │   │   ├── page.tsx            ← List + search + filter
    │   │   └── [id]/page.tsx       ← Detail + edit
    │   ├── timeline/page.tsx
    │   └── components/
    │       ├── IncidentForm.tsx    ← Create/Edit modal
    │       ├── IncidentList.tsx    ← Rows with severity bars
    │       └── TimelineView.tsx    ← Chronological dots + cards
    ├── styles/globals.css
    ├── .env.local.example
    ├── next.config.mjs
    ├── package.json
    └── tsconfig.json
```

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (or connection string to remote DB)

### Backend

```bash
cd backend
npm install
cp .env.example .env          # edit DATABASE_URL and JWT_SECRET
npx prisma migrate dev --name init
npm run dev                   # http://localhost:4000
```

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev                   # http://localhost:3000
```

## API Endpoints

### Auth
| Method | Path             | Auth | Description          |
|--------|------------------|------|----------------------|
| POST   | /auth/register   | —    | Create account       |
| POST   | /auth/login      | —    | Get JWT token        |
| GET    | /auth/me         | ✓    | Current user info    |

### Incidents
| Method | Path              | Auth | Description                  |
|--------|-------------------|------|------------------------------|
| GET    | /incidents        | ✓    | List (filter: severity/status/category/search) |
| GET    | /incidents/:id    | ✓    | Single incident              |
| POST   | /incidents        | ✓    | Create incident              |
| PATCH  | /incidents/:id    | ✓    | Update incident              |
| DELETE | /incidents/:id    | ✓    | Delete incident              |

### Timeline
| Method | Path       | Auth | Description                         |
|--------|------------|------|-------------------------------------|
| GET    | /timeline  | ✓    | Incidents grouped by date (from/to) |

## Security Notes

- All incident routes require a valid JWT in `Authorization: Bearer <token>`
- Users can only access their own incidents (userId scoped queries)
- Passwords hashed with bcrypt (cost factor 12)
- Change `JWT_SECRET` to a long random string before deploying
