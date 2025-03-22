import { Subscription } from '@/types/subscription';

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

// Save a subscription (create or update)
export const saveSubscription = (subscription: Subscription): Subscription => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  if (!currentUser.id) throw new Error('User not authenticated');
  
  const storageKey = `${STORAGE_KEY}_${currentUser.id}`;
  const subscriptions = getSubscriptions();
  
  const index = subscriptions.findIndex((s) => s.id === subscription.id);
  if (index !== -1) {
    // Update existing subscription
    subscriptions[index] = subscription;
  } else {
    // Add new subscription
    subscriptions.push(subscription);
  }
  
  localStorage.setItem(storageKey, JSON.stringify(subscriptions));
  return subscription;
};

// Delete a subscription
export const deleteSubscription = (id: string): boolean => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  if (!currentUser.id) throw new Error('User not authenticated');
  
  const storageKey = `${STORAGE_KEY}_${currentUser.id}`;
  const subscriptions = getSubscriptions();
  
  const filteredSubscriptions = subscriptions.filter((s) => s.id !== id);
  localStorage.setItem(storageKey, JSON.stringify(filteredSubscriptions));
  return true;
};

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
  });
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
