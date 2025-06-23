import DashboardContent from './DashboardContent';

// Force dynamic rendering to prevent build-time data fetching issues
export const dynamic = 'force-dynamic'

export default function HomePage() {
  return <DashboardContent />;
} 