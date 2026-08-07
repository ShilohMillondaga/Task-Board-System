'use client';

import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import {
  AlertCircle,
  Calendar,
  Filter,
  FolderKanban,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';

import {
  createProject,
  deleteProject,
  emptyProjectForm,
  fetchProjects,
  getFieldErrors,
  projectToForm,
  updateProject,
} from '@/lib/project-api';
import {
  PRIORITY_LABELS,
  PROJECT_PRIORITIES,
  PROJECT_STATUSES,
  STATUS_LABELS,
  type ProjectInput,
  type ProjectPriority,
  type ProjectRecord,
  type ProjectStatus,
} from '@/lib/types';

type SortField = 'dueDate' | 'startDate' | 'projectName' | 'clientName' | 'priority';
type SortOrder = 'asc' | 'desc';

const PRIORITY_STYLES: Record<ProjectPriority, string> = {
  low: 'bg-sky-500/15 text-sky-300 ring-sky-500/30',
  medium: 'bg-amber-500/15 text-amber-300 ring-amber-500/30',
  high: 'bg-rose-500/15 text-rose-300 ring-rose-500/30',
};

const STATUS_STYLES: Record<ProjectStatus, string> = {
  planning: 'bg-violet-500/15 text-violet-300 ring-violet-500/30',
  in_progress: 'bg-blue-500/15 text-blue-300 ring-blue-500/30',
  on_hold: 'bg-orange-500/15 text-orange-300 ring-orange-500/30',
  completed: 'bg-emerald-500/15 text-emerald-300 ring-emerald-500/30',
};

const PRIORITY_RANK: Record<ProjectPriority, number> = {
  low: 1,
  medium: 2,
  high: 3,
};

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function isOverdue(project: ProjectRecord) {
  if (project.status === 'completed') return false;
  const due = new Date(project.dueDate);
  due.setHours(23, 59, 59, 999);
  return due.getTime() < Date.now();
}

type ProjectFormModalProps = {
  mode: 'create' | 'edit';
  initialValues: ProjectInput;
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ProjectInput) => void;
  serverErrors: Record<string, string> | null;
  generalError: string | null;
};

function ProjectFormModal({
  mode,
  initialValues,
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
  serverErrors,
  generalError,
}: ProjectFormModalProps) {
  const [form, setForm] = useState<ProjectInput>(initialValues);
  const [clientError, setClientError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm(initialValues);
      setClientError(null);
    }
  }, [initialValues, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setClientError(null);

    if (!form.clientName.trim()) {
      setClientError('Client name is required');
      return;
    }
    if (!form.projectName.trim()) {
      setClientError('Project name is required');
      return;
    }
    if (form.dueDate < form.startDate) {
      setClientError('Due date cannot be earlier than start date');
      return;
    }

    onSubmit({
      ...form,
      clientName: form.clientName.trim(),
      projectName: form.projectName.trim(),
      description: form.description.trim(),
    });
  };

  const fieldError = (name: keyof ProjectInput) =>
    serverErrors?.[name] ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-form-title"
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 id="project-form-title" className="text-lg font-semibold text-slate-50">
              {mode === 'create' ? 'Create Project' : 'Edit Project'}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {mode === 'create'
                ? 'Add a new client project to the tracker.'
                : 'Update project details and timeline.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="clientName" className="field-label">
                Client Name *
              </label>
              <input
                id="clientName"
                value={form.clientName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, clientName: e.target.value }))
                }
                className="field-input"
                placeholder="Acme Corp"
              />
              {fieldError('clientName') && (
                <p className="field-error">{fieldError('clientName')}</p>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="projectName" className="field-label">
                Project Name *
              </label>
              <input
                id="projectName"
                value={form.projectName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, projectName: e.target.value }))
                }
                className="field-input"
                placeholder="Website Redesign"
              />
              {fieldError('projectName') && (
                <p className="field-error">{fieldError('projectName')}</p>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="description" className="field-label">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                className="field-input resize-none"
                placeholder="Brief overview of scope and deliverables"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="status" className="field-label">
                Status
              </label>
              <select
                id="status"
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    status: e.target.value as ProjectStatus,
                  }))
                }
                className="field-input"
              >
                {PROJECT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              {fieldError('status') && (
                <p className="field-error">{fieldError('status')}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="priority" className="field-label">
                Priority
              </label>
              <select
                id="priority"
                value={form.priority}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    priority: e.target.value as ProjectPriority,
                  }))
                }
                className="field-input"
              >
                {PROJECT_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {PRIORITY_LABELS[priority]}
                  </option>
                ))}
              </select>
              {fieldError('priority') && (
                <p className="field-error">{fieldError('priority')}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="startDate" className="field-label">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className="field-input"
              />
              {fieldError('startDate') && (
                <p className="field-error">{fieldError('startDate')}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="dueDate" className="field-label">
                Due Date
              </label>
              <input
                id="dueDate"
                type="date"
                value={form.dueDate}
                min={form.startDate}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, dueDate: e.target.value }))
                }
                className="field-input"
              />
              {fieldError('dueDate') && (
                <p className="field-error">{fieldError('dueDate')}</p>
              )}
            </div>
          </div>

          {(clientError || generalError) && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{clientError ?? generalError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting
                ? 'Saving…'
                : mode === 'create'
                  ? 'Create Project'
                  : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type DeleteModalProps = {
  project: ProjectRecord | null;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

function DeleteModal({ project, isSubmitting, onClose, onConfirm }: DeleteModalProps) {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
        <h2 className="text-lg font-semibold text-slate-50">Delete Project</h2>
        <p className="mt-2 text-sm text-slate-400">
          Are you sure you want to delete{' '}
          <span className="font-medium text-slate-200">{project.projectName}</span>{' '}
          for {project.clientName}? This action cannot be undone.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="inline-flex items-center rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-400 disabled:opacity-70"
          >
            {isSubmitting ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ProjectsClient() {
  const [projects, setProjects] = useState<ProjectRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | 'all'>('all');
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [editingProject, setEditingProject] = useState<ProjectRecord | null>(null);
  const [deletingProject, setDeletingProject] = useState<ProjectRecord | null>(null);
  const [formValues, setFormValues] = useState<ProjectInput>(emptyProjectForm());
  const [formErrors, setFormErrors] = useState<Record<string, string> | null>(null);
  const [formGeneralError, setFormGeneralError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await fetchProjects();
      setProjects(data);
    } catch (error) {
      setLoadError(
        error instanceof Error ? error.message : 'Failed to load projects',
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = projects.filter((project) => {
      const matchesSearch =
        !query ||
        project.clientName.toLowerCase().includes(query) ||
        project.projectName.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all' || project.status === statusFilter;

      const matchesPriority =
        priorityFilter === 'all' || project.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });

    return [...filtered].sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'clientName':
        case 'projectName':
          comparison = a[sortField].localeCompare(b[sortField]);
          break;
        case 'priority':
          comparison = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
          break;
        case 'startDate':
        case 'dueDate':
          comparison =
            new Date(a[sortField]).getTime() - new Date(b[sortField]).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [projects, search, statusFilter, priorityFilter, sortField, sortOrder]);

  const stats = useMemo(() => {
    const byStatus = PROJECT_STATUSES.reduce(
      (acc, status) => {
        acc[status] = projects.filter((p) => p.status === status).length;
        return acc;
      },
      {} as Record<ProjectStatus, number>,
    );

    return {
      total: projects.length,
      active: projects.filter((p) => p.status === 'in_progress').length,
      overdue: projects.filter(isOverdue).length,
      byStatus,
    };
  }, [projects]);

  const openCreateModal = () => {
    setFormMode('create');
    setEditingProject(null);
    setFormValues(emptyProjectForm());
    setFormErrors(null);
    setFormGeneralError(null);
  };

  const openEditModal = (project: ProjectRecord) => {
    setFormMode('edit');
    setEditingProject(project);
    setFormValues(projectToForm(project));
    setFormErrors(null);
    setFormGeneralError(null);
  };

  const closeFormModal = () => {
    setFormMode(null);
    setEditingProject(null);
    setFormErrors(null);
    setFormGeneralError(null);
  };

  const handleFormSubmit = (values: ProjectInput) => {
    startTransition(async () => {
      setFormErrors(null);
      setFormGeneralError(null);

      try {
        if (formMode === 'create') {
          const created = await createProject(values);
          setProjects((prev) => [created, ...prev]);
        } else if (formMode === 'edit' && editingProject) {
          const updated = await updateProject(editingProject.id, values);
          setProjects((prev) =>
            prev.map((p) => (p.id === updated.id ? updated : p)),
          );
        }
        closeFormModal();
      } catch (error) {
        const fieldErrors = getFieldErrors(error);
        if (fieldErrors) {
          setFormErrors(fieldErrors);
        }
        setFormGeneralError(
          error instanceof Error ? error.message : 'Failed to save project',
        );
      }
    });
  };

  const handleDelete = () => {
    if (!deletingProject) return;

    startTransition(async () => {
      try {
        await deleteProject(deletingProject.id);
        setProjects((prev) => prev.filter((p) => p.id !== deletingProject.id));
        setDeletingProject(null);
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : 'Failed to delete project',
        );
      }
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 ring-1 ring-emerald-500/20">
              <FolderKanban className="h-3.5 w-3.5" />
              Digital Agency
            </div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Client Project Tracker
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-400">
              Track client projects, monitor progress, and manage priorities across your agency portfolio.
            </p>
          </div>
          <button type="button" onClick={openCreateModal} className="btn-primary">
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Projects" value={stats.total} />
          <StatCard label="In Progress" value={stats.active} accent="text-blue-300" />
          <StatCard label="Overdue" value={stats.overdue} accent="text-rose-300" />
          <StatCard label="Completed" value={stats.byStatus.completed} accent="text-emerald-300" />
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[220px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search client, project, or description…"
                className="field-input pl-9"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-500" />
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as ProjectStatus | 'all')
                }
                className="field-input w-auto"
              >
                <option value="all">All statuses</option>
                {PROJECT_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>
              <select
                value={priorityFilter}
                onChange={(e) =>
                  setPriorityFilter(e.target.value as ProjectPriority | 'all')
                }
                className="field-input w-auto"
              >
                <option value="all">All priorities</option>
                {PROJECT_PRIORITIES.map((priority) => (
                  <option key={priority} value={priority}>
                    {PRIORITY_LABELS[priority]}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={sortField}
                onChange={(e) => setSortField(e.target.value as SortField)}
                className="field-input w-auto"
              >
                <option value="dueDate">Sort by due date</option>
                <option value="startDate">Sort by start date</option>
                <option value="projectName">Sort by project name</option>
                <option value="clientName">Sort by client name</option>
                <option value="priority">Sort by priority</option>
              </select>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
                className="field-input w-auto"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
          {isLoading ? (
            <div className="px-6 py-16 text-center text-sm text-slate-400">
              Loading projects…
            </div>
          ) : loadError ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm text-red-300">{loadError}</p>
              <button
                type="button"
                onClick={() => void loadProjects()}
                className="btn-secondary mt-4"
              >
                Retry
              </button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-sm text-slate-400">
                {projects.length === 0
                  ? 'No projects yet. Create your first client project to get started.'
                  : 'No projects match your current filters.'}
              </p>
              {projects.length === 0 && (
                <button type="button" onClick={openCreateModal} className="btn-primary mt-4">
                  Create Project
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-800 bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">Client</th>
                    <th className="px-4 py-3 font-medium">Project</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Priority</th>
                    <th className="px-4 py-3 font-medium">Timeline</th>
                    <th className="px-4 py-3 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredProjects.map((project) => (
                    <tr key={project.id} className="hover:bg-slate-900/60">
                      <td className="px-4 py-4 align-top">
                        <p className="font-medium text-slate-100">{project.clientName}</p>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <p className="font-medium text-slate-100">{project.projectName}</p>
                        {project.description && (
                          <p className="mt-1 max-w-xs text-xs text-slate-500 line-clamp-2">
                            {project.description}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${STATUS_STYLES[project.status]}`}
                        >
                          {STATUS_LABELS[project.status]}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${PRIORITY_STYLES[project.priority]}`}
                        >
                          {PRIORITY_LABELS[project.priority]}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex items-start gap-2 text-xs text-slate-400">
                          <Calendar className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                          <div>
                            <p>{formatDate(project.startDate)} → {formatDate(project.dueDate)}</p>
                            {isOverdue(project) && (
                              <p className="mt-1 font-medium text-rose-400">Overdue</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(project)}
                            className="inline-flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-700"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingProject(project)}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-500/10 px-2.5 py-1.5 text-xs text-red-300 hover:bg-red-500/20"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <ProjectFormModal
        mode={formMode === 'edit' ? 'edit' : 'create'}
        initialValues={formValues}
        isOpen={formMode !== null}
        isSubmitting={isPending}
        onClose={closeFormModal}
        onSubmit={handleFormSubmit}
        serverErrors={formErrors}
        generalError={formGeneralError}
      />

      <DeleteModal
        project={deletingProject}
        isSubmitting={isPending}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDelete}
      />
    </main>
  );
}

function StatCard({
  label,
  value,
  accent = 'text-slate-50',
}: {
  label: string;
  value: number;
  accent?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}
