'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import type { Board, Task } from '@prisma/client';
import type { TaskStatus } from '@/lib/types';
import {
  createBoard,
  createTask,
  deleteBoard,
  deleteTask,
  updateTaskStatus,
  updateTaskTitle,
} from '@/lib/actions';

type DashboardClientProps = {
  boards: Board[];
};

export function DashboardClient({ boards }: DashboardClientProps) {
  const router = useRouter();
  const [isCreating, startCreateTransition] = useTransition();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [boardName, setBoardName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleCreateBoard = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const name = boardName.trim();
    if (!name) {
      setError('Name is required');
      return;
    }

    startCreateTransition(async () => {
      try {
        await createBoard({ name }, { revalidatePath: '/' });
        setBoardName('');
        setIsModalOpen(false);
        router.refresh();
      } catch (err) {
        console.error(err);
        setError('Failed to create board');
      }
    });
  };

  const handleDeleteBoard = (id: string) => {
    startCreateTransition(async () => {
      try {
        await deleteBoard(id, { revalidatePath: '/' });
        router.refresh();
      } catch (err) {
        console.error(err);
        // leave error silent for now
      }
    });
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8">
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Task Board System
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Manage multiple boards and tasks in one place.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
          >
            New Board
          </button>
        </header>

        <section>
          {boards.length === 0 ? (
            <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 px-6 py-16 text-center">
              <p className="text-sm text-slate-400">
                You don&apos;t have any boards yet.
              </p>
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="mt-4 inline-flex items-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-emerald-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                Create your first board
              </button>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {boards.map((board) => (
                <article
                  key={board.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm transition hover:border-emerald-500/60 hover:bg-slate-900"
                >
                  <Link
                    href={`/board/${board.id}`}
                    className="flex-1"
                  >
                    <h2 className="text-base font-semibold text-slate-50 group-hover:text-emerald-300">
                      {board.name}
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Created{' '}
                      {new Date(board.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </Link>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                      Board
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteBoard(board.id)}
                      className="text-xs text-slate-500 hover:text-red-400"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-50">
              Create New Board
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Give your board a short, descriptive name.
            </p>

            <form
              onSubmit={handleCreateBoard}
              className="mt-4 space-y-4"
            >
              <div className="space-y-1.5">
                <label
                  htmlFor="board-name"
                  className="block text-xs font-medium uppercase tracking-wide text-slate-400"
                >
                  Board Name
                </label>
                <input
                  id="board-name"
                  name="name"
                  value={boardName}
                  onChange={(e) => setBoardName(e.target.value)}
                  autoFocus
                  className="block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  placeholder="e.g. Product Roadmap"
                />
                {error && (
                  <p className="text-xs text-red-400">{error}</p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setBoardName('');
                    setError(null);
                  }}
                  className="rounded-lg px-3 py-1.5 text-sm text-slate-300 hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="inline-flex items-center rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isCreating ? 'Creating…' : 'Create Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

type BoardDetailClientProps = {
  board: Board & { tasks: Task[] };
};

const STATUS_COLUMNS: { id: TaskStatus; label: string; accent: string }[] = [
  { id: 'todo', label: 'To Do', accent: 'border-sky-500/60' },
  { id: 'in_progress', label: 'In Progress', accent: 'border-amber-400/60' },
  { id: 'done', label: 'Done', accent: 'border-emerald-500/60' },
];

type StatusFilter = TaskStatus | 'all';
type SortOrder = 'newest' | 'oldest';

export function BoardDetailClient({ board }: BoardDetailClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleCreateTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = title.trim();
    if (!trimmed) return;

    startTransition(async () => {
      try {
        await createTask(
          {
            boardId: board.id,
            title: trimmed,
            status,
          },
          { revalidatePath: `/board/${board.id}` },
        );
        setTitle('');
        setStatus('todo');
        router.refresh();
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleChangeStatus = (taskId: string, nextStatus: TaskStatus) => {
    startTransition(async () => {
      try {
        await updateTaskStatus(
          { id: taskId, status: nextStatus },
          { revalidatePath: `/board/${board.id}` },
        );
        router.refresh();
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleStartEditTitle = (task: Task) => {
    setEditingTaskId(task.id);
    setEditingTitle(task.title);
  };

  const handleSaveTitle = (taskId: string) => {
    const trimmed = editingTitle.trim();
    if (!trimmed) {
      setEditingTaskId(null);
      return;
    }

    startTransition(async () => {
      try {
        await updateTaskTitle(
          { id: taskId, title: trimmed },
          { revalidatePath: `/board/${board.id}` },
        );
        setEditingTaskId(null);
        setEditingTitle('');
        router.refresh();
      } catch (err) {
        console.error(err);
      }
    });
  };

  const handleDeleteTask = (taskId: string) => {
    startTransition(async () => {
      try {
        await deleteTask(taskId, { revalidatePath: `/board/${board.id}` });
        router.refresh();
      } catch (err) {
        console.error(err);
      }
    });
  };

  const tasksByStatus = (columnStatus: TaskStatus) => {
    const filtered = board.tasks.filter((task) => task.status === columnStatus);
    const sorted = [...filtered].sort((a, b) => {
      const da = new Date(a.createdAt).getTime();
      const db = new Date(b.createdAt).getTime();
      return sortOrder === 'newest' ? db - da : da - db;
    });
    return sorted;
  };

  const columnsToShow =
    statusFilter === 'all'
      ? STATUS_COLUMNS
      : STATUS_COLUMNS.filter((c) => c.id === statusFilter);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/"
              className="text-xs font-medium uppercase tracking-wide text-slate-400 hover:text-slate-200"
            >
              ← Back to boards
            </Link>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {board.name}
            </h1>
          </div>
          <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-400">
            {board.tasks.length} task
            {board.tasks.length === 1 ? '' : 's'}
          </span>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 shadow-inner">
          <form
            onSubmit={handleCreateTask}
            className="flex flex-wrap items-end gap-3"
          >
            <div className="flex-1 min-w-[200px] space-y-1.5">
              <label
                htmlFor="task-title"
                className="block text-xs font-medium uppercase tracking-wide text-slate-400"
              >
                New Task
              </label>
              <input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none transition placeholder:text-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              />
            </div>

            <div className="w-40 space-y-1.5">
              <label
                htmlFor="task-status"
                className="block text-xs font-medium uppercase tracking-wide text-slate-400"
              >
                Status
              </label>
              <select
                id="task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="block w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 shadow-sm outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
              >
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-slate-950 shadow-sm transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isPending ? 'Creating…' : 'Create Task'}
            </button>
          </form>
        </section>

        <section className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label
              htmlFor="status-filter"
              className="text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Filter
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as StatusFilter)
              }
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
            >
              <option value="all">All statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="sort-order"
              className="text-xs font-medium uppercase tracking-wide text-slate-400"
            >
              Sort
            </label>
            <select
              id="sort-order"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-50 outline-none transition focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
            </select>
          </div>
        </section>

        <section
          className={`grid gap-4 ${columnsToShow.length === 1 ? 'md:grid-cols-1' : 'md:grid-cols-3'}`}
        >
          {columnsToShow.map((column) => (
            <div
              key={column.id}
              className={`flex flex-col gap-3 rounded-2xl border bg-slate-900/40 p-3 ${column.accent}`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-200">
                  {column.label}
                </h2>
                <span className="text-xs text-slate-500">
                  {tasksByStatus(column.id).length}
                </span>
              </div>
              <div className="space-y-2">
                {tasksByStatus(column.id).length === 0 ? (
                  <p className="rounded-lg border border-dashed border-slate-700 bg-slate-900/40 p-3 text-xs text-slate-500">
                    No tasks in this column.
                  </p>
                ) : (
                  tasksByStatus(column.id).map((task) => (
                    <div
                      key={task.id}
                      className="rounded-xl border border-slate-800 bg-slate-900 p-3 text-sm shadow-sm"
                    >
                      {editingTaskId === task.id ? (
                        <div className="space-y-2">
                          <input
                            value={editingTitle}
                            onChange={(e) => setEditingTitle(e.target.value)}
                            className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-2 py-1.5 text-xs text-slate-50 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                          />
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingTaskId(null);
                                setEditingTitle('');
                              }}
                              className="rounded-md px-2 py-1 text-[11px] text-slate-300 hover:bg-slate-800"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveTitle(task.id)}
                              className="rounded-md bg-emerald-500 px-2 py-1 text-[11px] font-medium text-slate-950 hover:bg-emerald-400"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className="text-slate-50">{task.title}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                            <span className="rounded-full bg-slate-950 px-2 py-0.5">
                              {new Date(
                                task.createdAt,
                              ).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartEditTitle(task)}
                              className="rounded-full bg-slate-800 px-2 py-0.5 text-slate-200 hover:bg-slate-700"
                            >
                              Edit
                            </button>
                            {STATUS_COLUMNS.filter(
                              (s) => s.id !== task.status,
                            ).map((s) => (
                              <button
                                key={s.id}
                                type="button"
                                onClick={() =>
                                  handleChangeStatus(task.id, s.id)
                                }
                                className="rounded-full bg-slate-800 px-2 py-0.5 hover:bg-slate-700"
                              >
                                Move to {s.label}
                              </button>
                            ))}
                            <button
                              type="button"
                              onClick={() => handleDeleteTask(task.id)}
                              className="ml-auto rounded-full bg-red-500/10 px-2 py-0.5 text-red-300 hover:bg-red-500/20"
                            >
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}

