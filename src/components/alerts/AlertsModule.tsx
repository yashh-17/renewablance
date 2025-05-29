
import { useCallback, useEffect, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Bell } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getSubscriptions } from '@/services/subscriptionService';
import { Alert, AlertsModuleProps } from './types';
import AlertsList from './AlertsList';
import { useAlertsState } from './useAlertsState';
import { useAlertGenerator } from './useAlertGenerator';
import { saveDismissedAlertsToStorage } from './alertUtils';

const AlertsModule: React.FC<AlertsModuleProps> = ({ onEditSubscription }) => {
  const { toast } = useToast();
  const { 
    alerts, 
    lastData, 
    updateLastData, 
    updateAlerts, 
    updateSubscriptions,
    setAlerts 
  } = useAlertsState();
  
  const isInitialized = useRef(false);

  const { generateAlerts } = useAlertGenerator(
    lastData,
    updateLastData,
    onEditSubscription
  );

  const loadData = useCallback(() => {
    console.log('Loading subscription data for alerts');
    const currentSubscriptions = getSubscriptions();
    updateSubscriptions(currentSubscriptions);
    
    const newAlerts = generateAlerts(currentSubscriptions, false);
    if (newAlerts.length > 0) {
      updateAlerts(newAlerts);
    }
  }, [generateAlerts, updateAlerts, updateSubscriptions]);

  const forceRefresh = useCallback(() => {
    console.log('Force refreshing alerts');
    const currentSubscriptions = getSubscriptions();
    updateSubscriptions(currentSubscriptions);
    
    const newAlerts = generateAlerts(currentSubscriptions, true);
    updateAlerts(newAlerts);
  }, [generateAlerts, updateAlerts, updateSubscriptions]);

  // Initial load
  useEffect(() => {
    if (!isInitialized.current) {
      console.log('AlertsModule initializing');
      isInitialized.current = true;
      
      // Load data immediately
      loadData();
      
      // Force refresh after a short delay to ensure we have alerts
      setTimeout(() => {
        forceRefresh();
      }, 1000);
    }
  }, [loadData, forceRefresh]);

  // Event listeners
  useEffect(() => {
    const handleSubscriptionEvent = () => {
      setTimeout(loadData, 500);
    };
    
    window.addEventListener('subscription-updated', handleSubscriptionEvent);
    window.addEventListener('renewal-detected', handleSubscriptionEvent);
    window.addEventListener('new-subscription-added', handleSubscriptionEvent);
    
    return () => {
      window.removeEventListener('subscription-updated', handleSubscriptionEvent);
      window.removeEventListener('renewal-detected', handleSubscriptionEvent);
      window.removeEventListener('new-subscription-added', handleSubscriptionEvent);
    };
  }, [loadData]);

  const markAsRead = (alertId: string) => {
    console.log('Dismissing alert:', alertId);
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
    
    // Update dismissed alerts
    const newDismissedAlerts = new Set([...lastData.dismissedAlertIds, alertId]);
    updateLastData({
      dismissedAlertIds: newDismissedAlerts
    });
    saveDismissedAlertsToStorage(newDismissedAlerts);
    
    toast({
      title: "Alert Dismissed",
      description: "Notification has been marked as read"
    });
  };

  const handleAction = (alert: Alert) => {
    console.log('Handling alert action:', alert.id);
    if (alert.action) {
      alert.action();
    }
    markAsRead(alert.id);
  };

  const unreadAlertsCount = alerts.filter(alert => !alert.read).length;

  return (
    <Card className="border-0 shadow-none bg-transparent">
      <CardHeader className="pb-2 pt-3 px-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Bell className="h-5 w-5 mr-2 text-brand-500" />
            Notifications
          </CardTitle>
          {unreadAlertsCount > 0 && (
            <span className="px-2 py-1 text-xs bg-brand-500 text-white rounded-full">
              {unreadAlertsCount} new
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto p-3">
        {alerts.length > 0 ? (
          <AlertsList 
            alerts={alerts} 
            onDismiss={markAsRead} 
            onAction={handleAction} 
          />
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No notifications at this time</p>
            <p className="text-xs text-muted-foreground mt-2">
              Add subscriptions with renewal dates within 7 days to see alerts
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsModule;
