
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign, Calendar, TrendingUp, CreditCard } from "lucide-react";
import { Subscription } from "@/types/subscription";

interface DashboardStatsProps {
  subscriptions: Subscription[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ subscriptions }) => {
  // Calculate total monthly cost
  const totalMonthlyCost = subscriptions.reduce((total, sub) => {
    if (sub.billingCycle === "monthly") {
      return total + sub.price;
    } else if (sub.billingCycle === "yearly") {
      return total + (sub.price / 12);
    } else if (sub.billingCycle === "weekly") {
      return total + (sub.price * 4.33); // Average weeks in a month
    }
    return total;
  }, 0);
  
  // Calculate total yearly cost
  const totalYearlyCost = totalMonthlyCost * 12;
  
  // Count active subscriptions
  const activeSubscriptions = subscriptions.length;
  
  // Find most expensive subscription
  const mostExpensive = subscriptions.reduce((prev, current) => {
    // Convert all to monthly cost for comparison
    const prevMonthly = prev.billingCycle === "monthly" 
      ? prev.price 
      : prev.billingCycle === "yearly" 
        ? prev.price / 12 
        : prev.price * 4.33;
        
    const currentMonthly = current.billingCycle === "monthly" 
      ? current.price 
      : current.billingCycle === "yearly" 
        ? current.price / 12 
        : current.price * 4.33;
        
    return prevMonthly > currentMonthly ? prev : current;
  }, subscriptions[0] || { name: "None", price: 0 });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Spend</CardTitle>
          <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalMonthlyCost.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            ${(totalMonthlyCost / 30).toFixed(2)} per day
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Annual Spend</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalYearlyCost.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            ${(totalYearlyCost / 365).toFixed(2)} per day
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeSubscriptions}</div>
          <p className="text-xs text-muted-foreground">
            {activeSubscriptions > 0 
              ? `${(totalMonthlyCost / activeSubscriptions).toFixed(2)} avg. per service` 
              : "No active subscriptions"}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Most Expensive</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold truncate">
            {mostExpensive?.name || "None"}
          </div>
          <p className="text-xs text-muted-foreground">
            {mostExpensive?.price > 0 
              ? `$${mostExpensive.price.toFixed(2)} per ${mostExpensive.billingCycle}` 
              : "No subscriptions"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardStats;
