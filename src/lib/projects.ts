import type { Project } from "@prisma/client";

import type { ProjectRecord } from "./types";
import { isProjectPriority, isProjectStatus } from "./validation";

export function serializeProject(project: Project): ProjectRecord {
  const status = isProjectStatus(project.status) ? project.status : "planning";
  const priority = isProjectPriority(project.priority)
    ? project.priority
    : "medium";

  return {
    id: project.id,
    clientName: project.clientName,
    projectName: project.projectName,
    description: project.description,
    status,
    priority,
    startDate: project.startDate.toISOString(),
    dueDate: project.dueDate.toISOString(),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}
