
import { Subscription } from "@/types/subscription";
import { Alert, AlertsState } from './types';
import { calculateDaysBetween, createUniqueAlertId } from './alertUtils';

export const generateRenewalAlerts = (
  subscriptions: Subscription[],
  lastData: AlertsState,
  processedAlertIds: Set<string>,
  dismissedAlertIds: Set<string>,
  now: Date,
  forceRegenerate: boolean,
  onEditSubscription?: (subscription: Subscription) => void,
  showToast?: (title: string, description: string, variant?: "default" | "destructive") => void
) => {
  const newAlerts: Alert[] = [];
  const checkedRenewalsDates = { ...lastData.checkedRenewalsDates };

  console.log('Processing', subscriptions.length, 'subscriptions for renewal alerts');
  
  subscriptions.forEach(sub => {
    const renewalDate = new Date(sub.nextBillingDate);
    const daysToRenewal = calculateDaysBetween(now, renewalDate);
    const isPastDue = renewalDate < now;
    
    console.log(`${sub.name}: ${daysToRenewal} days to renewal, past due: ${isPastDue}`);
    
    // Only show alerts for subscriptions due within 7 days or past due
    if (daysToRenewal <= 7 || isPastDue) {
      const alertId = createUniqueAlertId('renewal', sub.id, renewalDate.toISOString().split('T')[0]);
      
      if (dismissedAlertIds.has(alertId)) {
        console.log('Skipping dismissed alert:', alertId);
        return;
      }
      
      if (!forceRegenerate && processedAlertIds.has(alertId)) {
        console.log('Skipping already processed alert:', alertId);
        return;
      }
      
      const dayMessage = isPastDue 
        ? 'today (overdue)' 
        : `in ${daysToRenewal} day${daysToRenewal !== 1 ? 's' : ''}`;
      
      console.log('Creating renewal alert for', sub.name);
      
      newAlerts.push({
        id: alertId,
        type: 'renewal',
        title: `${sub.name} renewal reminder`,
        message: `Your subscription to ${sub.name} will renew ${dayMessage}. The charge will be ₹${sub.price.toFixed(2)}.`,
        date: now,
        read: false,
        action: () => onEditSubscription && onEditSubscription(sub),
        actionLabel: 'View Details'
      });
      
      processedAlertIds.add(alertId);
      checkedRenewalsDates[`${sub.id}-${renewalDate.toISOString()}`] = true;
      
      // Show toast for urgent renewals (3 days or less)
      if ((daysToRenewal <= 3 || isPastDue) && showToast) {
        console.log('Showing toast for urgent renewal:', sub.name);
        showToast(
          `${sub.name} renewal reminder`,
          `Your subscription will renew ${dayMessage}.`,
          isPastDue ? "destructive" : "default"
        );
      }
    }
  });

  console.log(`Generated ${newAlerts.length} renewal alerts`);
  return { newAlerts, checkedRenewalsDates };
};
