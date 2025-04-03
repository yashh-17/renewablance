
import { useEffect, useCallback, useRef } from 'react';
import { getSubscriptions } from '@/services/subscriptionService';
import { saveDismissedAlertsToStorage } from './alertUtils';
import { AlertsState } from './types';

export const useAlertsEvents = (
  loadData: () => void,
  forceRefresh: () => void,
  lastData: AlertsState,
  updateLastData: (updates: Partial<AlertsState>) => void
) => {
  // Use refs to track event handling state
  const processingEvent = useRef(false);
  const lastProcessedTime = useRef(Date.now());
  const eventQueue = useRef<Array<() => void>>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Process events in queue with throttling
  const processEventQueue = useCallback(() => {
    if (processingEvent.current) return;
    
    if (eventQueue.current.length > 0) {
      processingEvent.current = true;
      const now = Date.now();
      
      // Only process if enough time has passed
      if (now - lastProcessedTime.current > 1000) {
        const nextEvent = eventQueue.current.shift();
        lastProcessedTime.current = now;
        
        if (nextEvent) {
          nextEvent();
        }
        
        // Allow next event after a delay
        setTimeout(() => {
          processingEvent.current = false;
          processEventQueue();
        }, 500);
      } else {
        // If called too soon, wait a bit longer
        processingEvent.current = false;
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(processEventQueue, 500);
      }
    }
  }, []);

  // Queue an event for processing
  const queueEvent = useCallback((eventFn: () => void) => {
    eventQueue.current.push(eventFn);
    processEventQueue();
  }, [processEventQueue]);

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

    // Initial load with a small delay to ensure DOM is ready
    setTimeout(() => {
      loadData();
    }, 200);
    
    // Define all event handlers with throttling
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key.includes('subscriptions_')) {
        console.log('Storage change detected in AlertsModule');
        queueEvent(() => loadData());
      }
    };
    
    const handleCustomEvent = () => {
      console.log('Subscription updated event received in AlertsModule');
      queueEvent(() => loadData());
    };
    
    const handleRenewalDetected = () => {
      console.log('Renewal detected event received in AlertsModule');
      // We prioritize loading data here as it's important
      queueEvent(() => loadData());
    };
    
    const handleNewSubscription = () => {
      console.log('New subscription event received in AlertsModule');
      queueEvent(() => forceRefresh());
    };
    
    const handleSubscriptionDeleted = () => {
      console.log('Subscription deleted event received in AlertsModule');
      queueEvent(() => loadData());
    };
    
    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('subscription-updated', handleCustomEvent);
    window.addEventListener('renewal-detected', handleRenewalDetected);
    window.addEventListener('new-subscription-added', handleNewSubscription as EventListener);
    window.addEventListener('subscription-deleted', handleSubscriptionDeleted as EventListener);
    
    // Reduce the frequency of periodic refreshes
    const intervalId = setInterval(() => queueEvent(loadData), 60000); // 1 minute refresh
    
    // Force immediate check after mount, with slight delay
    setTimeout(() => {
      queueEvent(loadData);
    }, 500);
    
    // Cleanup
    return () => {
      window.addEventListener('storage', handleStorageChange);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('subscription-updated', handleCustomEvent);
      window.removeEventListener('renewal-detected', handleRenewalDetected);
      window.removeEventListener('new-subscription-added', handleNewSubscription as EventListener);
      window.removeEventListener('subscription-deleted', handleSubscriptionDeleted as EventListener);
      clearInterval(intervalId);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [loadData, forceRefresh, updateLastData, queueEvent]);

  const updateDismissedAlert = useCallback((alertId: string) => {
    updateLastData({
      dismissedAlertIds: new Set([...lastData.dismissedAlertIds, alertId])
    });
    
    saveDismissedAlertsToStorage(new Set([...lastData.dismissedAlertIds, alertId]));
  }, [updateLastData, lastData.dismissedAlertIds]);

  return { updateDismissedAlert };
};
