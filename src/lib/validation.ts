import { z } from "zod";

import {
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  type ProjectStatus,
  type ProjectPriority,
} from "./types";

function parseDate(value: unknown, fieldName: string): Date {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error(`${fieldName} must be a valid date`);
    }
    return value;
  }

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${fieldName} must be a valid date`);
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldName} must be a valid date`);
  }

  return parsed;
}

const dateField = (fieldName: string) =>
  z.preprocess(
    (value) => parseDate(value, fieldName),
    z.date({ required_error: `${fieldName} is required` }),
  );

const projectFields = {
  clientName: z
    .string({ required_error: "Client name is required" })
    .trim()
    .min(1, "Client name is required")
    .max(200, "Client name is too long"),
  projectName: z
    .string({ required_error: "Project name is required" })
    .trim()
    .min(1, "Project name is required")
    .max(200, "Project name is too long"),
  description: z.string().max(2000, "Description is too long").optional().default(""),
  status: z.enum(PROJECT_STATUSES, {
    errorMap: () => ({ message: "Status must be valid" }),
  }),
  priority: z.enum(PROJECT_PRIORITIES, {
    errorMap: () => ({ message: "Priority must be valid" }),
  }),
  startDate: dateField("Start date"),
  dueDate: dateField("Due date"),
};

export const createProjectSchema = z
  .object(projectFields)
  .refine((data) => data.dueDate >= data.startDate, {
    message: "Due date cannot be earlier than start date",
    path: ["dueDate"],
  });

export const updateProjectSchema = z
  .object(projectFields)
  .refine((data) => data.dueDate >= data.startDate, {
    message: "Due date cannot be earlier than start date",
    path: ["dueDate"],
  });

export const projectIdSchema = z.string().cuid("Invalid project id");

export type CreateProjectData = z.infer<typeof createProjectSchema>;
export type UpdateProjectData = z.infer<typeof updateProjectSchema>;

export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};

  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : "root";
    if (!formatted[key]) {
      formatted[key] = [];
    }
    formatted[key].push(issue.message);
  }

  return formatted;
}

export function isProjectStatus(value: string): value is ProjectStatus {
  return (PROJECT_STATUSES as readonly string[]).includes(value);
}

export function isProjectPriority(value: string): value is ProjectPriority {
  return (PROJECT_PRIORITIES as readonly string[]).includes(value);
}
