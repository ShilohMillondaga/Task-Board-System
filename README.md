# Task-Board-System

A task management system with multiple boards and tasks. Each board contains multiple tasks that can be created, updated, and deleted.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Prisma** with SQLite (local development)

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Generate Prisma client & run migrations**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

3. **Start the dev server**
   ```bash
   npm run dev
   ```

## Database Schema

- **Board**: `id`, `name`, `createdAt`
- **Task**: `id`, `boardId`, `title`, `status`, `createdAt`
- One Board has many Tasks (cascade delete: deleting a Board deletes its Tasks)
- Task status: `todo` | `in_progress` | `done`
