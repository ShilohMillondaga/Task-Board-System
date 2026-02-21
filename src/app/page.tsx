import { getBoards } from '@/lib/actions';
import { DashboardClient } from './dashboard-client';

export default async function Home() {
  const boards = await getBoards();

  return <DashboardClient boards={boards} />;
}
