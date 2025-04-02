
import { Subscription } from "@/types/subscription";

export interface AlertItem {
  id: string;
  type: 'info' | 'warning' | 'success' | 'renewal' | 'spending' | 'newSubscription' | 'missedPayment';
  title: string;
  message: string;
  date: Date;
  read: boolean;
  action?: () => void;
  actionLabel?: string;
}

export type Alert = AlertItem;

export interface AlertsState {
  totalSpend: number;
  count: number;
  subscriptionIds: string[];
  checkedRenewalsDates: Record<string, boolean>;
  processedAlertIds: Set<string>;
  lastEventTimestamp: number;
  dismissedAlertIds: Set<string>;
}

export interface AlertsModuleProps {
  onEditSubscription?: (subscription: Subscription) => void;
}
