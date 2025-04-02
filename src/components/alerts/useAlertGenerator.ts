
import { useCallback } from 'react';
import { Subscription } from '@/types/subscription';
import { getSubscriptionsDueForRenewal } from '@/services/subscriptionService';
import { Alert, AlertsState } from './types';
import { generateRenewalAlerts } from './generators/renewalAlertGenerator';
import { generateSpendingAlerts } from './generators/spendingAlertGenerator';
import { generateNewSubscriptionAlerts } from './generators/newSubscriptionAlertGenerator';
import { generateMissedPaymentAlerts } from './generators/missedPaymentAlertGenerator';
import { useToast } from "@/hooks/use-toast";

export const useAlertGenerator = (
  lastData: AlertsState,
  updateLastData: (updates: Partial<AlertsState>) => void,
  onEditSubscription?: (subscription: Subscription) => void
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
    
    const { newAlerts: renewalAlerts, checkedRenewalsDates } = generateRenewalAlerts(
      upcomingRenewals,
      lastData,
      processedAlertIds,
      dismissedAlertIds,
      now,
      forceRegenerate,
      onEditSubscription
    );
    newAlerts.push(...renewalAlerts);
    
    // Generate spending alerts
    const { newAlerts: spendingAlerts, totalMonthlySpend } = generateSpendingAlerts(
      currentSubscriptions,
      lastData,
      processedAlertIds,
      now,
      forceRegenerate,
      onEditSubscription
    );
    newAlerts.push(...spendingAlerts);
    
    // Generate new subscription alerts
    const { newAlerts: newSubscriptionAlerts } = generateNewSubscriptionAlerts(
      currentSubscriptions,
      lastData,
      processedAlertIds,
      dismissedAlertIds,
      now,
      onEditSubscription
    );
    newAlerts.push(...newSubscriptionAlerts);
    
    // Generate missed payment alerts
    const { newAlerts: missedPaymentAlerts } = generateMissedPaymentAlerts(
      currentSubscriptions,
      processedAlertIds,
      now,
      onEditSubscription
    );
    newAlerts.push(...missedPaymentAlerts);
    
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
