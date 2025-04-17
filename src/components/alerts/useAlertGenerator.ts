
import { useCallback } from 'react';
import { Subscription } from '@/types/subscription';
import { getSubscriptionsDueForRenewal } from '@/services/subscriptionService';
import { Alert, AlertsState } from './types';
import { generateRenewalAlerts } from './generators/renewalAlertGenerator';
import { generateSpendingAlerts } from './generators/spendingAlertGenerator';
import { generateNewSubscriptionAlerts } from './generators/newSubscriptionAlertGenerator';
import { generateMissedPaymentAlerts } from './generators/missedPaymentAlertGenerator';
import { useToast } from "@/hooks/use-toast";
import { createUniqueAlertId } from './alertUtils';

export const useAlertGenerator = (
  lastData: AlertsState,
  updateLastData: (updates: Partial<AlertsState>) => void,
  onEditSubscription?: (subscription: Subscription) => void,
  refreshFunc?: (force: boolean) => void
) => {
  const { toast } = useToast();
  
  const showToast = useCallback((title: string, description: string, variant: "default" | "destructive" = "default") => {
    console.log("Showing toast:", title, description);
    toast({
      title,
      description,
      variant,
    });
  }, [toast]);
  
  const generateAlerts = useCallback((
    currentSubscriptions: Subscription[], 
    forceRegenerate = false
  ): Alert[] => {
    const now = new Date();
    const newAlerts: Alert[] = [];
    const processedAlertIds = new Set(lastData.processedAlertIds);
    const { dismissedAlertIds } = lastData;
    
    console.log('Generating alerts, force?', forceRegenerate, 'Current subs:', currentSubscriptions.length);
    console.log('Dismissed alerts:', dismissedAlertIds.size, 'Processed alerts:', processedAlertIds.size);
    
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
      onEditSubscription,
      showToast
    );
    console.log('Generated renewal alerts:', renewalAlerts.length);
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
    console.log('Generated spending alerts:', spendingAlerts.length);
    newAlerts.push(...spendingAlerts);
    
    // Generate new subscription alerts
    const { newAlerts: newSubscriptionAlerts } = generateNewSubscriptionAlerts(
      currentSubscriptions,
      lastData,
      processedAlertIds,
      dismissedAlertIds,
      now,
      onEditSubscription,
      showToast
    );
    console.log('Generated new subscription alerts:', newSubscriptionAlerts.length);
    newAlerts.push(...newSubscriptionAlerts);
    
    // Generate missed payment alerts
    const { newAlerts: missedPaymentAlerts } = generateMissedPaymentAlerts(
      currentSubscriptions,
      processedAlertIds,
      now,
      onEditSubscription
    );
    console.log('Generated missed payment alerts:', missedPaymentAlerts.length);
    newAlerts.push(...missedPaymentAlerts);
    
    // Just for testing - add a test alert if no alerts were found
    if (newAlerts.length === 0 && forceRegenerate) {
      const testAlertId = createUniqueAlertId('info', 'test', 'force-generated');
      if (!dismissedAlertIds.has(testAlertId)) {
        console.log('Adding test alert to ensure notification center works');
        newAlerts.push({
          id: testAlertId,
          type: 'info',
          title: 'Welcome to Notifications',
          message: 'This is a test notification to show that the system is working.',
          date: now,
          read: false
        });
      }
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
    
    console.log('Total generated alerts:', newAlerts.length);
    return newAlerts;
  }, [lastData, onEditSubscription, showToast, updateLastData]);

  return { generateAlerts };
};
