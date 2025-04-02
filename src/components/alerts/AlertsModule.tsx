
import { useCallback } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import { getSubscriptions } from '@/services/subscriptionService';
import { Alert, AlertsModuleProps } from './types';
import AlertsList from './AlertsList';
import { useAlertsState } from './useAlertsState';
import { useAlertGenerator } from './useAlertGenerator';
import { useAlertsEvents } from './useAlertsEvents';

const AlertsModule: React.FC<AlertsModuleProps> = ({ onEditSubscription }) => {
  const { 
    alerts, 
    subscriptions, 
    lastData, 
    updateLastData, 
    updateAlerts, 
    updateSubscriptions,
    setAlerts 
  } = useAlertsState();

  const { generateAlerts } = useAlertGenerator(
    onEditSubscription, 
    lastData, 
    updateLastData
  );

  const loadData = useCallback(() => {
    console.log('Loading subscription data for alerts');
    const currentSubscriptions = getSubscriptions();
    updateSubscriptions(currentSubscriptions);
    
    const newAlerts = generateAlerts(currentSubscriptions, false);
    updateAlerts(newAlerts);
  }, [generateAlerts, updateAlerts, updateSubscriptions]);

  const forceRefresh = useCallback(() => {
    console.log('Force refreshing alerts');
    if (Date.now() - lastData.lastEventTimestamp < 300) {
      console.log('Skipping refresh - too soon after last event');
      return;
    }
    
    const currentSubscriptions = getSubscriptions();
    updateSubscriptions(currentSubscriptions);
    
    const newAlerts = generateAlerts(currentSubscriptions, true);
    updateAlerts(newAlerts);
  }, [generateAlerts, lastData.lastEventTimestamp, updateAlerts, updateSubscriptions]);

  const { updateDismissedAlert } = useAlertsEvents(
    loadData, 
    forceRefresh, 
    lastData, 
    updateLastData
  );

  const markAsRead = (alertId: string) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
    updateDismissedAlert(alertId);
    toast.success("Notification dismissed");
  };

  const handleAction = (alert: Alert) => {
    if (alert.action) {
      alert.action();
    }
    markAsRead(alert.id);
  };

  const unreadAlertsCount = alerts.filter(alert => !alert.read).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Bell className="h-5 w-5 mr-2 text-brand-500" />
            Alerts & Notifications Center
          </CardTitle>
          {unreadAlertsCount > 0 && (
            <span className="px-2 py-1 text-xs bg-brand-500 text-white rounded-full">
              {unreadAlertsCount} new
            </span>
          )}
        </div>
        <CardDescription>
          Stay informed about your subscription activity
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-[400px] overflow-y-auto">
        <AlertsList 
          alerts={alerts} 
          onDismiss={markAsRead} 
          onAction={handleAction} 
        />
      </CardContent>
    </Card>
  );
};

export default AlertsModule;
