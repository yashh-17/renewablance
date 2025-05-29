
import { Subscription } from '@/types/subscription';

export interface SubscriptionStorage {
  storageKey: string;
  subscriptions: Subscription[];
}

export interface BillingCalculationOptions {
  currentDate: Date;
  billingCycle: string;
  previousBillingDate?: Date;
}

export interface EventDispatchOptions {
  storageKey: string;
  isNew: boolean;
  subscription?: Subscription;
}
