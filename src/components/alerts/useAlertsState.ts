
import { useState, useCallback, useEffect } from 'react';
import { Subscription } from '@/types/subscription';
import { Alert, AlertsState } from './types';
import { loadDismissedAlertsFromStorage } from './alertUtils';

export const useAlertsState = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [lastData, setLastData] = useState<AlertsState>({ 
    totalSpend: 0, 
    count: 0, 
    subscriptionIds: [],
    checkedRenewalsDates: {},
    processedAlertIds: new Set(),
    lastEventTimestamp: 0,
    dismissedAlertIds: loadDismissedAlertsFromStorage()
  });

  const updateLastData = useCallback((updates: Partial<AlertsState>) => {
    setLastData(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  const updateAlerts = useCallback((newAlerts: Alert[]) => {
    setAlerts(prevAlerts => {
      const filteredPrevAlerts = prevAlerts.filter(alert => 
        !alert.read && 
        !lastData.dismissedAlertIds.has(alert.id)
      );
      
      // Create a Set of existing alert IDs for deduplication
      const existingAlertIds = new Set(filteredPrevAlerts.map(alert => alert.id));
      
      // Filter out any new alerts that already exist
      const uniqueNewAlerts = newAlerts.filter(alert => 
        !lastData.dismissedAlertIds.has(alert.id) && 
        !existingAlertIds.has(alert.id)
      );
      
      return [...uniqueNewAlerts, ...filteredPrevAlerts].sort((a, b) => 
        b.date.getTime() - a.date.getTime()
      );
    });
  }, [lastData.dismissedAlertIds]);

  const updateSubscriptions = useCallback((newSubscriptions: Subscription[]) => {
    setSubscriptions(newSubscriptions);
  }, []);

  return {
    alerts,
    subscriptions,
    lastData,
    updateLastData,
    updateAlerts,
    updateSubscriptions,
    setAlerts
  };
};
