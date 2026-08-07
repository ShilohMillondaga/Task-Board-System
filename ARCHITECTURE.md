# Architecture

## Overview

Client Project Tracker is a Next.js full-stack application with a REST API backend and a React client UI.

## Tech Choices

- **Next.js 14 App Router** — Unified frontend and API in one codebase
- **SQLite + Prisma** — Simple local development with typed database access
- **Zod** — Runtime validation with structured error responses
- **Tailwind CSS** — Utility-first styling for the dashboard UI

## Data Model

The `Project` model stores all required fields:

- `id`, `clientName`, `projectName`, `description`
- `status` (`planning` | `in_progress` | `on_hold` | `completed`)
- `priority` (`low` | `medium` | `high`)
- `startDate`, `dueDate`, `createdAt`, `updatedAt`

Indexes on `status` and `priority` support filtering at scale.

## API Design

REST endpoints under `/api/projects`:

| Method | Route | Handler |
|--------|-------|---------|
| GET | `/api/projects` | List all projects |
| POST | `/api/projects` | Create project |
| GET | `/api/projects/[id]` | Get one project |
| PUT | `/api/projects/[id]` | Update project |
| DELETE | `/api/projects/[id]` | Delete project |

Validation runs in route handlers via shared Zod schemas. Invalid input returns `400` with field-level errors.

## Frontend Organization

- `page.tsx` — Server entry point
- `projects-client.tsx` — Client component with list, modals, search/filter/sort
- `lib/project-api.ts` — Fetch wrapper for the REST API

The UI consumes the same REST API that external clients would use, keeping concerns separated.

## Future Improvements

- Authentication and per-user project scoping
- Server-side pagination and query params on list endpoint
- PostgreSQL for production deployments
- Unit/integration tests for validation and routes
