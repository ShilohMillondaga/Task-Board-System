import { getBoards, getTaskAnalytics } from '@/lib/actions';
import { DashboardClient } from './dashboard-client';

export default async function Home() {
  const [boards, analytics] = await Promise.all([
    getBoards(),
    getTaskAnalytics(),
  ]);

  return <DashboardClient boards={boards} analytics={analytics} />;
}
