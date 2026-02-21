# AI Workflow

## Tool

- **Cursor** with **Sonnet 4.6**

## Prompts

### Master Prompt (Project Initialization): "Initialize a Next.js 14 project using the App Router, TypeScript, and Tailwind CSS. Set up Prisma with SQLite for local development. Create a schema with two tables: 'Board' (id, name, created_at) and 'Task' (id, board_id, title, status, created_at). Ensure one Board has many Tasks and use 'onDelete: Cascade' so deleting a Board deletes its Tasks. The Task status must be a string union: 'todo', 'in_progress', or 'done'."

Used to bootstrap the project so the AI had full context from the start. It specified:

- Next.js 14 with App Router, TypeScript, and Tailwind CSS
- Prisma with SQLite for local development
- Schema: **Board** (`id`, `name`, `created_at`) and **Task** (`id`, `board_id`, `title`, `status`, `created_at`)
- One Board has many Tasks, with `onDelete: Cascade`
- Task status as a string union: `'todo' | 'in_progress' | 'done'`

This prompt was written to be **comprehensive** so the AI understood the full data relationship (boards → tasks, cascade delete, status constraints) before writing any code.

### Prompt for Dashboard & Board Detail Pages: "Create Next.js Server Actions in a lib/actions folder for all CRUD operations:
Boards: Create, Get All, Get One with Tasks, and Delete.
Tasks: Create, Update Status/Title, and Delete.
Include Zod validation for required fields and return proper error messages and status codes."

Used to build the two main pages in one go. It specified:

- **Dashboard (`app/page.tsx`)**  
  Fetch and display all boards as clickable cards; a “New Board” button opening a modal with a name input; navigation to `/board/[id]` when a board is clicked.

- **Board Detail (`app/board/[id]/page.tsx`)**  
  Board name at the top; three columns for statuses (todo, in_progress, done); a “Create Task” form; per-task actions to change status, edit title, and delete; and a requirement that **all actions reflect immediately** using `router.refresh()` or `useOptimistic` (no full page reload).

Again, the prompt was written to be **comprehensive** so the AI understood the full flow (data flow, navigation, and immediate UI updates) and could implement both pages and their behavior in one pass.

---

## Process

1. **AI-driven**  
   - Project scaffolding (Next.js, Tailwind, Prisma)  
   - Prisma schema (Board, Task, relations, cascade delete)  
   - Server Actions in `lib/actions.ts` (CRUD for boards and tasks, Zod validation, `revalidatePath`)

2. **Manual refinement**  
   - Tailwind UI layout (spacing, cards, colors)  
   - Verification of task status logic (filter/sort, status transitions)

3. **Bug fix**  
   - One issue where the UI did not update right after mutations; fixed by ensuring **`router.refresh()`** was called after every mutation so the UI updates immediately without a full page refresh.

---

## Time Management

| Window        | Focus                          |
|---------------|---------------------------------|
| **12:05–12:30** | Setup & database (init, schema, migrate) |
| **12:30–1:15** | UI & Server Actions (pages, CRUD, actions) |
| **1:15–1:30**  | Analytics & filtering (stats, filter/sort) |
| **1:30–2:05**  | Documentation & deployment (README, AI_WORKFLOW, etc.) |
