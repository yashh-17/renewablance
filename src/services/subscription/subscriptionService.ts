import { Subscription } from '@/types/subscription';
import secureLogger from '../loggingService';
import { 
  getSubscriptionsFromStorage, 
  saveSubscriptionsToStorage,
  getStorageKey 
} from './storage';
import { 
  calculateDaysBetween, 
  calculateNextBillingDate 
} from './calculations';
import { triggerSubscriptionEvents } from './events';

// Re-export the calculateNextBillingDate function so it can be used from the index
export { calculateNextBillingDate } from './calculations';

// Get all subscriptions for the current user
export const getSubscriptions = (): Subscription[] => {
  return getSubscriptionsFromStorage();
};

// Save a subscription (create or update)
export const saveSubscription = (subscription: Subscription): Subscription => {
  const subscriptions = getSubscriptions();
  
  const index = subscriptions.findIndex((s) => s.id === subscription.id);
  const isNew = index === -1;
  const currentDate = new Date();
  let oldSubscription: Subscription | null = null;
  
  if (!isNew) {
    oldSubscription = { ...subscriptions[index] };
    const oldBillingCycle = oldSubscription.billingCycle;
    const newBillingCycle = subscription.billingCycle;
    
    const needsRecalculation = 
      oldBillingCycle !== newBillingCycle || 
      (oldSubscription.status !== 'active' && oldSubscription.status !== 'trial' && 
       (subscription.status === 'active' || subscription.status === 'trial'));
    
    if (needsRecalculation) {
      const startDate = new Date(subscription.startDate || subscription.createdAt);
      const previousBillingDate = new Date(oldSubscription.nextBillingDate);
      
      const nextBillingDate = calculateNextBillingDate(
        currentDate,
        subscription.billingCycle,
        previousBillingDate
      );
      
      subscription.nextBillingDate = nextBillingDate.toISOString();
    }
  } else {
    const startDate = new Date(subscription.startDate || subscription.createdAt);
    
    console.log('New subscription created:', subscription.name, 'Start date:', startDate.toISOString());
    
    const nextBillingDate = calculateNextBillingDate(
      startDate,
      subscription.billingCycle
    );
    
    console.log('Next billing date calculated:', nextBillingDate.toISOString());
    
    subscription.nextBillingDate = nextBillingDate.toISOString();
    
    if (!subscription.id) {
      subscription.id = Date.now().toString();
    }
  }
  
  if (index !== -1) {
    subscriptions[index] = subscription;
    
    secureLogger.logDataChange(
      'Subscription', 
      'updated', 
      { 
        id: subscription.id,
        name: subscription.name,
        before: oldSubscription,
        after: subscription
      }
    );
  } else {
    subscriptions.push(subscription);
    
    secureLogger.logDataChange(
      'Subscription', 
      'created', 
      { id: subscription.id, name: subscription.name }
    );
  }
  
  saveSubscriptionsToStorage(subscriptions);
  
  console.log('Subscription saved, triggering events:', subscription.name);
  
  triggerSubscriptionEvents(isNew, subscription);
  
  return subscription;
};

// Delete a subscription
export const deleteSubscription = (id: string): boolean => {
  const subscriptions = getSubscriptions();
  
  const subscription = subscriptions.find(s => s.id === id);
  const filteredSubscriptions = subscriptions.filter((s) => s.id !== id);
  
  saveSubscriptionsToStorage(filteredSubscriptions);
  
  if (subscription) {
    secureLogger.logDataChange(
      'Subscription', 
      'deleted', 
      { id, name: subscription.name }
    );
  }
  
  triggerSubscriptionEvents(false);
  
  return true;
};

// Get a subscription by ID
export const getSubscriptionById = (id: string): Subscription | null => {
  const subscriptions = getSubscriptions();
  return subscriptions.find(sub => sub.id === id) || null;
};

// Get subscriptions due for renewal within a specific timeframe
export const getSubscriptionsDueForRenewal = (days: number): Subscription[] => {
  const subscriptions = getSubscriptions();
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + days);
  
  const result = subscriptions.filter(sub => {
    if (sub.status !== 'active' && sub.status !== 'trial') return false;
    
    const nextBillingDate = new Date(sub.nextBillingDate);
    nextBillingDate.setHours(0, 0, 0, 0);
    
    if (nextBillingDate <= now) {
      const daysSinceRenewal = calculateDaysBetween(nextBillingDate, now);
      return daysSinceRenewal <= 7;
    }
    
    return nextBillingDate > now && nextBillingDate <= futureDate;
  }).sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());
  
  return result;
};

// Get subscriptions by status
export const getSubscriptionsByStatus = (): Record<string, Subscription[]> => {
  const subscriptions = getSubscriptions();
  
  return subscriptions.reduce((acc, subscription) => {
    const { status } = subscription;
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(subscription);
    return acc;
  }, {} as Record<string, Subscription[]>);
};
