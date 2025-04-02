
import { Subscription } from "@/types/subscription";
import { Alert } from '../types';

export const generateMissedPaymentAlerts = (
  currentSubscriptions: Subscription[],
  processedAlertIds: Set<string>,
  now: Date,
  onEditSubscription?: (subscription: Subscription) => void
) => {
  const newAlerts: Alert[] = [];
  
  const potentialMissedPayments = currentSubscriptions.filter(sub => {
    if (sub.status !== 'active') return false;
    
    const nextBillingDate = new Date(sub.nextBillingDate);
    return nextBillingDate < now && (now.getTime() - nextBillingDate.getTime()) < (7 * 24 * 60 * 60 * 1000);
  });
  
  if (potentialMissedPayments.length > 0) {
    potentialMissedPayments.forEach(sub => {
      const daysMissed = Math.floor((now.getTime() - new Date(sub.nextBillingDate).getTime()) / (24 * 60 * 60 * 1000));
      const missedAlertId = `missed-payment-${sub.id}-${daysMissed}`;
      
      if (!processedAlertIds.has(missedAlertId)) {
        newAlerts.push({
          id: missedAlertId,
          type: 'missedPayment',
          title: 'Possible missed payment',
          message: `Your ${sub.name} subscription payment was due ${daysMissed} day${daysMissed !== 1 ? 's' : ''} ago. Please check your payment method.`,
          date: now,
          read: false,
          action: () => onEditSubscription && onEditSubscription(sub),
          actionLabel: 'Review Subscription'
        });
        
        processedAlertIds.add(missedAlertId);
      }
    });
  }
  
  return { newAlerts };
};
