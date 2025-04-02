
import { Subscription } from "@/types/subscription";
import { Alert, AlertsState } from '../types';

export const generateSpendingAlerts = (
  currentSubscriptions: Subscription[],
  lastData: AlertsState,
  processedAlertIds: Set<string>,
  now: Date,
  forceRegenerate: boolean,
  onEditSubscription?: (subscription: Subscription) => void
) => {
  const newAlerts: Alert[] = [];
  
  // Calculate total monthly spend
  const totalMonthlySpend = calculateMonthlySpend(currentSubscriptions);
  
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
  
  return { newAlerts, totalMonthlySpend };
};

export const calculateMonthlySpend = (subscriptions: Subscription[]): number => {
  return subscriptions.reduce((total, sub) => {
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
};
