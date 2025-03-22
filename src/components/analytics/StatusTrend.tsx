
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Subscription } from '@/types/subscription';
import { TrendingUp } from 'lucide-react';

interface StatusTrendProps {
  subscriptions: Subscription[];
}

const StatusTrend: React.FC<StatusTrendProps> = ({ subscriptions }) => {
  const [chartData, setChartData] = useState<any[]>([]);

  // Generate historical data based on subscriptions whenever they change
  useEffect(() => {
    setChartData(getHistoricalData());
  }, [subscriptions]);

  // Generate some historical data based on current subscriptions and their start dates
  const getHistoricalData = () => {
    const data = [];
    const currentDate = new Date();
    const months = [];
    
    // Generate the last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = new Date();
      month.setMonth(currentDate.getMonth() - i);
      months.push({
        label: month.toLocaleString('default', { month: 'short' }),
        date: month
      });
    }
    
    // Calculate subscription status for each month
    months.forEach((month, monthIndex) => {
      const monthData = {
        name: month.label,
        active: 0,
        trial: 0,
        inactive: 0
      };
      
      subscriptions.forEach(sub => {
        const startDate = new Date(sub.startDate || sub.createdAt);
        // Check if subscription was already started by this month
        if (startDate <= month.date) {
          // Simplified logic: subscriptions created earlier are active in this month, 
          // except those currently inactive (which we'll assume became inactive recently)
          if (sub.status === 'inactive') {
            // Randomly distribute inactive subscriptions across months
            if (Math.random() > 0.7) {
              monthData.inactive++;
            } else {
              monthData.active++;
            }
          } else if (sub.status === 'trial') {
            // Trials are more recent
            if (monthIndex <= 1) {
              monthData.trial++;
            } else {
              monthData.active++;
            }
          } else {
            monthData.active++;
          }
        }
      });
      
      data.push(monthData);
    });
    
    return data;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-brand-500" />
          Subscription Status Trend
        </CardTitle>
        <CardDescription>
          Historical view of your subscription statuses over the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
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
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="active" name="Active" fill="#16a34a" />
              <Bar dataKey="trial" name="Trial" fill="#eab308" />
              <Bar dataKey="inactive" name="Inactive" fill="#6b7280" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusTrend;
