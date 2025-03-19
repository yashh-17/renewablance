
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardStats from '@/components/dashboard/DashboardStats';
import SubscriptionList from '@/components/subscription/SubscriptionList';
import SubscriptionForm from '@/components/subscription/SubscriptionForm';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import TopNavBar from '@/components/dashboard/TopNavBar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Subscription } from '@/types/subscription';
import { getSubscriptions, saveSubscription, deleteSubscription } from '@/services/subscriptionService';
import { getRecommendations } from '@/services/recommendationService';

const Dashboard = () => {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Check if user is logged in
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      navigate('/login');
    } else {
      loadSubscriptions();
    }
  }, [navigate]);
  
  // Load subscriptions from local storage
  const loadSubscriptions = () => {
    const subs = getSubscriptions();
    setSubscriptions(subs);
    
    // Generate recommendations based on subscriptions
    const recs = getRecommendations(subs);
    setRecommendations(recs);
  };
  
  // Open subscription form for adding
  const handleAddSubscription = () => {
    setSelectedSubscription(null);
    setFormOpen(true);
  };
  
  // Open subscription form for editing
  const handleEditSubscription = (subscription: Subscription) => {
    setSelectedSubscription(subscription);
    setFormOpen(true);
  };
  
  // Handle save subscription (add or edit)
  const handleSaveSubscription = (subscription: Subscription) => {
    try {
      saveSubscription(subscription);
      loadSubscriptions();
      
      toast.success(
        selectedSubscription 
          ? `Updated ${subscription.name} subscription` 
          : `Added ${subscription.name} subscription`
      );
    } catch (error) {
      toast.error('Error saving subscription');
      console.error(error);
    }
  };
  
  // Handle delete subscription
  const handleDeleteSubscription = (id: string) => {
    try {
      deleteSubscription(id);
      loadSubscriptions();
    } catch (error) {
      toast.error('Error deleting subscription');
      console.error(error);
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
              <Button 
                onClick={handleAddSubscription}
                className="bg-brand-600 hover:bg-brand-700 rounded-md"
              >
                Add Subscription
              </Button>
            </div>
            
            <SubscriptionList 
              subscriptions={subscriptions}
              onEdit={handleEditSubscription}
              onDelete={handleDeleteSubscription}
            />
          </div>
        );
      default: // overview
        return (
          <div className="space-y-8">
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
                        <CardDescription>{rec.message}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Button 
                          variant="outline" 
                          className="p-2 h-auto font-normal text-brand-600 rounded-md hover:bg-brand-50 w-full justify-start"
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
      <DashboardHeader onAddSubscription={handleAddSubscription} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <TopNavBar 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onAddSubscription={handleAddSubscription} 
        />
        
        <div className="mt-6">
          {renderTabContent()}
        </div>
      </main>
      
      <SubscriptionForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveSubscription}
        subscription={selectedSubscription}
      />
    </div>
  );
};

export default Dashboard;
