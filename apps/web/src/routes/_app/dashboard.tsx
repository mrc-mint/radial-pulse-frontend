import { createFileRoute } from '@tanstack/react-router';
import { DashboardPage } from '@radial-pulse/studio-dashboard';

export const Route = createFileRoute('/_app/dashboard')({
  component: DashboardPage,
});
