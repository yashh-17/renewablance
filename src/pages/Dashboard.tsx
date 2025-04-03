
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import SubscriptionsTab from '@/components/dashboard/tabs/SubscriptionsTab';
import AnalyticsTab from '@/components/dashboard/tabs/AnalyticsTab';
import SubscriptionForm from '@/components/subscription/SubscriptionForm';
import { Subscription } from '@/types/subscription';
import { getSubscriptions, saveSubscription, deleteSubscription } from '@/services/subscriptionService';
import { getRecommendations } from '@/services/recommendationService';
import { useToast } from "@/hooks/use-toast";
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [isTopBarEditMode, setIsTopBarEditMode] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
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
  
  const handleAddSubscription = () => {
    setIsTopBarEditMode(false);
    setSelectedSubscription(null);
    setFormOpen(true);
  };
  
  const handleEditFromTopBar = () => {
    setIsTopBarEditMode(true);
    setSelectedSubscription(null);
    setFormOpen(true);
  };
  
  const handleEditSubscription = (subscription: Subscription) => {
    setIsTopBarEditMode(false);
    setSelectedSubscription(subscription);
    setFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setFormOpen(false);
    setIsTopBarEditMode(false);
    setSelectedSubscription(null);
  };
  
  const calculateDaysBetween = (startDate: Date, endDate: Date): number => {
    const diffTime = endDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  const handleSaveSubscription = (subscription: Subscription) => {
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
      
      if (isNewSubscription && activeTab !== 'overview') {
        setActiveTab('overview');
      }
      
      setTimeout(() => {
        console.log('Dispatching delayed subscription-updated event');
        window.dispatchEvent(new CustomEvent('subscription-updated'));
        
        window.dispatchEvent(new CustomEvent('renewal-detected'));
      }, 1000);
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

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (activeTab !== 'subscriptions') {
      setActiveTab('subscriptions');
      toast.info('Switched to Subscriptions tab to show search results');
    }
  };

  const handleRecommendationAction = (rec: any) => {
    switch (rec.type) {
      case 'underutilized':
        if (rec.subscriptionId) {
          const subscription = subscriptions.find(sub => sub.id === rec.subscriptionId);
          if (subscription) {
            setSelectedSubscription(subscription);
            setFormOpen(true);
            toast.info(`Opened ${subscription.name} for review`);
          }
        }
        break;
      case 'duplicate':
        setActiveTab('subscriptions');
        toast.info(`Switched to Subscriptions tab to review your ${rec.category} subscriptions`);
        break;
      case 'budget':
        setActiveTab('analytics');
        toast.info('Switched to Analytics tab to review your spending');
        break;
      default:
        break;
    }
  };

  return (
    <DashboardLayout>
      <TopNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddSubscription={handleAddSubscription}
        onEditSubscription={handleEditFromTopBar}
        onSearch={handleSearch}
      />
      
      <div className="mt-6">
        {activeTab === 'overview' && (
          <DashboardOverview
            subscriptions={subscriptions}
            recommendations={recommendations}
            monthlyBudget={monthlyBudget}
            totalMonthlySpend={totalMonthlySpend}
            handleEditSubscription={handleEditSubscription}
            handleRecommendationAction={handleRecommendationAction}
            onViewAllClick={() => setActiveTab('subscriptions')}
          />
        )}
        
        {activeTab === 'analytics' && (
          <AnalyticsTab subscriptions={subscriptions} />
        )}
        
        {activeTab === 'subscriptions' && (
          <SubscriptionsTab
            subscriptions={subscriptions}
            searchTerm={searchTerm}
            onEdit={handleEditSubscription}
            onDelete={handleDeleteSubscription}
          />
        )}
      </div>
      
      <SubscriptionForm
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSaveSubscription}
        subscription={selectedSubscription}
        isEditMode={isTopBarEditMode}
        availableSubscriptions={subscriptions}
      />
    </DashboardLayout>
  );
};

// Import this directly here to avoid circular dependencies
import TopNavBar from '@/components/dashboard/TopNavBar';

export default Dashboard;
