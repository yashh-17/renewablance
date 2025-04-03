
import { Alert } from "./types";

export const calculateDaysBetween = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

export const getAlertIcon = (type: string) => {
  switch (type) {
    case 'warning':
      return 'AlertTriangle';
    case 'success':
      return 'CheckCircle';
    case 'renewal':
      return 'Calendar';
    case 'spending':
      return 'DollarSign';
    case 'newSubscription':
      return 'PlusCircle';
    case 'missedPayment':
      return 'XCircle';
    case 'info':
    default:
      return 'Info';
  }
};

export const getAlertBackground = (type: string) => {
  switch (type) {
    case 'warning':
      return 'bg-warning-50 border-l-2 border-l-warning-500';
    case 'success':
      return 'bg-success-50 border-l-2 border-l-success-500';
    case 'renewal':
      return 'bg-blue-50 border-l-2 border-l-blue-500';
    case 'spending':
      return 'bg-red-50 border-l-2 border-l-red-500';
    case 'missedPayment':
      return 'bg-red-50 border-l-2 border-l-red-500';
    case 'newSubscription':
      return 'bg-green-50 border-l-2 border-l-green-500';
    case 'info':
    default:
      return 'bg-muted/30 border-l-2 border-l-brand-500';
  }
};

export const loadDismissedAlertsFromStorage = (): Set<string> => {
  const savedDismissedAlerts = localStorage.getItem('dismissedAlertIds');
  if (savedDismissedAlerts) {
    try {
      const dismissedIds = JSON.parse(savedDismissedAlerts);
      return new Set(dismissedIds);
    } catch (e) {
      console.error('Error parsing dismissed alerts', e);
    }
  }
  return new Set();
};

export const saveDismissedAlertsToStorage = (dismissedAlertIds: Set<string>): void => {
  localStorage.setItem('dismissedAlertIds', JSON.stringify([...dismissedAlertIds]));
};

// Improved helper to create a unique alert ID based on the subscription and event type
export const createUniqueAlertId = (type: string, subscriptionId: string, eventDetail?: string): string => {
  const today = new Date();
  // Use date parts for more stable IDs across page reloads
  const dateKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  
  // For renewal alerts, include only date info and not timestamp to prevent duplicates
  if (type === 'renewal') {
    return `${type}-${subscriptionId}-${eventDetail || ''}-${dateKey}`;
  }
  
  // For other alerts, we can use a more specific timestamp
  const timestamp = Math.floor(Date.now() / (1000 * 60 * 5)); // Round to 5-minute periods
  return `${type}-${subscriptionId}-${eventDetail || ''}-${dateKey}-${timestamp}`;
};
