
import { useCallback } from 'react';
import { Subscription } from '@/types/subscription';
import { getSubscriptionsDueForRenewal } from '@/services/subscriptionService';
import { Alert, AlertsState } from './types';
import { generateRenewalAlerts } from './generators/renewalAlertGenerator';
import { useToast } from "@/hooks/use-toast";
import { createUniqueAlertId } from './alertUtils';

export const useAlertGenerator = (
  lastData: AlertsState,
  updateLastData: (updates: Partial<AlertsState>) => void,
  onEditSubscription?: (subscription: Subscription) => void
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
    
    console.log('Generating alerts for', currentSubscriptions.length, 'subscriptions');
    
    // Get upcoming renewals (within 7 days)
    const upcomingRenewals = getSubscriptionsDueForRenewal(7);
    console.log('Found', upcomingRenewals.length, 'upcoming renewals');
    
    if (upcomingRenewals.length > 0) {
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
      
      console.log('Generated', renewalAlerts.length, 'renewal alerts');
      newAlerts.push(...renewalAlerts);
      
      // Update checked dates
      updateLastData({
        checkedRenewalsDates,
        processedAlertIds: processedAlertIds,
        lastEventTimestamp: Date.now()
      });
    }
    
    // Add a test alert if no real alerts exist and we're force generating
    if (newAlerts.length === 0 && forceRegenerate) {
      const testAlertId = createUniqueAlertId('info', 'test', 'no-alerts');
      if (!dismissedAlertIds.has(testAlertId)) {
        console.log('Adding test notification');
        newAlerts.push({
          id: testAlertId,
          type: 'info',
          title: 'Notification Center Active',
          message: 'Your notifications are working! You will see renewal alerts here when subscriptions are due within 7 days.',
          date: now,
          read: false
        });
      }
    }
    
    console.log('Total alerts generated:', newAlerts.length);
    return newAlerts;
  }, [lastData, onEditSubscription, showToast, updateLastData]);

  return { generateAlerts };
};
