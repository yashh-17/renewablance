
import { useCallback } from 'react';
import { Subscription } from '@/types/subscription';
import { getSubscriptionsDueForRenewal } from '@/services/subscriptionService';
import { Alert, AlertsState } from './types';
import { calculateDaysBetween } from './alertUtils';
import { useToast } from "@/hooks/use-toast";

export const useAlertGenerator = (
  onEditSubscription?: (subscription: Subscription) => void,
  lastData: AlertsState,
  updateLastData: (updates: Partial<AlertsState>) => void
) => {
  const { toast: uiToast } = useToast();
  
  const generateAlerts = useCallback((
    currentSubscriptions: Subscription[], 
    forceRegenerate = false
  ): Alert[] => {
    const now = new Date();
    const newAlerts: Alert[] = [];
    const processedAlertIds = new Set(lastData.processedAlertIds);
    const { dismissedAlertIds } = lastData;
    
    console.log('Generating alerts, force?', forceRegenerate, 'Current subs:', currentSubscriptions.length);
    
    // Generate renewal alerts
    const upcomingRenewals = getSubscriptionsDueForRenewal(30);
    console.log('Upcoming renewals found:', upcomingRenewals.length);
    
    upcomingRenewals.forEach(sub => {
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
            uiToast({
              title: `${sub.name} renewal reminder`,
              description: `Your subscription will renew ${dayMessage}.`,
              variant: "default"
            });
          }
        }
      }
    });
    
    // Update checked renewals dates
    const checkedRenewalsDates = { ...lastData.checkedRenewalsDates };
    upcomingRenewals.forEach(sub => {
      const renewalDate = new Date(sub.nextBillingDate);
      checkedRenewalsDates[`${sub.id}-${renewalDate.toISOString()}`] = true;
    });
    
    // Generate spending alerts
    const totalMonthlySpend = currentSubscriptions.reduce((total, sub) => {
      if (sub.status !== 'active' && sub.status !== 'trial') return total;
      
      if (sub.billingCycle === "monthly") {
        return total + sub.price;
      } else if (sub.billingCycle === "yearly") {
        return total + (sub.price / 12);
      } else if (sub.billingCycle === "weekly") {
        return total + (sub.price * 4.33);
      }
      return total;
    }, 0);
    
    const currentIds = currentSubscriptions.map(sub => sub.id);
    
    if (lastData.totalSpend > 0 && (forceRegenerate || totalMonthlySpend !== lastData.totalSpend)) {
      const spendingIncrease = totalMonthlySpend - lastData.totalSpend;
      const percentIncrease = (spendingIncrease / lastData.totalSpend) * 100;
      
      const spendingAlertId = `spending-${now.getTime()}`;
      
      if (!processedAlertIds.has(spendingAlertId)) {
        if (spendingIncrease > 0 && percentIncrease > 15) {
          newAlerts.push({
            id: spendingAlertId,
            type: 'spending',
            title: 'Unusual spending increase detected',
            message: `Your monthly subscription spending has increased by ${percentIncrease.toFixed(0)}% (₹${spendingIncrease.toFixed(2)}) compared to your previous total.`,
            date: now,
            read: false,
            action: () => {
              if (onEditSubscription) {
                const mostExpensive = currentSubscriptions
                  .filter(sub => !lastData.subscriptionIds.includes(sub.id))
                  .sort((a, b) => b.price - a.price)[0];
                
                if (mostExpensive) {
                  onEditSubscription(mostExpensive);
                }
              }
            },
            actionLabel: 'Review Expenses'
          });
          
          processedAlertIds.add(spendingAlertId);
        } else if (spendingIncrease < 0 && Math.abs(percentIncrease) > 15) {
          const decreaseAlertId = `spending-decrease-${now.getTime()}`;
          
          newAlerts.push({
            id: decreaseAlertId,
            type: 'info',
            title: 'Significant spending decrease',
            message: `Your monthly subscription spending has decreased by ${Math.abs(percentIncrease).toFixed(0)}% (₹${Math.abs(spendingIncrease).toFixed(2)}).`,
            date: now,
            read: false
          });
          
          processedAlertIds.add(decreaseAlertId);
        }
      }
    }
    
    // Generate new subscription alerts
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
                
                if (daysToRenewal <= 3) {
                  console.log('Showing toast for urgent renewal of new subscription:', newSub.name);
                  uiToast({
                    title: `${newSub.name} renewal reminder`,
                    description: `Your new subscription will renew in ${daysToRenewal} day${daysToRenewal !== 1 ? 's' : ''}.`,
                    variant: "default"
                  });
                }
              }
            }
          }
        });
      }
    }
    
    // Generate missed payment alerts
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
    
    // Update last data
    updateLastData({
      totalSpend: totalMonthlySpend,
      count: currentSubscriptions.length,
      subscriptionIds: currentSubscriptions.map(sub => sub.id),
      checkedRenewalsDates: checkedRenewalsDates,
      processedAlertIds: processedAlertIds,
      lastEventTimestamp: Date.now()
    });
    
    return newAlerts;
  }, [lastData, onEditSubscription, uiToast, updateLastData]);

  return { generateAlerts };
};
