import { Subscription } from '@/types/subscription';
import { calculateDaysBetween } from './calculations';
import { getStorageKey } from './storage';

// Keep track of the last event time to prevent excessive updates
let lastEventTime = 0;

// Helper function to trigger all relevant events
export const triggerSubscriptionUpdatedEvents = (
  storageKey: string, 
  isNew: boolean = false, 
  subscription?: Subscription
): void => {
  const now = Date.now();
  if (now - lastEventTime < 300) {
    console.log('Skipping event dispatch - too soon after last event');
    setTimeout(() => {
      console.log('Dispatching delayed events due to throttling');
      triggerSubscriptionUpdatedEvents(storageKey, isNew, subscription);
    }, 500);
    return;
  }
  
  lastEventTime = now;
  
  window.dispatchEvent(new StorageEvent('storage', {
    key: storageKey,
  }));
  
  console.log('Dispatching subscription-updated event');
  
  window.dispatchEvent(new CustomEvent('subscription-updated'));
  
  if (subscription) {
    const nextBillingDate = new Date(subscription.nextBillingDate);
    const currentDate = new Date();
    const daysToRenewal = calculateDaysBetween(currentDate, nextBillingDate);
    
    if (daysToRenewal <= 7) {
      console.log('Dispatching renewal-detected event for subscription:', subscription.name, 'days:', daysToRenewal);
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('renewal-detected'));
      }, 200);
    }
  } else {
    setTimeout(() => {
      console.log('Dispatching renewal-detected event');
      window.dispatchEvent(new CustomEvent('renewal-detected'));
    }, 300);
  }
  
  if (isNew) {
    setTimeout(() => {
      console.log('Dispatching delayed renewal-detected event for new subscription');
      window.dispatchEvent(new CustomEvent('renewal-detected'));
      
      window.dispatchEvent(new CustomEvent('subscription-updated'));
    }, 1000);
    
    setTimeout(() => {
      console.log('Final event dispatch check');
      window.dispatchEvent(new CustomEvent('subscription-updated'));
      window.dispatchEvent(new CustomEvent('renewal-detected'));
    }, 2000);
  }
};

// Trigger events for subscription operations
export const triggerSubscriptionEvents = (
  isNew: boolean = false, 
  subscription?: Subscription
): void => {
  const storageKey = getStorageKey();
  triggerSubscriptionUpdatedEvents(storageKey, isNew, subscription);
};
