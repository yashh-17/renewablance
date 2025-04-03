
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import { Subscription } from '@/types/subscription';

interface AnalyticsTabProps {
  subscriptions: Subscription[];
}

const AnalyticsTab = ({ subscriptions }: AnalyticsTabProps) => {
  return <AnalyticsDashboard subscriptions={subscriptions} />;
};

export default AnalyticsTab;
