# Architecture

## Tech Choices

- **App Router** for modern server-side rendering and clear route structure.
- **SQLite with Prisma** for rapid local development and easy portability (single file DB, no separate server).

## Data Structure

- **Board → Task** is a one-to-many relationship: one board has many tasks.
- **`onDelete: Cascade`** is set on the Task–Board relation so that when a board is deleted, all its tasks are removed automatically.

## API Design

- **Next.js Server Actions** are used instead of API routes so that:
  - Logic stays co-located with the components that use it.
  - Boilerplate is reduced (no route handlers, request/response wiring, or separate client fetch code).

## Frontend Organization

- Structure follows the **Next.js App Router** filesystem (`app/`, `app/board/[id]/`, etc.).
- **State management** is kept minimal: Server Actions plus **`router.refresh()`** after mutations so the UI reflects the latest data. No global store (e.g. Redux/Zustand) is used.

## Future Improvements and Considerations

With more time, planned additions would include:

- **Drag-and-drop** for moving tasks between status columns (e.g. todo → in progress → done).
- **User authentication** so boards and tasks can be scoped per user.
- **Data exporting** for downloading all board data as a JSON or CSV file

