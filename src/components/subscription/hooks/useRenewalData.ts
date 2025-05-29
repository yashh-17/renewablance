
import { useState, useEffect, useRef } from 'react';
import { getSubscriptionsDueForRenewal } from '@/services/subscription';
import { Subscription } from '@/types/subscription';
import { calculateDaysBetween } from '../utils/renewalUtils';

interface RenewalData {
  week: Subscription[];
  twoWeeks: Subscription[];
  month: Subscription[];
}

export const useRenewalData = () => {
  const [renewals, setRenewals] = useState<RenewalData>({
    week: [],
    twoWeeks: [],
    month: []
  });
  const [forceUpdate, setForceUpdate] = useState(0);
  const lastUpdateRef = useRef<number>(0);

  const loadRenewals = () => {
    console.log('Loading renewals in RenewalTimeline');
    const currentTime = Date.now();
    
    // Prevent excessive updates (debounce)
    if (currentTime - lastUpdateRef.current < 300) {
      console.log('Skipping renewal update - too soon after last update');
      return;
    }
    
    lastUpdateRef.current = currentTime;
    
    const weekRenewals = getSubscriptionsDueForRenewal(7);
    const twoWeeksRenewals = getSubscriptionsDueForRenewal(14).filter(
      sub => !weekRenewals.some(weekSub => weekSub.id === sub.id)
    );
    const monthRenewals = getSubscriptionsDueForRenewal(30).filter(
      sub => !weekRenewals.some(weekSub => weekSub.id === sub.id) && 
             !twoWeeksRenewals.some(twoWeekSub => twoWeekSub.id === sub.id)
    );

    console.log('Found renewals:', 
      'week:', weekRenewals.length, 
      'twoWeeks:', twoWeeksRenewals.length, 
      'month:', monthRenewals.length
    );

    const newRenewals = {
      week: weekRenewals,
      twoWeeks: twoWeeksRenewals,
      month: monthRenewals
    };
    
    setRenewals(newRenewals);
    
    // Check if any new immediate renewals (within 7 days) were loaded
    const hasImmediateRenewals = weekRenewals.some(sub => {
      const now = new Date();
      const renewalDate = new Date(sub.nextBillingDate);
      const daysToRenewal = calculateDaysBetween(now, renewalDate);
      return daysToRenewal <= 7;
    });
    
    if (hasImmediateRenewals) {
      console.log('Immediate renewals detected, dispatching event');
      window.dispatchEvent(new CustomEvent('renewal-detected'));
    }
    
    setForceUpdate(prev => prev + 1);
  };

  useEffect(() => {
    loadRenewals();
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key.includes('subscriptions_')) {
        console.log('Storage change detected in RenewalTimeline');
        loadRenewals();
      }
    };
    
    const handleCustomEvent = () => {
      console.log('Subscription updated event received in RenewalTimeline');
      loadRenewals();
    };
    
    const handleRenewalDetected = () => {
      console.log('Renewal detected event received in RenewalTimeline');
      loadRenewals();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('subscription-updated', handleCustomEvent);
    window.addEventListener('renewal-detected', handleRenewalDetected);
    
    const intervalId = setInterval(loadRenewals, 15000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('subscription-updated', handleCustomEvent);
      window.removeEventListener('renewal-detected', handleRenewalDetected);
      clearInterval(intervalId);
    };
  }, []);

  return { renewals, forceUpdate };
};
