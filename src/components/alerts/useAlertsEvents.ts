
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
    
    // Initial load with a small delay to ensure DOM is ready
    setTimeout(() => {
      loadData();
    }, 100);
    
    // Track the last time an event was processed to prevent duplicates
    let lastProcessedTime = Date.now();
    const THROTTLE_TIME = 1000; // 1 second throttle
    
    // Throttled event handler to prevent multiple rapid executions
    const throttledEventHandler = () => {
      const now = Date.now();
      if (now - lastProcessedTime > THROTTLE_TIME) {
        console.log('Processing subscription event at', new Date().toISOString());
        lastProcessedTime = now;
        forceRefresh();
      } else {
        console.log('Throttling event, last processed:', new Date(lastProcessedTime).toISOString());
      }
    };
    
    // Define all event handlers
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key.includes('subscriptions_')) {
        console.log('Storage change detected in AlertsModule');
        throttledEventHandler();
      }
    };
    
    const handleCustomEvent = () => {
      console.log('Subscription updated event received in AlertsModule');
      throttledEventHandler();
    };
    
    const handleRenewalDetected = () => {
      console.log('Renewal detected event received in AlertsModule');
      // We don't need to handle this separately as subscription-updated will be triggered
    };
    
    const handleNewSubscription = (event: CustomEvent) => {
      console.log('New subscription event received in AlertsModule', event.detail);
      throttledEventHandler();
    };
    
    const handleSubscriptionDeleted = (event: CustomEvent) => {
      console.log('Subscription deleted event received in AlertsModule', event.detail);
      throttledEventHandler();
    };
    
    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('subscription-updated', handleCustomEvent);
    window.addEventListener('renewal-detected', handleRenewalDetected);
    window.addEventListener('new-subscription-added', handleNewSubscription as EventListener);
    window.addEventListener('subscription-deleted', handleSubscriptionDeleted as EventListener);
    
    // Reduce the frequency of periodic refreshes
    const intervalId = setInterval(loadData, 60000); // Increase to 1 minute
    
    // Force immediate check after mount
    setTimeout(() => {
      forceRefresh();
    }, 500);
    
    // Cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('subscription-updated', handleCustomEvent);
      window.removeEventListener('renewal-detected', handleRenewalDetected);
      window.removeEventListener('new-subscription-added', handleNewSubscription as EventListener);
      window.removeEventListener('subscription-deleted', handleSubscriptionDeleted as EventListener);
      clearInterval(intervalId);
    };
  }, [loadData, forceRefresh, updateLastData]);

  const updateDismissedAlert = useCallback((alertId: string) => {
    updateLastData({
      dismissedAlertIds: new Set([...lastData.dismissedAlertIds, alertId])
    });
    
    saveDismissedAlertsToStorage(new Set([...lastData.dismissedAlertIds, alertId]));
  }, [updateLastData, lastData.dismissedAlertIds]);

  return { updateDismissedAlert };
};
