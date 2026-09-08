# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A Next.js 16 (App Router) + Firebase app for cataloguing musical theatre recordings. Private, allowlist-protected browse/search pages plus an admin area (`/admin`) with CRUD for recordings, people, theatres, and users. Deployed to Firebase Hosting at https://music-catalogue.web.app.

## Commands

```bash
npm run dev              # Dev server at localhost:3000
npm run build            # Generates public/build.json, then next build
npm run lint             # ESLint
npm test                 # Run all tests once (vitest run)
npm run test:watch       # Vitest watch mode
npm run test:coverage    # Coverage report

# Run a single test file
npx vitest run src/hooks/__tests__/useTableSort.test.ts

# Run tests matching a name
npx vitest run -t "test name"
```

Requires a `.env.local` with `NEXT_PUBLIC_FIREBASE_*` variables (see README.md) for the app to run against Firebase.

**Pre-commit hook** (husky) runs `lint-staged` (`eslint --fix` on staged `.ts`/`.tsx`) and `npx tsc --noEmit`. A commit fails if typechecking fails, so run `npx tsc --noEmit` before committing to catch errors early.

CI (`.github/workflows/ci-cd.yml`) runs lint, test, and build on push to master, then deploys to Firebase Hosting.

## Architecture

There is no server-side data layer — no API routes, no server actions. All Firebase access happens client-side; pages that touch data are `'use client'` components. The flow is:

**`src/firebase/firestore.ts`** — generic Firestore CRUD helpers (`getCollection`, `getDocument`, `addDocument`, `updateDocument`, `deleteDocument`, `getPaginatedCollection`) that take collection names as strings.

**`src/hooks/useQueries.ts`** — the layer components actually use. TanStack Query hooks per entity (`useRecordings`, `usePeople`, `useTheatres`, plus `use<X>` by id, `useInfiniteRecordings`, and add/update/delete mutations). This file owns:
- Query keys (`QUERY_KEYS`) and cache invalidation on mutation success.
- Conversion between plain UI input (`RecordingInput` — JS `Date`, id strings) and Firestore format (`Timestamp`, `DocumentReference`), done inside the mutation hooks.
- `removeUndefinedValues` — Firestore rejects `undefined` field values, so every write is filtered through it. Keep doing this for new write paths.

**Denormalized data model** (`src/types/index.ts`): a `Recording` stores relationships three ways — `artistIds`/`composerIds`/`lyricistIds` (string ids), `artistRefs`/`composerRefs`/`lyricistRefs` (DocumentReferences), and denormalized display copies (`artistNames`, `theatreName`, `city`). Writes must keep all of these in sync (see `useAddRecording`/`useUpdateRecording` for the pattern). Search (`src/app/search/page.tsx`) filters client-side over the full `useRecordings()` result using the denormalized name fields.

**Auth** (`src/context/AuthContext.tsx` → `useAuth` hook): Firebase Google sign-in, then a role lookup against the `users` Firestore collection **keyed by email** — this is an allowlist; users not in the collection are signed out of app state. Roles are `viewer` | `editor` | `admin`. `src/app/admin/layout.tsx` wraps everything in `<AuthGuard allowedRoles={['editor', 'admin']}>`, which redirects unauthenticated users to `/login`.

## Testing

Vitest + React Testing Library, jsdom environment, `globals: true` (no need to import `describe`/`it`/`expect`). Tests live in `__tests__/` directories or as `*.test.ts(x)` next to the code.

- Firebase and `next/navigation` are mocked globally in `src/test/setup.ts` — no per-test Firebase setup needed.
- Render components with the custom `render` from `@/test/utils` (wraps providers); mock data lives in `src/test/mockData.ts`.
- Path alias `@/` → `src/` (configured in both `tsconfig.json` and `vitest.config.ts`).

See TESTING.md for detailed patterns.

All routes except `/login` pass through root `AppAccess`. Firestore and Storage rules enforce the same verified-email allowlist on direct data access. See DEPLOYMENT.md for token revocation and external-sharing rollout requirements. Never treat robots.txt or a client-side redirect as data security.
