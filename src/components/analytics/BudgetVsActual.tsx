
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet } from 'lucide-react';
import { Subscription } from '@/types/subscription';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BudgetVsActualProps {
  subscriptions: Subscription[];
}

const BudgetVsActual: React.FC<BudgetVsActualProps> = ({ subscriptions }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  
  useEffect(() => {
    // Generate budget vs actual data
    generateBudgetVsActualData();
  }, [subscriptions]);

  const generateBudgetVsActualData = () => {
    const months = [];
    const currentDate = new Date();
    
    // Generate data for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = new Date();
      month.setMonth(currentDate.getMonth() - i);
      const monthName = format(month, 'MMM');
      
      // Calculate actual spending for this month
      const actualSpending = calculateActualSpending(month);
      
      // Generate a budget (in a real app, this would come from user input)
      // For simulation, we'll set a budget that's somewhat related to actual spending
      const budget = generateSimulatedBudget(actualSpending);
      
      months.push({
        name: monthName,
        budget: budget,
        actual: actualSpending,
        variance: actualSpending - budget
      });
    }
    
    setChartData(months);
  };

  const calculateActualSpending = (month: Date) => {
    return subscriptions.reduce((total, subscription) => {
      // Convert all to monthly equivalent
      let monthlyAmount = 0;
      if (subscription.billingCycle === 'monthly') {
        monthlyAmount = subscription.price;
      } else if (subscription.billingCycle === 'yearly') {
        monthlyAmount = subscription.price / 12;
      } else if (subscription.billingCycle === 'weekly') {
        monthlyAmount = subscription.price * 4.33; // Average weeks per month
      }
      
      // For simulation purposes, we'll assume all active subscriptions were active in past months
      // with some random variance
      if (subscription.status === 'active' || subscription.status === 'trial') {
        // Add some randomness to simulate monthly variations
        const monthFactor = (month.getMonth() + 1) / 12; // Creates variation based on month
        const randomFactor = 0.8 + (Math.random() * 0.4); // Between 0.8 and 1.2
        return total + (monthlyAmount * randomFactor * (1 + monthFactor * 0.1));
      }
      
      return total;
    }, 0);
  };

  const generateSimulatedBudget = (actualSpending: number) => {
    // For simulation, create a budget that's sometimes over, sometimes under actual
    const randomFactor = 0.85 + (Math.random() * 0.3); // Between 0.85 and 1.15
    return actualSpending * randomFactor;
  };

  // Custom tooltip to show variance
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const budget = payload[0].value;
      const actual = payload[1].value;
      const variance = actual - budget;
      const isOverBudget = variance > 0;
      
      return (
        <div className="bg-white p-3 border rounded shadow-md">
          <p className="font-medium">{label}</p>
          <p className="text-sm">Budget: Rs.{budget.toFixed(2)}</p>
          <p className="text-sm">Actual: Rs.{actual.toFixed(2)}</p>
          <p className={`text-sm font-semibold ${isOverBudget ? 'text-red-500' : 'text-green-500'}`}>
            {isOverBudget ? 'Over budget' : 'Under budget'}: Rs.{Math.abs(variance).toFixed(2)}
          </p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Wallet className="h-5 w-5 mr-2 text-brand-500" />
          Budget vs. Actual Spending
        </CardTitle>
        <CardDescription>
          Compare your planned budget with actual subscription expenses
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(value) => `Rs.${value}`} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="budget" name="Budget" fill="#8884d8" />
              <Bar dataKey="actual" name="Actual" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary */}
        <div className="mt-4 grid grid-cols-3 gap-4 text-center">
          {chartData.length > 0 && (
            <>
              <div className="bg-purple-50 p-2 rounded-md">
                <p className="text-xs text-muted-foreground">Average Budget</p>
                <p className="font-semibold">
                  Rs.{(chartData.reduce((sum, item) => sum + item.budget, 0) / chartData.length).toFixed(2)}
                </p>
              </div>
              <div className="bg-green-50 p-2 rounded-md">
                <p className="text-xs text-muted-foreground">Average Actual</p>
                <p className="font-semibold">
                  Rs.{(chartData.reduce((sum, item) => sum + item.actual, 0) / chartData.length).toFixed(2)}
                </p>
              </div>
              <div 
                className={`p-2 rounded-md ${
                  chartData.reduce((sum, item) => sum + item.variance, 0) > 0 
                    ? 'bg-red-50' 
                    : 'bg-green-50'
                }`}
              >
                <p className="text-xs text-muted-foreground">Average Variance</p>
                <p className="font-semibold">
                  Rs.{Math.abs(chartData.reduce((sum, item) => sum + item.variance, 0) / chartData.length).toFixed(2)}
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetVsActual;
