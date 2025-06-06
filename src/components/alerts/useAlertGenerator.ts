
import { useCallback } from 'react';
import { Subscription } from '@/types/subscription';
import { getSubscriptionsDueForRenewal } from '@/services/subscription';
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
    
    // Removed test alert logic - no more fake notifications
    
    console.log('Total alerts generated:', newAlerts.length);
    
    // Dispatch event to sync notification count
    window.dispatchEvent(new CustomEvent('alerts-count-updated', { 
      detail: { count: newAlerts.length } 
    }));
    
    return newAlerts;
  }, [lastData, onEditSubscription, showToast, updateLastData]);

  return { generateAlerts };
};
