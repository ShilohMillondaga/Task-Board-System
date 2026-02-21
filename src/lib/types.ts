/**
 * Task status string union - use this for type-safe status values in the app.
 * Stored as a string in the DB: 'todo' | 'in_progress' | 'done'
 */
export type TaskStatus = "todo" | "in_progress" | "done";
