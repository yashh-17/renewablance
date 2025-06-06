
import { Subscription } from "@/types/subscription";
import { Alert, AlertsState } from '../types';
import { calculateDaysBetween, createUniqueAlertId } from '../alertUtils';

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
  const processedToasts = new Set<string>();

  console.log('Processing subscriptions for renewal alerts:', subscriptions.length);
  
  subscriptions.forEach(sub => {
    const renewalDate = new Date(sub.nextBillingDate);
    const daysToRenewal = calculateDaysBetween(now, renewalDate);
    const isPastDue = renewalDate < now;
    
    console.log(`Subscription: ${sub.name}, days to renewal: ${daysToRenewal}, past due: ${isPastDue}`);
    
    if (daysToRenewal <= 7 || isPastDue) {
      // Create a unique ID for this alert
      const alertId = createUniqueAlertId('renewal', sub.id, renewalDate.toISOString().split('T')[0]);
      
      console.log(`Creating alert with ID: ${alertId}`);
      
      if (dismissedAlertIds.has(alertId)) {
        console.log('Skipping alert, already dismissed:', alertId);
        return;
      }
      
      if (!forceRegenerate && processedAlertIds.has(alertId)) {
        console.log('Skipping alert, already processed:', alertId);
        return;
      }
      
      const checkedKey = `${sub.id}-${renewalDate.toISOString()}`;
      
      if (forceRegenerate || !lastData.checkedRenewalsDates[checkedKey]) {
        let urgency = '';
        if (daysToRenewal <= 3 || isPastDue) urgency = 'Urgent: ';
        
        console.log('Adding renewal alert for', sub.name, 'days:', daysToRenewal);
        
        const dayMessage = isPastDue 
          ? 'Renewal due today' 
          : `in ${daysToRenewal} day${daysToRenewal !== 1 ? 's' : ''}`;
        
        newAlerts.push({
          id: alertId,
          type: 'renewal',
          title: `${urgency}${sub.name} renewal reminder`,
          message: `Your subscription to ${sub.name} will renew ${dayMessage}. The charge will be ₹${sub.price.toFixed(2)}.`,
          date: now,
          read: false,
          action: () => onEditSubscription && onEditSubscription(sub),
          actionLabel: 'View Details'
        });
        
        processedAlertIds.add(alertId);
        
        // Add toast to a list of processed toasts to avoid duplicates
        const toastKey = `toast-${alertId}`;
        
        if ((daysToRenewal <= 3 || isPastDue) && 
            !lastData.checkedRenewalsDates[checkedKey] && 
            showToast && 
            !processedToasts.has(toastKey)) {
          
          console.log('Showing toast for urgent renewal:', sub.name);
          showToast(
            `${sub.name} renewal reminder`,
            `Your subscription will renew ${dayMessage}.`,
            "default"
          );
          
          processedToasts.add(toastKey);
        }
      }
      
      checkedRenewalsDates[`${sub.id}-${renewalDate.toISOString()}`] = true;
    }
  });

  console.log(`Generated ${newAlerts.length} renewal alerts`);
  return { newAlerts, checkedRenewalsDates };
};
