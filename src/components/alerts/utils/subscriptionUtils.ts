
import { Subscription } from "@/types/subscription";

export const getNewSubscriptions = (
  currentSubscriptions: Subscription[],
  lastSubscriptionIds: string[]
): Subscription[] => {
  const currentIds = currentSubscriptions.map(sub => sub.id);
  const newSubIds = currentIds.filter(id => !lastSubscriptionIds.includes(id));
  return currentSubscriptions.filter(sub => newSubIds.includes(sub.id));
};

export const getExpensiveNewSubscription = (
  currentSubscriptions: Subscription[],
  lastSubscriptionIds: string[]
): Subscription | undefined => {
  return currentSubscriptions
    .filter(sub => !lastSubscriptionIds.includes(sub.id))
    .sort((a, b) => b.price - a.price)[0];
};

export const identifyPotentialMissedPayments = (
  subscriptions: Subscription[],
  now: Date,
  daysThreshold: number = 7
): Subscription[] => {
  return subscriptions.filter(sub => {
    if (sub.status !== 'active') return false;
    
    const nextBillingDate = new Date(sub.nextBillingDate);
    const msInDay = 24 * 60 * 60 * 1000;
    return nextBillingDate < now && (now.getTime() - nextBillingDate.getTime()) < (daysThreshold * msInDay);
  });
};
