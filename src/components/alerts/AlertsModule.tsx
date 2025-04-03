import { useCallback, useEffect, useRef } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
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
import { useAlertsEvents } from './useAlertsEvents';

const AlertsModule: React.FC<AlertsModuleProps> = ({ onEditSubscription }) => {
  const { toast } = useToast();
  const { 
    alerts, 
    subscriptions, 
    lastData, 
    updateLastData, 
    updateAlerts, 
    updateSubscriptions,
    setAlerts 
  } = useAlertsState();
  
  const shownToastIds = useRef(new Set<string>());

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
      console.log(`Generated ${newAlerts.length} new alerts`);
      updateAlerts(newAlerts);
      
      if (newAlerts.length > 0 && 
          newAlerts[0].date.getTime() > Date.now() - 5000 &&
          !shownToastIds.current.has(newAlerts[0].id)) {
        toast({
          title: newAlerts[0].title,
          description: newAlerts[0].message,
        });
        shownToastIds.current.add(newAlerts[0].id);
      }
    }
  }, [generateAlerts, updateAlerts, updateSubscriptions, toast]);

  const forceRefresh = useCallback(() => {
    console.log('Force refreshing alerts');
    if (Date.now() - lastData.lastEventTimestamp < 500) {
      console.log('Skipping refresh - too soon after last event');
      return;
    }
    
    const currentSubscriptions = getSubscriptions();
    updateSubscriptions(currentSubscriptions);
    
    const newAlerts = generateAlerts(currentSubscriptions, true);
    console.log(`Force refreshed and generated ${newAlerts.length} alerts`);
    
    updateAlerts(newAlerts);
    
    if (newAlerts.length > 0 && !shownToastIds.current.has(newAlerts[0].id)) {
      const mostRecent = newAlerts[0];
      toast({
        title: mostRecent.title,
        description: mostRecent.message,
      });
      shownToastIds.current.add(mostRecent.id);
    }
  }, [generateAlerts, lastData.lastEventTimestamp, updateAlerts, updateSubscriptions, toast]);

  const { updateDismissedAlert } = useAlertsEvents(
    loadData, 
    forceRefresh, 
    lastData, 
    updateLastData
  );

  useEffect(() => {
    shownToastIds.current.clear();
    
    if (alerts.length > 0) {
      const unreadAlerts = alerts.filter(alert => !alert.read);
      if (unreadAlerts.length > 0) {
        toast({
          title: `${unreadAlerts.length} Unread Alert${unreadAlerts.length > 1 ? 's' : ''}`,
          description: "You have unread notifications in your alerts center"
        });
      }
    }
  }, []);

  const markAsRead = (alertId: string) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
    updateDismissedAlert(alertId);
    toast({
      title: "Alert Dismissed",
      description: "Notification has been marked as read"
    });
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
