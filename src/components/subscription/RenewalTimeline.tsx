
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Subscription } from '@/types/subscription';
import { Clock } from 'lucide-react';
import { useRenewalData } from './hooks/useRenewalData';
import RenewalSection from './RenewalSection';

interface RenewalTimelineProps {
  onEditSubscription?: (subscription: Subscription) => void;
}

const RenewalTimeline: React.FC<RenewalTimelineProps> = ({ onEditSubscription }) => {
  const { renewals, forceUpdate } = useRenewalData();

  const hasAnyRenewals = renewals.week.length > 0 || renewals.twoWeeks.length > 0 || renewals.month.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Clock className="h-5 w-5 mr-2 text-brand-500" />
          Upcoming Renewals
        </CardTitle>
        <CardDescription>
          Track your subscription renewals over the next 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!hasAnyRenewals ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No upcoming renewals in the next 30 days</p>
          </div>
        ) : (
          <>
            <RenewalSection
              title="Due in 7 days"
              subscriptions={renewals.week}
              urgencyLevel="high"
              forceUpdate={forceUpdate}
              onEditSubscription={onEditSubscription}
            />
            <RenewalSection
              title="Due in 14 days"
              subscriptions={renewals.twoWeeks}
              urgencyLevel="medium"
              forceUpdate={forceUpdate}
              onEditSubscription={onEditSubscription}
            />
            <RenewalSection
              title="Due in 30 days"
              subscriptions={renewals.month}
              urgencyLevel="low"
              forceUpdate={forceUpdate}
              onEditSubscription={onEditSubscription}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RenewalTimeline;
