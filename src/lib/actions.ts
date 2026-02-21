'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { prisma } from './prisma';
import type { TaskStatus } from './types';

const DEFAULT_REVALIDATE_PATH = '/';

const boardIdSchema = z.string().cuid('Invalid board id');
const taskIdSchema = z.string().cuid('Invalid task id');

const createBoardSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
});

const createTaskSchema = z.object({
  boardId: boardIdSchema,
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  status: z
    .union([
      z.literal<'todo'>('todo'),
      z.literal<'in_progress'>('in_progress'),
      z.literal<'done'>('done'),
    ])
    .optional()
    .default('todo'),
});

const updateTaskStatusSchema = z.object({
  id: taskIdSchema,
  status: z.union([
    z.literal<'todo'>('todo'),
    z.literal<'in_progress'>('in_progress'),
    z.literal<'done'>('done'),
  ]),
});

const updateTaskTitleSchema = z.object({
  id: taskIdSchema,
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
});

type CreateBoardInput = z.infer<typeof createBoardSchema>;
type CreateTaskInput = z.infer<typeof createTaskSchema>;
type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>;
type UpdateTaskTitleInput = z.infer<typeof updateTaskTitleSchema>;

export async function createBoard(
  input: CreateBoardInput,
  options: { revalidatePath?: string } = {},
) {
  const { name } = createBoardSchema.parse(input);

  const board = await prisma.board.create({
    data: { name },
  });

  revalidatePath(options.revalidatePath ?? DEFAULT_REVALIDATE_PATH);

  return board;
}

export async function getBoards() {
  const boards = await prisma.board.findMany({
    orderBy: { createdAt: 'desc' },
  });

  return boards;
}

export async function getBoardWithTasks(boardId: string) {
  const id = boardIdSchema.parse(boardId);

  const board = await prisma.board.findUnique({
    where: { id },
    include: {
      tasks: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  return board;
}

export async function deleteBoard(
  boardId: string,
  options: { revalidatePath?: string } = {},
) {
  const id = boardIdSchema.parse(boardId);

  await prisma.board.delete({
    where: { id },
  });

  revalidatePath(options.revalidatePath ?? DEFAULT_REVALIDATE_PATH);
}

export async function createTask(
  input: CreateTaskInput,
  options: { revalidatePath?: string } = {},
) {
  const parsed = createTaskSchema.parse(input);

  const task = await prisma.task.create({
    data: {
      boardId: parsed.boardId,
      title: parsed.title,
      status: parsed.status as TaskStatus,
    },
  });

  revalidatePath(options.revalidatePath ?? DEFAULT_REVALIDATE_PATH);

  return task;
}

export async function updateTaskStatus(
  input: UpdateTaskStatusInput,
  options: { revalidatePath?: string } = {},
) {
  const { id, status } = updateTaskStatusSchema.parse(input);

  const task = await prisma.task.update({
    where: { id },
    data: { status: status as TaskStatus },
  });

  revalidatePath(options.revalidatePath ?? DEFAULT_REVALIDATE_PATH);

  return task;
}

export async function updateTaskTitle(
  input: UpdateTaskTitleInput,
  options: { revalidatePath?: string } = {},
) {
  const { id, title } = updateTaskTitleSchema.parse(input);

  const task = await prisma.task.update({
    where: { id },
    data: { title },
  });

  revalidatePath(options.revalidatePath ?? DEFAULT_REVALIDATE_PATH);

  return task;
}

export async function deleteTask(
  taskId: string,
  options: { revalidatePath?: string } = {},
) {
  const id = taskIdSchema.parse(taskId);

  await prisma.task.delete({
    where: { id },
  });

  revalidatePath(options.revalidatePath ?? DEFAULT_REVALIDATE_PATH);
}

