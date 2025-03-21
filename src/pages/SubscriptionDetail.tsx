
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChartContainer } from "@/components/ui/chart";
import { format } from "date-fns";
import { ArrowLeft, Calendar, IndianRupee, Edit } from 'lucide-react';
import { Subscription } from '@/types/subscription';
import { getSubscriptionById } from '@/services/subscriptionService';
import { 
  Line, 
  LineChart, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend 
} from 'recharts';
import SubscriptionForm from '@/components/subscription/SubscriptionForm';
import { toast } from 'sonner';

const SubscriptionDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usageData, setUsageData] = useState<any[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      fetchSubscriptionData();
    }
  }, [id]);

  const fetchSubscriptionData = () => {
    if (id) {
      const fetchedSubscription = getSubscriptionById(id);
      if (fetchedSubscription) {
        setSubscription(fetchedSubscription);
        // Generate mock usage data for the chart (12 months)
        generateMockUsageData(fetchedSubscription);
      } else {
        navigate('/dashboard');
      }
    }
  };

  // Listen for localStorage changes that might indicate subscription updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.includes('subscriptions')) {
        fetchSubscriptionData();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [id]);

  const generateMockUsageData = (sub: Subscription) => {
    const currentDate = new Date();
    const data = [];

    // Generate data for last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate);
      date.setMonth(currentDate.getMonth() - i);
      
      // Generate usage hours - more realistic pattern
      // Based on subscription status and random variation
      let baseHours = 0;
      
      if (sub.status === 'active') {
        baseHours = 20; // Active subscriptions get higher usage
      } else if (sub.status === 'trial') {
        baseHours = 15; // Trial gets medium usage
      } else {
        baseHours = 5; // Inactive gets low usage
      }
      
      // Add randomness with trend
      // More recent months have higher usage for active subscriptions
      let multiplier = sub.status === 'active' ? (12 - i) / 12 : 1;
      let randomFactor = 0.7 + Math.random() * 0.6; // 0.7 to 1.3
      
      let hours = Math.round(baseHours * multiplier * randomFactor);
      
      // Simulate usage drop if it's an unused subscription
      if (sub.usageData && sub.usageData < 30 && i < 3) {
        hours = Math.round(hours * 0.3);
      }
      
      data.push({
        month: format(date, 'MMM yyyy'),
        hours: hours,
        value: sub.price * (hours / 30) // Estimated value based on usage
      });
    }

    setUsageData(data);
  };

  const formatPrice = (price: number, billingCycle: string) => {
    return `₹${price.toFixed(2)}/${billingCycle.charAt(0)}`;
  };
  
  const formatNextBilling = (date: string) => {
    return new Date(date).toLocaleDateString();
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success-500";
      case "inactive":
        return "bg-gray-400";
      case "trial":
        return "bg-warning-500";
      default:
        return "bg-brand-500";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "inactive":
        return "outline";
      case "trial":
        return "secondary";
      default:
        return "default";
    }
  };

  const handleEditSubscription = () => {
    setEditModalOpen(true);
  };

  const handleSaveSubscription = (updatedSubscription: Subscription) => {
    try {
      // Import the saveSubscription function from the service
      const { saveSubscription } = require('@/services/subscriptionService');
      saveSubscription(updatedSubscription);
      
      // Update the local state
      setSubscription(updatedSubscription);
      
      // Generate new usage data based on the updated subscription
      generateMockUsageData(updatedSubscription);
      
      // Show success message
      toast.success(`Updated ${updatedSubscription.name} subscription`);
      
      // Trigger storage event to notify other components about the change
      window.dispatchEvent(new StorageEvent('storage', {
        key: `subscriptions_${JSON.parse(localStorage.getItem('currentUser') || '{}').id}`,
      }));
    } catch (error) {
      toast.error('Error updating subscription');
      console.error(error);
    }
  };

  if (!subscription) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4" 
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white ${subscription.iconBg || 'bg-brand-600'}`}>
                {subscription.icon || subscription.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{subscription.name}</h1>
                <p className="text-muted-foreground">{subscription.category}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant={getStatusBadgeVariant(subscription.status)} className="text-sm px-3 py-1">
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
              </Badge>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1 hover:bg-brand-50 hover:text-brand-600 transition-colors duration-200"
                onClick={handleEditSubscription}
              >
                <Edit className="h-4 w-4" />
                Edit
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-in slide-in-from-bottom-5">
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Subscription Cost</CardTitle>
              <CardDescription>Current subscription billing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold text-primary">{subscription.price.toFixed(2)}</span>
                <span className="text-muted-foreground">/{subscription.billingCycle}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Next Billing</CardTitle>
              <CardDescription>When you'll be charged next</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="text-xl font-semibold">{formatNextBilling(subscription.nextBillingDate)}</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="transition-all duration-300 hover:shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Current Usage</CardTitle>
              <CardDescription>How much you're using this service</CardDescription>
            </CardHeader>
            <CardContent>
              {subscription.usageData !== undefined ? (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">{subscription.usageData}% utilized</span>
                  </div>
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        subscription.usageData > 75 ? 'bg-success-500' : 
                        subscription.usageData > 30 ? 'bg-warning-500' : 'bg-brand-500'
                      }`} 
                      style={{ width: `${subscription.usageData}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <span className="text-muted-foreground">No usage data available</span>
              )}
            </CardContent>
          </Card>
        </div>
        
        <Card className="mb-6 transition-all duration-300 hover:shadow-md animate-in slide-in-from-bottom-5 delay-150">
          <CardHeader>
            <CardTitle>Monthly Usage History</CardTitle>
            <CardDescription>
              Hours spent using {subscription.name} over the past 12 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={usageData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                  />
                  <YAxis 
                    yAxisId="left"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                    label={{ value: 'Hours Used', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                  />
                  <YAxis 
                    yAxisId="right" 
                    orientation="right"
                    tick={{ fontSize: 12 }}
                    tickMargin={10}
                    label={{ value: 'Value (₹)', angle: 90, position: 'insideRight', style: { textAnchor: 'middle' } }}
                  />
                  <Tooltip 
                    formatter={(value: number, name) => [
                      name === 'hours' ? `${value} hours` : `₹${value.toFixed(2)}`,
                      name === 'hours' ? 'Usage' : 'Value'
                    ]}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="hours" 
                    stroke="#4f46e5" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Hours Used"
                    animationDuration={1500}
                  />
                  <Line 
                    yAxisId="right"
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name="Value (₹)"
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card className="transition-all duration-300 hover:shadow-md animate-in slide-in-from-bottom-5 delay-300">
          <CardHeader>
            <CardTitle>Subscription Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Name</p>
                <p className="font-medium">{subscription.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Category</p>
                <p className="font-medium">{subscription.category}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Billing Cycle</p>
                <p className="font-medium capitalize">{subscription.billingCycle}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(subscription.status)} mr-2`}></div>
                  <p className="font-medium capitalize">{subscription.status}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Price</p>
                <p className="font-medium">{formatPrice(subscription.price, subscription.billingCycle)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Subscription Date</p>
                <p className="font-medium">{new Date(subscription.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Add the SubscriptionForm component for editing */}
      <SubscriptionForm
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveSubscription}
        subscription={subscription}
      />
    </div>
  );
};

export default SubscriptionDetail;
