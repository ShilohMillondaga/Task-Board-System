# Task-Board-System

A task management system with multiple boards and tasks. Each board contains multiple tasks that can be created, updated, and deleted.

## Requirements

- **Node.js**: Version 18.0 or higher
- **Package Manager**: npm 
- **Database**: SQLite (configured for local development)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Prisma ORM**
- **SQLite**
- **Tailwind CSS**

## Features

- **Dashboard** – View all boards as cards, create new boards via a modal, and navigate to board detail.
- **Board Detail with Task CRUD** – View a single board with three status columns (To Do, In Progress, Done); create, update (title/status), and delete tasks.
- **Search / Filter / Sort** – Filter tasks by status (TO DO, IN PROGRESS, DONE) and sort tasks by created date (newest or oldest first).
- **Analytics (Option A)** – Stats section on the Dashboard showing total tasks, counts per status, and the percentage of completed (done) tasks.
