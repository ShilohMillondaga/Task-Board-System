export const PROJECT_STATUSES = [
  "planning",
  "in_progress",
  "on_hold",
  "completed",
] as const;

export const PROJECT_PRIORITIES = ["low", "medium", "high"] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];
export type ProjectPriority = (typeof PROJECT_PRIORITIES)[number];

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: "Planning",
  in_progress: "In Progress",
  on_hold: "On Hold",
  completed: "Completed",
};

export const PRIORITY_LABELS: Record<ProjectPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export type ProjectInput = {
  clientName: string;
  projectName: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  dueDate: string;
};

export type ProjectRecord = {
  id: string;
  clientName: string;
  projectName: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  startDate: string;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
};
