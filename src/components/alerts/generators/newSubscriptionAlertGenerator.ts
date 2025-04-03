
import { Subscription } from "@/types/subscription";
import { Alert, AlertsState } from '../types';
import { calculateDaysBetween } from '../alertUtils';

export const generateNewSubscriptionAlerts = (
  currentSubscriptions: Subscription[],
  lastData: AlertsState,
  processedAlertIds: Set<string>,
  dismissedAlertIds: Set<string>,
  now: Date,
  onEditSubscription?: (subscription: Subscription) => void,
  showToast?: (title: string, description: string, variant?: "default" | "destructive") => void
) => {
  const newAlerts: Alert[] = [];
  
  if (lastData.subscriptionIds.length > 0) {
    const currentIds = currentSubscriptions.map(sub => sub.id);
    const newSubIds = currentIds.filter(id => !lastData.subscriptionIds.includes(id));
    
    if (newSubIds.length > 0) {
      console.log('New subscriptions detected:', newSubIds.length);
      const newSubscriptions = currentSubscriptions.filter(sub => newSubIds.includes(sub.id));
      
      newSubscriptions.forEach(newSub => {
        const newSubAlertId = `new-sub-${newSub.id}`;
        
        if (dismissedAlertIds.has(newSubAlertId)) {
          console.log('Skipping alert, already dismissed:', newSubAlertId);
          return;
        }
        
        if (!processedAlertIds.has(newSubAlertId)) {
          console.log('Adding new subscription alert for', newSub.name);
          newAlerts.push({
            id: newSubAlertId,
            type: 'newSubscription',
            title: 'New subscription added',
            message: `You've added a new subscription: ${newSub.name} (₹${newSub.price.toFixed(2)}/${newSub.billingCycle}).`,
            date: now,
            read: false,
            action: () => onEditSubscription && onEditSubscription(newSub),
            actionLabel: 'View Details'
          });
          
          processedAlertIds.add(newSubAlertId);
          
          const renewalDate = new Date(newSub.nextBillingDate);
          const daysToRenewal = calculateDaysBetween(now, renewalDate);
          
          if (daysToRenewal <= 7) {
            let urgency = '';
            if (daysToRenewal <= 3) urgency = 'Urgent: ';
            
            const renewalAlertId = `renewal-new-${newSub.id}-${renewalDate.toISOString()}`;
            
            if (!processedAlertIds.has(renewalAlertId)) {
              console.log('Adding renewal alert for new subscription', newSub.name, 'days:', daysToRenewal);
              newAlerts.push({
                id: renewalAlertId,
                type: 'renewal',
                title: `${urgency}${newSub.name} renewal reminder (new subscription)`,
                message: `Your new subscription to ${newSub.name} will renew in ${daysToRenewal} day${daysToRenewal !== 1 ? 's' : ''}. The charge will be ₹${newSub.price.toFixed(2)}.`,
                date: now,
                read: false,
                action: () => onEditSubscription && onEditSubscription(newSub),
                actionLabel: 'View Details'
              });
              
              processedAlertIds.add(renewalAlertId);
              
              if (daysToRenewal <= 3 && showToast) {
                console.log('Showing toast for urgent renewal of new subscription:', newSub.name);
                showToast(
                  `${newSub.name} renewal reminder`,
                  `Your new subscription will renew in ${daysToRenewal} day${daysToRenewal !== 1 ? 's' : ''}.`,
                  "default"
                );
              }
            }
          }
        }
      });
    }
  }
  
  return { newAlerts };
};
