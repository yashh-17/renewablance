
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';
import { Subscription } from '@/types/subscription';
import { TrendingUp, ArrowUpCircle } from 'lucide-react';
import { format, subMonths, differenceInCalendarMonths } from 'date-fns';

interface SpendingTrendOverTimeProps {
  subscriptions: Subscription[];
}

const SpendingTrendOverTime: React.FC<SpendingTrendOverTimeProps> = ({ subscriptions }) => {
  const [chartData, setChartData] = useState<any[]>([]);
  const [peakPoint, setPeakPoint] = useState<{month: string, spending: number, index: number} | null>(null);

  useEffect(() => {
    const data = generateMonthlySpendingData(subscriptions);
    setChartData(data.monthlyData);
    setPeakPoint(data.peakPoint);
  }, [subscriptions]);

  const generateMonthlySpendingData = (subs: Subscription[]) => {
    const now = new Date();
    const monthlyData = [];
    let highestSpending = 0;
    let peakMonth = '';
    let peakIndex = 0;

    // Generate data for the last 12 months
    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthKey = format(monthDate, 'MMM yyyy');
      
      // Calculate which subscriptions were active in this month
      const monthlyTotal = subs.reduce((total, sub) => {
        const startDate = sub.startDate ? new Date(sub.startDate) : new Date(sub.createdAt);
        
        // Skip if subscription started after this month
        if (startDate > monthDate) return total;
        
        // Calculate months difference to determine if inactive subscriptions were active then
        const monthsAgo = differenceInCalendarMonths(now, monthDate);
        
        // For inactive subscriptions, assume they were active if they started more than 1 month ago
        // but became inactive within the last 2 months (simplified simulation)
        if (sub.status === 'inactive') {
          // Random chance based on how long ago this month was
          // More recent months have higher chance the subscription was still active
          const wasActive = monthsAgo < 3 ? Math.random() > 0.7 : Math.random() > 0.3;
          if (!wasActive) return total;
        }
        
        // Convert to monthly equivalent
        if (sub.billingCycle === "monthly") {
          return total + sub.price;
        } else if (sub.billingCycle === "yearly") {
          return total + (sub.price / 12);
        } else if (sub.billingCycle === "weekly") {
          return total + (sub.price * 4.33); // Avg. weeks in a month
        }
        return total;
      }, 0);
      
      // Store data for this month
      monthlyData.push({
        month: monthKey,
        spending: monthlyTotal.toFixed(2)
      });
      
      // Check if this is the peak spending
      if (monthlyTotal > highestSpending) {
        highestSpending = monthlyTotal;
        peakMonth = monthKey;
        peakIndex = 11 - i; // Convert to array index
      }
    }
    
    return { 
      monthlyData, 
      peakPoint: highestSpending > 0 ? { 
        month: peakMonth, 
        spending: highestSpending, 
        index: peakIndex 
      } : null 
    };
  };

  // Custom tooltip for the peak marker
  const renderPeakTooltip = (props: any) => {
    const { active, payload } = props;
    
    if (active && payload && payload.length && peakPoint && 
        payload[0].payload.month === peakPoint.month) {
      return (
        <div className="px-3 py-2 bg-background border rounded-md shadow-md">
          <p className="font-medium text-sm">Peak Spending Month</p>
          <p className="text-sm">₹{parseFloat(payload[0].value).toFixed(2)}</p>
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-brand-500" />
          Spending Trend Over Time
        </CardTitle>
        <CardDescription>
          Visualize your subscription spending over the last 12 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip 
                formatter={(value) => [`₹${value}`, 'Spending']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="spending" 
                name="Monthly Spending" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 4, fill: "#3b82f6" }}
                activeDot={{ r: 6 }}
              />
              {peakPoint && (
                <ReferenceDot 
                  x={peakPoint.month} 
                  y={peakPoint.spending.toFixed(2)} 
                  r={6}
                  fill="#ef4444"
                  stroke="#fff"
                  strokeWidth={2}
                  isFront={true}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
          {peakPoint && (
            <div className="flex items-center justify-end mt-2 text-xs text-muted-foreground">
              <div className="flex items-center">
                <div className="h-3 w-3 rounded-full bg-red-500 mr-1"></div>
                <span>Peak spending ({peakPoint.month}): ₹{peakPoint.spending.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingTrendOverTime;
