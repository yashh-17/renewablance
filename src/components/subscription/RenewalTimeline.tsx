
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getSubscriptionsDueForRenewal } from '@/services/subscriptionService';
import { Subscription } from '@/types/subscription';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface RenewalTimelineProps {
  onEditSubscription?: (subscription: Subscription) => void;
}

const RenewalTimeline: React.FC<RenewalTimelineProps> = ({ onEditSubscription }) => {
  const [renewals, setRenewals] = useState<{
    week: Subscription[];
    twoWeeks: Subscription[];
    month: Subscription[];
  }>({
    week: [],
    twoWeeks: [],
    month: []
  });

  const loadRenewals = () => {
    const weekRenewals = getSubscriptionsDueForRenewal(7);
    const twoWeeksRenewals = getSubscriptionsDueForRenewal(14).filter(
      sub => !weekRenewals.some(weekSub => weekSub.id === sub.id)
    );
    const monthRenewals = getSubscriptionsDueForRenewal(30).filter(
      sub => !weekRenewals.some(weekSub => weekSub.id === sub.id) && 
             !twoWeeksRenewals.some(twoWeekSub => twoWeekSub.id === sub.id)
    );

    setRenewals({
      week: weekRenewals,
      twoWeeks: twoWeeksRenewals,
      month: monthRenewals
    });
  };

  useEffect(() => {
    // Initial load
    loadRenewals();
    
    // Listen for subscription updates
    const handleStorageChange = (event: StorageEvent) => {
      // Check if the change is related to subscriptions
      if (event.key && event.key.includes('subscriptions_')) {
        loadRenewals();
      }
    };
    
    // Custom event for more immediate updates
    const handleCustomEvent = () => {
      loadRenewals();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('subscription-updated', handleCustomEvent);
    
    // Set up polling to regularly check for renewals (every 30 seconds)
    const intervalId = setInterval(loadRenewals, 30000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('subscription-updated', handleCustomEvent);
      clearInterval(intervalId);
    };
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatPrice = (price: number, billingCycle: string) => {
    return `₹${price.toFixed(2)}/${billingCycle.charAt(0)}`;
  };

  const getRenewalUrgencyColor = (days: number) => {
    if (days <= 7) return "bg-destructive text-destructive-foreground";
    if (days <= 14) return "bg-warning-500 text-black";
    return "bg-muted text-muted-foreground";
  };

  const renderRenewalSection = (title: string, subscriptions: Subscription[], urgencyLevel: 'high' | 'medium' | 'low') => {
    if (subscriptions.length === 0) return null;
    
    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-2">
          {urgencyLevel === 'high' && <AlertCircle className="h-4 w-4 mr-1 text-destructive" />}
          {urgencyLevel === 'medium' && <Clock className="h-4 w-4 mr-1 text-warning-500" />}
          {urgencyLevel === 'low' && <CheckCircle className="h-4 w-4 mr-1 text-muted-foreground" />}
          {title}
        </h3>
        <div className="space-y-2">
          {subscriptions.map(sub => (
            <div key={sub.id} className="flex items-center justify-between p-2 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors">
              <div className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${sub.iconBg || 'bg-brand-600'} mr-3`}>
                  {sub.icon || sub.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-sm">{sub.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(sub.nextBillingDate)} • {formatPrice(sub.price, sub.billingCycle)}
                  </p>
                </div>
              </div>
              
              {onEditSubscription && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => onEditSubscription(sub)}
                  className="text-xs px-2"
                >
                  Edit
                </Button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

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
            {renderRenewalSection('Due in 7 days', renewals.week, 'high')}
            {renderRenewalSection('Due in 14 days', renewals.twoWeeks, 'medium')}
            {renderRenewalSection('Due in 30 days', renewals.month, 'low')}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RenewalTimeline;
