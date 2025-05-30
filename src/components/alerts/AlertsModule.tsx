
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
  const loadTimeoutRef = useRef<NodeJS.Timeout>();

  const { generateAlerts } = useAlertGenerator(
    lastData,
    updateLastData,
    onEditSubscription
  );

  const loadData = useCallback(() => {
    try {
      console.log('Loading subscription data for alerts');
      const currentSubscriptions = getSubscriptions();
      updateSubscriptions(currentSubscriptions);
      
      const newAlerts = generateAlerts(currentSubscriptions, false);
      if (newAlerts.length > 0) {
        updateAlerts(newAlerts);
      }
    } catch (error) {
      console.error('Error loading alerts data:', error);
    }
  }, [generateAlerts, updateAlerts, updateSubscriptions]);

  const forceRefresh = useCallback(() => {
    try {
      console.log('Force refreshing alerts');
      const currentSubscriptions = getSubscriptions();
      updateSubscriptions(currentSubscriptions);
      
      const newAlerts = generateAlerts(currentSubscriptions, true);
      updateAlerts(newAlerts);
    } catch (error) {
      console.error('Error force refreshing alerts:', error);
    }
  }, [generateAlerts, updateAlerts, updateSubscriptions]);

  // Initial load with proper cleanup
  useEffect(() => {
    if (!isInitialized.current) {
      console.log('AlertsModule initializing');
      isInitialized.current = true;
      
      // Load data immediately
      loadData();
      
      // Debounced force refresh to prevent excessive calls
      loadTimeoutRef.current = setTimeout(() => {
        forceRefresh();
      }, 1000);
    }

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [loadData, forceRefresh]);

  // Event listeners with proper cleanup
  useEffect(() => {
    const handleSubscriptionEvent = () => {
      // Debounce the load data call
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      loadTimeoutRef.current = setTimeout(loadData, 500);
    };
    
    const events = ['subscription-updated', 'renewal-detected', 'new-subscription-added'];
    
    events.forEach(event => {
      window.addEventListener(event, handleSubscriptionEvent);
    });
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleSubscriptionEvent);
      });
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [loadData]);

  const markAsRead = useCallback((alertId: string) => {
    console.log('Dismissing alert:', alertId);
    setAlerts(prevAlerts => {
      const updatedAlerts = prevAlerts.filter(alert => alert.id !== alertId);
      
      // Dispatch updated count
      const unreadCount = updatedAlerts.filter(alert => !alert.read).length;
      window.dispatchEvent(new CustomEvent('alerts-count-updated', { 
        detail: { count: unreadCount } 
      }));
      
      return updatedAlerts;
    });
    
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
  }, [setAlerts, lastData.dismissedAlertIds, updateLastData, toast]);

  const handleAction = useCallback((alert: Alert) => {
    console.log('Handling alert action:', alert.id);
    if (alert.action) {
      try {
        alert.action();
      } catch (error) {
        console.error('Error executing alert action:', error);
      }
    }
    markAsRead(alert.id);
  }, [markAsRead]);

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
              You will see renewal alerts here when subscriptions are due within 7 days
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsModule;
