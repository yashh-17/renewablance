import { Subscription } from '@/types/subscription';
import secureLogger, { LogEventType } from './loggingService';

// Sample data with known subscription services
const sampleSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    category: 'Entertainment',
    price: 649,
    billingCycle: 'monthly',
    status: 'active',
    nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    createdAt: new Date().toISOString(),
    usageData: 85,
    iconBg: 'bg-red-600',
    icon: 'N'
  },
  {
    id: '2',
    name: 'Spotify',
    category: 'Music',
    price: 119,
    billingCycle: 'monthly',
    status: 'active',
    nextBillingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
    createdAt: new Date().toISOString(),
    usageData: 92,
    iconBg: 'bg-green-600',
    icon: 'S'
  },
  {
    id: '3',
    name: 'Amazon Prime',
    category: 'Entertainment',
    price: 1499,
    billingCycle: 'yearly',
    status: 'active',
    nextBillingDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days from now
    startDate: new Date(Date.now() - 245 * 24 * 60 * 60 * 1000).toISOString(), // 245 days ago
    createdAt: new Date().toISOString(),
    usageData: 45,
    iconBg: 'bg-blue-700',
    icon: 'A'
  },
  {
    id: '4',
    name: 'Adobe Creative Cloud',
    category: 'Productivity',
    price: 4899,
    billingCycle: 'monthly',
    status: 'inactive',
    nextBillingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(), // 180 days ago
    createdAt: new Date().toISOString(),
    usageData: 10,
    iconBg: 'bg-red-800',
    icon: 'A'
  },
  {
    id: '5',
    name: 'Disney+',
    category: 'Entertainment',
    price: 299,
    billingCycle: 'monthly',
    status: 'trial',
    nextBillingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    startDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
    createdAt: new Date().toISOString(),
    usageData: 30,
    iconBg: 'bg-blue-600',
    icon: 'D'
  },
  {
    id: '6',
    name: 'iCloud',
    category: 'Cloud Storage',
    price: 75,
    billingCycle: 'monthly',
    status: 'active',
    nextBillingDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(), // 22 days from now
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    createdAt: new Date().toISOString(),
    usageData: 78,
    iconBg: 'bg-gray-400',
    icon: 'i'
  }
];

const STORAGE_KEY = 'subscriptions';

// Initialize localStorage with sample data if empty
const initializeStorage = () => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  if (!currentUser.id) return;
  
  const storageKey = `${STORAGE_KEY}_${currentUser.id}`;
  if (!localStorage.getItem(storageKey)) {
    localStorage.setItem(storageKey, JSON.stringify(sampleSubscriptions));
  }
};

// Get all subscriptions for the current user
export const getSubscriptions = (): Subscription[] => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  if (!currentUser.id) return [];
  
  initializeStorage();
  const storageKey = `${STORAGE_KEY}_${currentUser.id}`;
  return JSON.parse(localStorage.getItem(storageKey) || '[]');
};

// Helper function to calculate exact days between two dates
const calculateDaysBetween = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// Calculate the next billing date based on the current date and billing cycle
export const calculateNextBillingDate = (
  currentDate: Date,
  billingCycle: string,
  previousBillingDate?: Date
): Date => {
  const result = new Date(currentDate);
  
  if (previousBillingDate) {
    const targetMonth = result.getMonth();
    const targetYear = result.getFullYear();
    
    const previousDay = previousBillingDate.getDate();
    result.setDate(previousDay);
    
    result.setMonth(targetMonth);
    result.setFullYear(targetYear);
  }
  
  if (billingCycle === 'weekly') {
    result.setDate(result.getDate() + 7);
  } else if (billingCycle === 'monthly') {
    const currentDay = result.getDate();
    
    result.setMonth(result.getMonth() + 1);
    
    const newMonth = result.getMonth();
    const expectedMonth = (currentDate.getMonth() + 1) % 12;
    
    if (newMonth !== expectedMonth) {
      result.setDate(0);
    }
  } else if (billingCycle === 'yearly') {
    result.setFullYear(result.getFullYear() + 1);
    
    if (result.getMonth() === 1 && result.getDate() === 29) {
      const isLeapYear = (year: number) => {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
      };
      
      if (!isLeapYear(result.getFullYear())) {
        result.setDate(28);
      }
    }
  }
  
  return result;
};

// Keep track of the last event time to prevent excessive updates
let lastEventTime = 0;

// Save a subscription (create or update)
export const saveSubscription = (subscription: Subscription): Subscription => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  if (!currentUser.id) throw new Error('User not authenticated');
  
  const storageKey = `${STORAGE_KEY}_${currentUser.id}`;
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
  
  localStorage.setItem(storageKey, JSON.stringify(subscriptions));
  
  console.log('Subscription saved, triggering events:', subscription.name);
  
  triggerSubscriptionUpdatedEvents(storageKey, isNew, subscription);
  
  return subscription;
};

// Delete a subscription
export const deleteSubscription = (id: string): boolean => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  if (!currentUser.id) throw new Error('User not authenticated');
  
  const storageKey = `${STORAGE_KEY}_${currentUser.id}`;
  const subscriptions = getSubscriptions();
  
  const subscription = subscriptions.find(s => s.id === id);
  const filteredSubscriptions = subscriptions.filter((s) => s.id !== id);
  
  localStorage.setItem(storageKey, JSON.stringify(filteredSubscriptions));
  
  if (subscription) {
    secureLogger.logDataChange(
      'Subscription', 
      'deleted', 
      { id, name: subscription.name }
    );
  }
  
  triggerSubscriptionUpdatedEvents(storageKey, false);
  
  return true;
};

// Helper function to trigger all relevant events
function triggerSubscriptionUpdatedEvents(storageKey: string, isNew: boolean = false, subscription?: Subscription) {
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
}

// Add this function to get a subscription by ID
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
