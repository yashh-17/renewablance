
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign, Calendar, Wallet } from "lucide-react";
import { Subscription } from "@/types/subscription";
import SpendingByCategory from "./SpendingByCategory";
import SpendingDistribution from "./SpendingDistribution";
import TopSpendingCategories from "./TopSpendingCategories";

interface AnalyticsDashboardProps {
  subscriptions: Subscription[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ subscriptions }) => {
  // Calculate monthly and yearly costs
  const monthlySubs = subscriptions.filter(sub => sub.billingCycle === "monthly");
  const yearlySubs = subscriptions.filter(sub => sub.billingCycle === "yearly");
  
  // Calculate monthly direct spending
  const monthlyDirect = monthlySubs.reduce((total, sub) => total + sub.price, 0);
  
  // Calculate annual spending in monthly equivalent
  const annualMonthlyEquivalent = yearlySubs.reduce((total, sub) => total + (sub.price / 12), 0);
  
  // Calculate total monthly spending
  const totalMonthlySpending = monthlyDirect + annualMonthlyEquivalent;
  
  // Group subscriptions by category for analytics
  const categoriesMap = subscriptions.reduce((acc, subscription) => {
    const { category, price, billingCycle } = subscription;
    
    // Convert to monthly equivalent
    const monthlyPrice = billingCycle === "monthly" 
      ? price 
      : billingCycle === "yearly" 
        ? price / 12 
        : price * 4.33; // for weekly
    
    if (!acc[category]) {
      acc[category] = { total: 0, count: 0 };
    }
    
    acc[category].total += monthlyPrice;
    acc[category].count += 1;
    
    return acc;
  }, {} as Record<string, { total: number; count: number }>);
  
  // Sort categories by spending for top categories list
  const sortedCategories = Object.entries(categoriesMap)
    .map(([name, data]) => ({
      name,
      monthly: data.total,
      count: data.count
    }))
    .sort((a, b) => b.monthly - a.monthly);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold mb-2">Analytics Dashboard</h2>
        <p className="text-muted-foreground mb-6">
          Get insights into your subscription spending and usage patterns.
        </p>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Direct</CardTitle>
            <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{monthlyDirect.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ₹{(monthlyDirect / 30).toFixed(2)} per day
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Annual (Monthly Equivalent)</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{annualMonthlyEquivalent.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ₹{(annualMonthlyEquivalent / 30).toFixed(2)} per day
            </p>
          </CardContent>
        </Card>
        
        <Card className="rounded-lg shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Monthly Spending</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalMonthlySpending.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              ₹{(totalMonthlySpending / 30).toFixed(2)} per day
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Tabbed Sections */}
      <Tabs defaultValue="category" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="category">Spending by Category</TabsTrigger>
          <TabsTrigger value="services">Spending by Services</TabsTrigger>
        </TabsList>
        
        <TabsContent value="category" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendingByCategory categories={sortedCategories} />
            <SpendingDistribution categories={sortedCategories} />
          </div>
          
          <TopSpendingCategories categories={sortedCategories} />
        </TabsContent>
        
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <CardTitle>Services Analysis</CardTitle>
              <CardDescription>Coming soon: detailed analysis of spending by service.</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsDashboard;
