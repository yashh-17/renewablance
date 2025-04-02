
import { useEffect, useCallback } from 'react';
import { getSubscriptions } from '@/services/subscriptionService';
import { saveDismissedAlertsToStorage } from './alertUtils';
import { AlertsState } from './types';

export const useAlertsEvents = (
  loadData: () => void,
  forceRefresh: () => void,
  lastData: AlertsState,
  updateLastData: (updates: Partial<AlertsState>) => void
) => {
  // Effect for initial load and event listeners
  useEffect(() => {
    const savedDismissedAlerts = localStorage.getItem('dismissedAlertIds');
    if (savedDismissedAlerts) {
      try {
        const dismissedIds = JSON.parse(savedDismissedAlerts);
        updateLastData({
          dismissedAlertIds: new Set(dismissedIds)
        });
      } catch (e) {
        console.error('Error parsing dismissed alerts', e);
      }
    }

    const currentSubscriptions = getSubscriptions();
    
    setTimeout(() => {
      loadData();
    }, 100);
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key.includes('subscriptions_')) {
        console.log('Storage change detected in AlertsModule');
        forceRefresh();
      }
    };
    
    const handleCustomEvent = () => {
      console.log('Subscription updated event received in AlertsModule');
      forceRefresh();
    };
    
    const handleRenewalDetected = () => {
      console.log('Renewal detected event received in AlertsModule');
      forceRefresh();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('subscription-updated', handleCustomEvent);
    window.addEventListener('renewal-detected', handleRenewalDetected);
    
    const intervalId = setInterval(loadData, 30000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('subscription-updated', handleCustomEvent);
      window.removeEventListener('renewal-detected', handleRenewalDetected);
      clearInterval(intervalId);
    };
  }, [loadData, forceRefresh, updateLastData]);

  const updateDismissedAlert = useCallback((alertId: string) => {
    updateLastData(prev => {
      const updatedDismissedIds = new Set(prev.dismissedAlertIds);
      updatedDismissedIds.add(alertId);
      
      saveDismissedAlertsToStorage(updatedDismissedIds);
      
      return {
        dismissedAlertIds: updatedDismissedIds
      };
    });
  }, [updateLastData]);

  return { updateDismissedAlert };
};
