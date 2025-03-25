import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import SubscriptionList from '@/components/subscription/SubscriptionList';
import SubscriptionForm from '@/components/subscription/SubscriptionForm';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import TopNavBar from '@/components/dashboard/TopNavBar';
import RenewalTimeline from '@/components/subscription/RenewalTimeline';
import AlertsModule from '@/components/alerts/AlertsModule';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle2, AlertCircle, IndianRupee } from 'lucide-react';
import { Subscription } from '@/types/subscription';
import { getSubscriptions, saveSubscription, deleteSubscription } from '@/services/subscriptionService';
import { getRecommendations } from '@/services/recommendationService';

const Dashboard = () => {
  const navigate = useNavigate();
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
  
  const handleSaveSubscription = (subscription: Subscription) => {
    try {
      saveSubscription(subscription);
      loadSubscriptions();
      
      toast.success(
        selectedSubscription || (isTopBarEditMode && subscription.id !== Date.now().toString())
          ? `Updated ${subscription.name} subscription` 
          : `Added ${subscription.name} subscription`,
        {
          className: "animate-bounce-subtle",
          position: "top-center",
        }
      );
      
      // Dispatch custom event to immediately update components
      window.dispatchEvent(new CustomEvent('subscription-updated'));
    } catch (error) {
      toast.error('Error saving subscription');
      console.error(error);
    }
  };
  
  const handleDeleteSubscription = (id: string) => {
    try {
      deleteSubscription(id);
      loadSubscriptions();
      
      // Dispatch custom event to immediately update components
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'analytics':
        return <AnalyticsDashboard subscriptions={subscriptions} />;
      case 'subscriptions':
        return (
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Subscriptions</h2>
            </div>
            
            <SubscriptionList 
              subscriptions={subscriptions}
              onEdit={handleEditSubscription}
              onDelete={handleDeleteSubscription}
              searchTerm={searchTerm}
            />
          </div>
        );
      default: // overview
        return (
          <div className="space-y-8">
            {monthlyBudget !== null && totalMonthlySpend > 0 && (
              <Alert className={totalMonthlySpend > monthlyBudget ? "border-destructive" : "border-success-500"}>
                <div className="flex items-center">
                  <IndianRupee className="h-4 w-4 mr-2" />
                  <AlertTitle>Monthly Budget: ₹{monthlyBudget.toFixed(2)}</AlertTitle>
                </div>
                <AlertDescription>
                  Current monthly spending: ₹{totalMonthlySpend.toFixed(2)} 
                  {totalMonthlySpend > monthlyBudget ? (
                    <span className="text-destructive ml-1">
                      (₹{(totalMonthlySpend - monthlyBudget).toFixed(2)} over budget)
                    </span>
                  ) : (
                    <span className="text-success-500 ml-1">
                      (₹{(monthlyBudget - totalMonthlySpend).toFixed(2)} under budget)
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <AlertsModule onEditSubscription={handleEditSubscription} />
              </div>
              <div>
                <RenewalTimeline onEditSubscription={handleEditSubscription} />
              </div>
            </div>
            
            <DashboardStats subscriptions={subscriptions} />
            
            {recommendations.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendations.map((rec) => (
                    <Card key={rec.id} className="border-l-4 border-l-warning-500 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <AlertCircle className="h-5 w-5 mr-2 text-warning-500" />
                          {rec.type === 'underutilized' ? 'Low Usage Detected' : 
                           rec.type === 'duplicate' ? 'Duplicate Services' : 
                           'Budget Recommendation'}
                        </CardTitle>
                        <CardDescription>{rec.message.replace(/\$/g, '₹')}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          variant="outline" 
                          className="p-2 h-auto font-normal text-brand-600 rounded-md hover:bg-brand-50 w-full justify-start"
                          onClick={() => handleRecommendationAction(rec)}
                        >
                          {rec.action} <ArrowRight className="h-4 w-4 ml-1" />
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Recent Subscriptions</h2>
                <Button 
                  onClick={() => setActiveTab('subscriptions')}
                  variant="outline"
                  className="rounded-md"
                >
                  View All
                </Button>
              </div>
              
              <SubscriptionList 
                subscriptions={subscriptions.slice(0, 3)}
                onEdit={handleEditSubscription}
                onDelete={handleDeleteSubscription}
              />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <TopNavBar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onAddSubscription={handleAddSubscription}
          onEditSubscription={handleEditFromTopBar}
          onSearch={handleSearch}
        />
        
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </main>
      
      <SubscriptionForm
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSaveSubscription}
        subscription={selectedSubscription}
        isEditMode={isTopBarEditMode}
        availableSubscriptions={subscriptions}
      />
    </div>
  );
};

export default Dashboard;
