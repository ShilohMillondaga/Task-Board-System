# Client Project Tracker

A full-stack Client Project Tracker for digital agencies. Project managers can track client projects, monitor progress, and manage priorities through a REST API and a responsive web UI.

## Technology Choices

| Layer | Choice | Rationale |
|-------|--------|-----------|
| **Framework** | Next.js 14 (App Router) | Unified frontend + API routes in one codebase |
| **Language** | TypeScript | Type safety across API, validation, and UI |
| **Database** | SQLite via Prisma | Zero-config local development, easy setup for reviewers |
| **Validation** | Zod | Shared schemas for API validation with clear error messages |
| **Styling** | Tailwind CSS | Fast, consistent UI without a heavy component library |

## Requirements

- **Node.js** 18+
- **npm**

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   Copy the example env file (if needed):

   ```bash
   cp .env.example .env
   ```

   Default database URL:

   ```env
   DATABASE_URL="file:./dev.db"
   ```

3. **Run database migrations**

   ```bash
   npx prisma migrate dev
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## How to Run (Production)

```bash
npm run build
npm start
```

## REST API

Base URL: `http://localhost:3000/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/projects` | List all projects |
| `GET` | `/projects/:id` | Get a single project |
| `POST` | `/projects` | Create a project |
| `PUT` | `/projects/:id` | Update a project |
| `DELETE` | `/projects/:id` | Delete a project |

### Project fields

```json
{
  "clientName": "Acme Corp",
  "projectName": "Website Redesign",
  "description": "Optional project overview",
  "status": "planning",
  "priority": "medium",
  "startDate": "2026-01-15",
  "dueDate": "2026-03-30"
}
```

**Status values:** `planning`, `in_progress`, `on_hold`, `completed`

**Priority values:** `low`, `medium`, `high`

### Validation errors

Invalid requests return `400` with structured errors:

```json
{
  "error": "Validation failed",
  "errors": {
    "clientName": ["Client name is required"],
    "dueDate": ["Due date cannot be earlier than start date"]
  }
}
```

## Features

### Core (required)
- Project list with client, status, priority, and timeline
- Create, edit, and delete projects
- Server-side validation for required fields, enums, and date rules

### Bonus
- Search by client, project name, or description
- Filter by status and priority
- Sort by due date, start date, name, client, or priority
- Summary stats (total, in progress, overdue, completed)

## Assumptions

1. **Single-user, local-first** — No authentication; suitable for an internal agency tool or assessment demo.
2. **Description is optional** — Only client name and project name are required.
3. **Status/priority stored as strings** — Human-readable labels are mapped in the UI; API uses snake_case values.
4. **Dates are inclusive** — Due date may equal start date; due date cannot be before start date.
5. **SQLite for simplicity** — Production could swap to PostgreSQL by changing the Prisma datasource only.

## Project Structure

```
src/
├── app/
│   ├── api/projects/       # REST API routes
│   ├── page.tsx            # Main page
│   └── projects-client.tsx # UI (list, forms, filters)
└── lib/
    ├── prisma.ts           # Database client
    ├── types.ts            # Shared types & labels
    ├── validation.ts       # Zod schemas
    ├── projects.ts         # Serialization helpers
    ├── project-api.ts      # Frontend API client
    └── api-utils.ts        # API error handling
prisma/
└── schema.prisma           # Project model
```

---

## Technical Reflection

### Why did you choose this implementation approach?

I used **Next.js with App Router API routes** so the REST API and frontend live in one TypeScript project. That keeps validation logic shared (Zod), reduces deployment complexity, and matches common full-stack patterns. **Prisma + SQLite** keeps setup friction low for reviewers while remaining easy to migrate to PostgreSQL later.

The UI is a **client component that consumes the REST API** via `fetch`, rather than server actions alone. That satisfies the explicit REST requirement and keeps the API usable by other clients (mobile, scripts, integrations).

### What tradeoffs did you make?

- **SQLite over PostgreSQL** — Faster local setup; less ideal for concurrent production writes.
- **No authentication** — Scope stays focused on CRUD and validation; auth would be the next layer.
- **String enums in the database** instead of Prisma enums — Flexible for label changes without migrations, at the cost of DB-level enum enforcement.
- **Client-side filtering/sorting** — Fine for demo scale; a large dataset would move search/filter/sort to the API with pagination.

### What would you improve if given additional time?

- Add **authentication and role-based access** (PM vs admin).
- **Pagination and server-side query params** on `GET /projects`.
- **Unit and integration tests** for validation and API routes (Vitest + supertest or similar).
- **Docker Compose** for one-command startup.
- **Optimistic UI updates** and toast notifications for better UX.
- **Audit log** for project status changes.

### What was the most challenging part of this assessment?

Balancing **assessment requirements** (explicit REST endpoints, validation rules, README reflection) with **polish** (search, filters, clear error UX) without over-scoping. Date validation across time zones and date-only inputs also needed careful handling so “due date before start date” fails predictably.

### Did you use AI tools during development?

**Yes.**

| Tool | How it was used |
|------|-----------------|
| **Cursor (AI-assisted IDE)** | Scaffolding project structure, generating API routes and UI components, drafting README and reflection, and iterating on validation/error handling |

AI accelerated boilerplate and documentation; architecture choices, validation rules, and tradeoffs were reviewed and adjusted to match the requirements.
