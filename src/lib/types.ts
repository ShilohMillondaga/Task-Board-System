/**
 * Task status string union - use this for type-safe status values in the app.
 * Maps to Prisma's TaskStatus enum: 'todo' | 'in_progress' | 'done'
 */
export type TaskStatus = "todo" | "in_progress" | "done";
