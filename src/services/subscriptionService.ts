
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

// Calculate the next billing date based on the current date and billing cycle
export const calculateNextBillingDate = (
  currentDate: Date,
  billingCycle: string,
  previousBillingDate?: Date
): Date => {
  const result = new Date(currentDate);
  
  // Use the previous billing date's day if it exists and is valid
  if (previousBillingDate) {
    const previousDay = previousBillingDate.getDate();
    result.setDate(previousDay);
  }
  
  // Calculate the next billing date based on billing cycle
  if (billingCycle === 'weekly') {
    result.setDate(result.getDate() + 7);
  } else if (billingCycle === 'monthly') {
    result.setMonth(result.getMonth() + 1);
    
    // Handle month edge cases (e.g., Jan 31 -> Feb 28)
    const month = result.getMonth();
    result.setDate(1); // Temporarily set to 1st to avoid date overflow
    result.setMonth(month); // Set the correct month
    
    // If original date was 29-31 and new month doesn't have those days, set to last day
    if (previousBillingDate && previousBillingDate.getDate() > result.getDate()) {
      // We're already at the last day of the month (since date was capped)
      // No need to adjust further
    }
  } else if (billingCycle === 'yearly') {
    result.setFullYear(result.getFullYear() + 1);
    
    // Handle February 29 in leap years
    if (previousBillingDate && previousBillingDate.getMonth() === 1 && previousBillingDate.getDate() === 29) {
      const isLeapYear = (year: number) => {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
      };
      
      if (!isLeapYear(result.getFullYear())) {
        result.setDate(28); // Set to Feb 28 in non-leap years
      }
    }
  }
  
  return result;
};

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
  
  // For existing subscriptions, check if we need to recalculate the next billing date
  if (!isNew) {
    oldSubscription = { ...subscriptions[index] };
    const oldBillingCycle = oldSubscription.billingCycle;
    const newBillingCycle = subscription.billingCycle;
    
    // Recalculate next billing date if billing cycle changed or if status changed from inactive to active
    const needsRecalculation = 
      oldBillingCycle !== newBillingCycle || 
      (oldSubscription.status !== 'active' && oldSubscription.status !== 'trial' && 
       (subscription.status === 'active' || subscription.status === 'trial'));
    
    if (needsRecalculation) {
      const startDate = new Date(subscription.startDate || subscription.createdAt);
      const previousBillingDate = new Date(oldSubscription.nextBillingDate);
      
      // Calculate the new next billing date
      const nextBillingDate = calculateNextBillingDate(
        currentDate,
        subscription.billingCycle,
        previousBillingDate
      );
      
      subscription.nextBillingDate = nextBillingDate.toISOString();
    }
  } else {
    // For new subscriptions, calculate the initial next billing date
    const startDate = new Date(subscription.startDate || subscription.createdAt);
    
    // Calculate the next billing date based on start date and billing cycle
    const nextBillingDate = calculateNextBillingDate(
      startDate,
      subscription.billingCycle
    );
    
    subscription.nextBillingDate = nextBillingDate.toISOString();
    
    // Assign a new unique ID if one doesn't exist
    if (!subscription.id) {
      subscription.id = Date.now().toString();
    }
  }
  
  if (index !== -1) {
    // Update existing subscription
    subscriptions[index] = subscription;
    
    // Log the update with before/after data (sanitized by the logger)
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
    // Add new subscription
    subscriptions.push(subscription);
    
    // Log the new subscription
    secureLogger.logDataChange(
      'Subscription', 
      'created', 
      { id: subscription.id, name: subscription.name }
    );
  }
  
  localStorage.setItem(storageKey, JSON.stringify(subscriptions));
  
  console.log('Subscription saved, triggering events');
  
  // Dispatch events to notify components
  triggerSubscriptionUpdatedEvents(storageKey, isNew);
  
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
  
  // Log the deletion
  if (subscription) {
    secureLogger.logDataChange(
      'Subscription', 
      'deleted', 
      { id, name: subscription.name }
    );
  }
  
  // Dispatch events to notify components
  triggerSubscriptionUpdatedEvents(storageKey, false);
  
  return true;
};

// Helper function to trigger all relevant events
function triggerSubscriptionUpdatedEvents(storageKey: string, isNew: boolean = false) {
  // Dispatch a storage event to notify other components about the change
  window.dispatchEvent(new StorageEvent('storage', {
    key: storageKey,
  }));
  
  console.log('Dispatching subscription-updated event');
  
  // Dispatch a custom event for more immediate updates
  window.dispatchEvent(new CustomEvent('subscription-updated'));
  
  // Dispatch a renewal check event - with slight delay to ensure all components are updated
  setTimeout(() => {
    console.log('Dispatching renewal-detected event');
    window.dispatchEvent(new CustomEvent('renewal-detected'));
  }, 300);
  
  // For new subscriptions, dispatch another renewal event after a longer delay
  // to ensure any new component that may have loaded after the first event also gets notified
  if (isNew) {
    setTimeout(() => {
      console.log('Dispatching delayed renewal-detected event for new subscription');
      window.dispatchEvent(new CustomEvent('renewal-detected'));
      
      // Dispatch another subscription-updated event to ensure all components are updated
      window.dispatchEvent(new CustomEvent('subscription-updated'));
    }, 1000);
  }
}

// Add this function to get a subscription by ID
export const getSubscriptionById = (id: string): Subscription | null => {
  const subscriptions = getSubscriptions();
  return subscriptions.find(sub => sub.id === id) || null;
};

// Add a new function to get subscriptions due for renewal within a specific timeframe
export const getSubscriptionsDueForRenewal = (days: number): Subscription[] => {
  const subscriptions = getSubscriptions();
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + days);
  
  return subscriptions.filter(sub => {
    if (sub.status !== 'active' && sub.status !== 'trial') return false;
    
    const nextBillingDate = new Date(sub.nextBillingDate);
    return nextBillingDate >= now && nextBillingDate <= futureDate;
  }).sort((a, b) => new Date(a.nextBillingDate).getTime() - new Date(b.nextBillingDate).getTime());
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
