import { useState, useCallback, useEffect, useRef } from 'react';
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
  const processedAlertIdsRef = useRef(new Set<string>());

  useEffect(() => {
    processedAlertIdsRef.current = new Set([...lastData.processedAlertIds]);
  }, []);

  const updateLastData = useCallback((updates: Partial<AlertsState>) => {
    setLastData(prev => {
      const updatedData = {
        ...prev,
        ...updates
      };
      
      if (updates.processedAlertIds) {
        processedAlertIdsRef.current = new Set([...updates.processedAlertIds]);
      }
      
      return updatedData;
    });
  }, []);

  const updateAlerts = useCallback((newAlerts: Alert[]) => {
    setAlerts(prevAlerts => {
      const filteredPrevAlerts = prevAlerts.filter(alert => 
        !alert.read && 
        !lastData.dismissedAlertIds.has(alert.id)
      );
      
      const existingAlertIds = new Set(filteredPrevAlerts.map(alert => alert.id));
      
      const uniqueNewAlerts = newAlerts.filter(alert => 
        !lastData.dismissedAlertIds.has(alert.id) && 
        !existingAlertIds.has(alert.id) &&
        !processedAlertIdsRef.current.has(alert.id)
      );
      
      uniqueNewAlerts.forEach(alert => {
        processedAlertIdsRef.current.add(alert.id);
      });
      
      if (uniqueNewAlerts.length > 0) {
        updateLastData({
          processedAlertIds: processedAlertIdsRef.current
        });
      }
      
      console.log(`Adding ${uniqueNewAlerts.length} unique new alerts out of ${newAlerts.length} received`);
      
      return [...uniqueNewAlerts, ...filteredPrevAlerts].sort((a, b) => 
        b.date.getTime() - a.date.getTime()
      );
    });
  }, [lastData.dismissedAlertIds, updateLastData]);

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
