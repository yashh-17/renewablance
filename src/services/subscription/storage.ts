
import { Subscription } from '@/types/subscription';

const STORAGE_KEY = 'subscriptions';

// Sample data with known subscription services
const sampleSubscriptions: Subscription[] = [
  {
    id: '1',
    name: 'Netflix',
    category: 'Entertainment',
    price: 649,
    billingCycle: 'monthly',
    status: 'active',
    nextBillingDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
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
    nextBillingDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    startDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
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
    nextBillingDate: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(),
    startDate: new Date(Date.now() - 245 * 24 * 60 * 60 * 1000).toISOString(),
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
    nextBillingDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
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
    nextBillingDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    startDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
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
    nextBillingDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString(),
    startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    usageData: 78,
    iconBg: 'bg-gray-400',
    icon: 'i'
  }
];

// Get the storage key for the current user
export const getStorageKey = (): string => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  if (!currentUser.id) {
    throw new Error('User not authenticated');
  }
  return `${STORAGE_KEY}_${currentUser.id}`;
};

// Initialize localStorage with sample data if empty
export const initializeStorage = (): void => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  if (!currentUser.id) return;
  
  const storageKey = `${STORAGE_KEY}_${currentUser.id}`;
  if (!localStorage.getItem(storageKey)) {
    localStorage.setItem(storageKey, JSON.stringify(sampleSubscriptions));
  }
};

// Get all subscriptions for the current user
export const getSubscriptionsFromStorage = (): Subscription[] => {
  const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
  if (!currentUser.id) return [];
  
  initializeStorage();
  const storageKey = `${STORAGE_KEY}_${currentUser.id}`;
  return JSON.parse(localStorage.getItem(storageKey) || '[]');
};

// Save subscriptions to storage
export const saveSubscriptionsToStorage = (subscriptions: Subscription[]): void => {
  const storageKey = getStorageKey();
  localStorage.setItem(storageKey, JSON.stringify(subscriptions));
};
