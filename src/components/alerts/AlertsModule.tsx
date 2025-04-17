
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
  const lastRefreshTime = useRef<number>(0);
  const pendingRefreshTimeout = useRef<NodeJS.Timeout | null>(null);

  // Declare a function to create debouncedRefresh
  const createDebouncedRefresh = (generateAlertsFunc: ReturnType<typeof useAlertGenerator>['generateAlerts']) => 
    useCallback((force = false) => {
      if (pendingRefreshTimeout.current) {
        clearTimeout(pendingRefreshTimeout.current);
      }
      
      pendingRefreshTimeout.current = setTimeout(() => {
        const now = Date.now();
        if (!force && now - lastRefreshTime.current < 1000) {
          console.log('Skipping refresh - throttled');
          return;
        }
        
        lastRefreshTime.current = now;
        pendingRefreshTimeout.current = null;
        
        console.log('Loading subscription data for alerts (debounced)');
        const currentSubscriptions = getSubscriptions();
        updateSubscriptions(currentSubscriptions);
        
        const newAlerts = generateAlertsFunc(currentSubscriptions, force);
        
        if (newAlerts.length > 0) {
          console.log(`Generated ${newAlerts.length} new alerts`);
          updateAlerts(newAlerts);
          
          const alertToShow = newAlerts.find(alert => !shownToastIds.current.has(alert.id));
          if (alertToShow) {
            toast({
              title: alertToShow.title,
              description: alertToShow.message,
            });
            shownToastIds.current.add(alertToShow.id);
          }
        }
      }, 300);
    }, [updateAlerts, updateSubscriptions, toast]);

  // Use the alert generator hook
  const { generateAlerts } = useAlertGenerator(
    lastData,
    updateLastData,
    onEditSubscription,
    // Pass the creator function instead of the function itself
    (force) => debouncedRefresh(force)
  );

  // Create the debounced refresh function after generating alerts
  const debouncedRefresh = createDebouncedRefresh(generateAlerts);

  const loadData = useCallback(() => {
    debouncedRefresh(false);
  }, [debouncedRefresh]);

  const forceRefresh = useCallback(() => {
    console.log('Force refreshing alerts');
    if (Date.now() - lastData.lastEventTimestamp < 500) {
      console.log('Skipping refresh - too soon after last event');
      return;
    }
    
    debouncedRefresh(true);
  }, [debouncedRefresh, lastData.lastEventTimestamp]);

  const { updateDismissedAlert } = useAlertsEvents(
    loadData, 
    forceRefresh, 
    lastData, 
    updateLastData
  );

  useEffect(() => {
    shownToastIds.current.clear();
    setTimeout(loadData, 300);
    
    const unreadAlerts = alerts.filter(alert => !alert.read);
    if (unreadAlerts.length > 0) {
      toast({
        title: `${unreadAlerts.length} Unread Alert${unreadAlerts.length > 1 ? 's' : ''}`,
        description: "You have unread notifications in your alerts center"
      });
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
