
import { Subscription } from "@/types/subscription";
import { Alert, AlertsState } from '../types';
import { calculateDaysBetween } from '../alertUtils';
import { useToast } from "@/hooks/use-toast";

export const generateRenewalAlerts = (
  subscriptions: Subscription[],
  lastData: AlertsState,
  processedAlertIds: Set<string>,
  dismissedAlertIds: Set<string>,
  now: Date,
  forceRegenerate: boolean,
  onEditSubscription?: (subscription: Subscription) => void
) => {
  const newAlerts: Alert[] = [];
  const checkedRenewalsDates = { ...lastData.checkedRenewalsDates };
  const { toast } = useToast();

  subscriptions.forEach(sub => {
    const renewalDate = new Date(sub.nextBillingDate);
    const daysToRenewal = calculateDaysBetween(now, renewalDate);
    const isPastDue = renewalDate < now;
    
    if (daysToRenewal <= 7 || isPastDue) {
      const alertId = `renewal-${sub.id}-${renewalDate.toISOString()}`;
      
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
        
        if ((daysToRenewal <= 3 || isPastDue) && !lastData.checkedRenewalsDates[checkedKey]) {
          console.log('Showing toast for urgent renewal:', sub.name);
          toast({
            title: `${sub.name} renewal reminder`,
            description: `Your subscription will renew ${dayMessage}.`,
            variant: "default"
          });
        }
      }
      
      checkedRenewalsDates[`${sub.id}-${renewalDate.toISOString()}`] = true;
    }
  });

  return { newAlerts, checkedRenewalsDates };
};
