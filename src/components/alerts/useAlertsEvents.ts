
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
    
    // Define all event handlers
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
    
    const handleNewSubscription = (event: CustomEvent) => {
      console.log('New subscription event received in AlertsModule', event.detail);
      forceRefresh();
    };
    
    const handleSubscriptionDeleted = (event: CustomEvent) => {
      console.log('Subscription deleted event received in AlertsModule', event.detail);
      forceRefresh();
    };
    
    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('subscription-updated', handleCustomEvent);
    window.addEventListener('renewal-detected', handleRenewalDetected);
    window.addEventListener('new-subscription-added', handleNewSubscription as EventListener);
    window.addEventListener('subscription-deleted', handleSubscriptionDeleted as EventListener);
    
    // Periodic refresh interval
    const intervalId = setInterval(loadData, 30000);
    
    // Force immediate check after mount
    forceRefresh();
    
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
