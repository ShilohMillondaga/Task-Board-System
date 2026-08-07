import type {
  ProjectInput,
  ProjectPriority,
  ProjectRecord,
  ProjectStatus,
} from "@/lib/types";

const API_BASE = "/api/projects";

export class ApiError extends Error {
  errors?: Record<string, string[]>;

  constructor(message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.errors = errors;
  }
}

async function parseResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof payload.error === "string"
        ? payload.error
        : "Request failed";
    throw new ApiError(message, payload.errors);
  }

  return payload as T;
}

export async function fetchProjects(): Promise<ProjectRecord[]> {
  const response = await fetch(API_BASE, { cache: "no-store" });
  return parseResponse<ProjectRecord[]>(response);
}

export async function fetchProject(id: string): Promise<ProjectRecord> {
  const response = await fetch(`${API_BASE}/${id}`, { cache: "no-store" });
  return parseResponse<ProjectRecord>(response);
}

export async function createProject(
  input: ProjectInput,
): Promise<ProjectRecord> {
  const response = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<ProjectRecord>(response);
}

export async function updateProject(
  id: string,
  input: ProjectInput,
): Promise<ProjectRecord> {
  const response = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parseResponse<ProjectRecord>(response);
}

export async function deleteProject(id: string): Promise<void> {
  const response = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  await parseResponse<{ message: string }>(response);
}

export function toDateInputValue(isoDate: string): string {
  return isoDate.slice(0, 10);
}

export function emptyProjectForm(): ProjectInput {
  const today = new Date().toISOString().slice(0, 10);
  return {
    clientName: "",
    projectName: "",
    description: "",
    status: "planning" as ProjectStatus,
    priority: "medium" as ProjectPriority,
    startDate: today,
    dueDate: today,
  };
}

export function projectToForm(project: ProjectRecord): ProjectInput {
  return {
    clientName: project.clientName,
    projectName: project.projectName,
    description: project.description,
    status: project.status,
    priority: project.priority,
    startDate: toDateInputValue(project.startDate),
    dueDate: toDateInputValue(project.dueDate),
  };
}

export function getFieldErrors(
  error: unknown,
): Record<string, string> | null {
  if (error instanceof ApiError && error.errors) {
    const mapped: Record<string, string> = {};
    for (const [key, messages] of Object.entries(error.errors)) {
      if (Array.isArray(messages) && messages.length > 0) {
        mapped[key] = messages[0];
      }
    }
    return Object.keys(mapped).length > 0 ? mapped : null;
  }
  return null;
}
