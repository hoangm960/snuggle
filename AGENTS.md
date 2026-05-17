# Snuggles Agent Guide

## Project

Two independent packages (no Yarn workspaces — `yarn install` separately in each):

| Package | Dir | Stack | Port |
|---|---|---|---|
| frontend | `frontend/` | Next.js 14 (App Router), React 18, Tailwind, Framer Motion, Vitest | 3000 |
| backend | `backend/` | Express.js, Firebase Admin SDK, Socket.io, Zod, Puppeteer, Jest | 3001 |

**Backend must run before frontend** (frontend proxies `/api/*` to backend).

## Commands (use `yarn`)

### Frontend (`cd frontend`)
```bash
yarn dev             # next dev (port 3000)
yarn build           # next build
yarn lint            # eslint . --max-warnings 0
yarn format          # prettier --write .
yarn test            # vitest run
yarn test -- <file>  # single test file
```

### Backend (`cd backend`)
```bash
yarn dev             # nodemon
yarn build           # tsc → dist/
yarn start           # node --max-old-space-size=4096 dist/index.js
yarn lint            # eslint src --ext .ts
yarn lint:fix        # eslint --fix
yarn format          # prettier --write .
yarn test            # jest (30s timeout)
yarn test -- <file>  # single test file
yarn test:coverage   # jest --coverage
yarn create-admin    # ts-node src/scripts/createAdmin.ts
yarn prepare         # install husky hooks
```

## Architecture

- **API proxy**: Next.js rewrites `/api/:path*` → `http://localhost:3001/api/:path*` in dev
- **Redirect**: `/` → `/home` (permanent, defined in both `next.config.js` and `src/app/page.tsx`)
- **Socket.io**: Backend initializes in `src/index.ts` via `initializeSocket(httpServer)`. Frontend uses `socket.io-client` (see `hooks/useSocket.ts`)
- **Backend entrypoint**: `backend/src/index.ts` — creates Express app + HTTP server, registers all routes, exports `app` for testing
- **Prettier** (root `.prettierrc`): tabs (4-width), double quotes, trailing commas (`es5`), 100 char width, semicolons

## Testing

**Backend — Firebase is fully mocked** (`tests/setup.ts`). No real Firebase needed for tests.

Test app (`tests/app.ts`) creates a **separate Express instance** with routes but **no middleware** (no auth, helmet, cors, error handler). Helpers:
- `createUserToken(uid?, email?)` / `createAdminToken()` — JWT tokens
- `createAuthHeader(token)` — `{ Authorization: "Bearer ..." }`

Mock factories (`tests/utils.ts`): `createMockUser`, `createMockPet`, `createMockShelter`, `createMockApplication`, `createMockContract`, `createMockReview`, `createMockSavedSearch`, `createMockAdopterProfile`, `createMockHealthRecord`.

Jest roots: `["src/", "tests/"]` — tests may live alongside source too.

**Frontend** — Vitest with jsdom, `@testing-library/react`. Test files co-located in `src/` (`src/**/*.test.{ts,tsx}`).

## Pre-commit Hook

Single root hook (`.husky/pre-commit`) — runs lint-staged + build + test for both frontend and backend sequentially.

## Setup

1. `yarn install` in both `frontend/` and `backend/`
2. Create Firebase project (Auth + Firestore)
3. Download service account key to `backend/firebase-service-key.json`
4. Configure `frontend/.env.local` with Firebase client vars + `NEXT_PUBLIC_API_URL=http://localhost:3001`
5. Configure `backend/.env` (see `backend/.env.example`)
6. `yarn prepare` (from root or backend) to install husky hooks

## Ignored Files

- `/AGENTS.md` is gitignored (not tracked)
- `/.opencode/skills/react` is gitignored (local skill only)
