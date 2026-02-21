import { notFound } from 'next/navigation';

import { getBoardWithTasks } from '@/lib/actions';
import { BoardDetailClient } from '@/app/dashboard-client';

type PageProps = {
  params: { id: string };
};

export default async function BoardPage({ params }: PageProps) {
  const board = await getBoardWithTasks(params.id);

  if (!board) {
    notFound();
  }

  return <BoardDetailClient board={board} />;
}

