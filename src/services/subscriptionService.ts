
import { Subscription } from '@/types/subscription';

// Sample data with known subscription services
const sampleSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    category: 'Entertainment',
    price: 15.99,
    billingCycle: 'monthly',
    status: 'active',
    nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days from now
    createdAt: new Date().toISOString(),
    usageData: 85,
    iconBg: 'bg-red-600',
    icon: 'N'
  },
  {
    id: '2',
    name: 'Spotify',
    category: 'Music',
    price: 9.99,
    billingCycle: 'monthly',
    status: 'active',
    nextBillingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    createdAt: new Date().toISOString(),
    usageData: 92,
    iconBg: 'bg-green-600',
    icon: 'S'
  },
  {
    id: '3',
    name: 'Amazon Prime',
    category: 'Entertainment',
    price: 139,
    billingCycle: 'yearly',
    status: 'active',
    nextBillingDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), // 120 days from now
    createdAt: new Date().toISOString(),
    usageData: 45,
    iconBg: 'bg-blue-700',
    icon: 'A'
  },
  {
    id: '4',
    name: 'Adobe Creative Cloud',
    category: 'Productivity',
    price: 52.99,
    billingCycle: 'monthly',
    status: 'inactive',
    nextBillingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    createdAt: new Date().toISOString(),
    usageData: 10,
    iconBg: 'bg-red-800',
    icon: 'A'
  },
  {
    id: '5',
    name: 'Disney+',
    category: 'Entertainment',
    price: 7.99,
    billingCycle: 'monthly',
    status: 'trial',
    nextBillingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    createdAt: new Date().toISOString(),
    usageData: 30,
    iconBg: 'bg-blue-600',
    icon: 'D'
  },
  {
    id: '6',
    name: 'iCloud',
    category: 'Cloud Storage',
    price: 2.99,
    billingCycle: 'monthly',
    status: 'active',
    nextBillingDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(), // 22 days from now
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
