
import { useState, useEffect } from 'react';
import { Subscription } from '@/types/subscription';
import { getSubscriptions, saveSubscription, deleteSubscription } from '@/services/subscriptionService';
import { getRecommendations } from '@/services/recommendationService';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useToast } from "@/hooks/use-toast";

export const useDashboardData = () => {
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState<number | null>(null);
  const [totalMonthlySpend, setTotalMonthlySpend] = useState(0);
  
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/login');
    } else {
      loadSubscriptions();
      
      // Load budget from localStorage
      const savedBudget = localStorage.getItem('monthlyBudget');
      if (savedBudget) {
        setMonthlyBudget(parseFloat(savedBudget));
      }
    }
  }, [navigate]);
  
  useEffect(() => {
    if (subscriptions.length > 0) {
      // Calculate total monthly spend
      const monthlyTotal = subscriptions.reduce((total, sub) => {
        if (sub.status !== 'active' && sub.status !== 'trial') return total;
        
        if (sub.billingCycle === "monthly") {
          return total + sub.price;
        } else if (sub.billingCycle === "yearly") {
          return total + (sub.price / 12);
        } else if (sub.billingCycle === "weekly") {
          return total + (sub.price * 4.33); // Avg. weeks in a month
        }
        return total;
      }, 0);
      
      setTotalMonthlySpend(monthlyTotal);
      
      // Check if exceeding budget
      if (monthlyBudget !== null && monthlyTotal > monthlyBudget) {
        toast.warning(
          `You are exceeding your monthly budget of ₹${monthlyBudget.toFixed(2)} by ₹${(monthlyTotal - monthlyBudget).toFixed(2)}`,
          {
            duration: 5000,
          }
        );
      }
    }
  }, [subscriptions, monthlyBudget]);
  
  useEffect(() => {
    const handleStorageChange = () => {
      const savedBudget = localStorage.getItem('monthlyBudget');
      if (savedBudget) {
        setMonthlyBudget(parseFloat(savedBudget));
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);
  
  const loadSubscriptions = () => {
    console.log('Loading subscriptions in Dashboard');
    const subs = getSubscriptions();
    setSubscriptions(subs);
    
    const recs = getRecommendations(subs);
    setRecommendations(recs);
  };
  
  const calculateDaysBetween = (startDate: Date, endDate: Date): number => {
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSaveSubscription = (subscription: Subscription, selectedSubscription: Subscription | null, isTopBarEditMode: boolean) => {
    try {
      saveSubscription(subscription);
      loadSubscriptions();
      
      const isNewSubscription = !selectedSubscription && !isTopBarEditMode;
      
      toast.success(
        selectedSubscription || (isTopBarEditMode && subscription.id !== Date.now().toString())
          ? `Updated ${subscription.name} subscription` 
          : `Added ${subscription.name} subscription`,
        {
          className: "animate-bounce-subtle",
          position: "top-center",
        }
      );
      
      if (isNewSubscription) {
        const nextBillingDate = new Date(subscription.nextBillingDate);
        const now = new Date();
        const daysToRenewal = calculateDaysBetween(now, nextBillingDate);
        
        if (daysToRenewal <= 7) {
          setTimeout(() => {
            console.log('Showing toast for new subscription renewal:', subscription.name, 'days:', daysToRenewal);
            uiToast({
              title: "Renewal Notice",
              description: `Your new subscription to ${subscription.name} will renew in ${daysToRenewal} day${daysToRenewal !== 1 ? 's' : ''}.`,
              variant: "default",
            });
            
            window.dispatchEvent(new CustomEvent('renewal-detected'));
          }, 500);
        }
      }
      
      console.log('Dispatching subscription-updated event after save');
      window.dispatchEvent(new CustomEvent('subscription-updated'));
      
      setTimeout(() => {
        console.log('Dispatching delayed subscription-updated event');
        window.dispatchEvent(new CustomEvent('subscription-updated'));
        
        window.dispatchEvent(new CustomEvent('renewal-detected'));
      }, 1000);
      
      if (isNewSubscription) {
        setTimeout(() => {
          console.log('Final event dispatch check');
          window.dispatchEvent(new CustomEvent('subscription-updated'));
          window.dispatchEvent(new CustomEvent('renewal-detected'));
        }, 2000);
      }
    } catch (error) {
      toast.error('Error saving subscription');
      console.error(error);
    }
  };

  const handleDeleteSubscription = (id: string) => {
    try {
      deleteSubscription(id);
      loadSubscriptions();
      
      window.dispatchEvent(new CustomEvent('subscription-updated'));
    } catch (error) {
      toast.error('Error deleting subscription');
      console.error(error);
    }
  };

  return {
    subscriptions,
    recommendations,
    monthlyBudget,
    totalMonthlySpend,
    handleSaveSubscription,
    handleDeleteSubscription,
    loadSubscriptions
  };
};
