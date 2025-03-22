
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Subscription } from '@/types/subscription';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

interface StatusDistributionProps {
  subscriptions: Subscription[];
}

const StatusDistribution: React.FC<StatusDistributionProps> = ({ subscriptions }) => {
  const [chartData, setChartData] = useState<{name: string; value: number; color: string}[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const statusCounts: Record<string, number> = {
      active: 0,
      trial: 0,
      inactive: 0
    };
    
    subscriptions.forEach(sub => {
      if (statusCounts[sub.status] !== undefined) {
        statusCounts[sub.status]++;
      }
    });
    
    const totalCount = subscriptions.length;
    setTotal(totalCount);
    setCounts(statusCounts);
    
    const data = [
      { name: 'Active', value: statusCounts.active, color: '#16a34a' },
      { name: 'Trial', value: statusCounts.trial, color: '#eab308' },
      { name: 'Inactive', value: statusCounts.inactive, color: '#6b7280' },
    ].filter(item => item.value > 0);
    
    setChartData(data);
  }, [subscriptions]);
  
  const getPercentage = (count: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-500';
      case 'trial':
        return 'bg-yellow-500';
      case 'inactive':
        return 'bg-gray-500';
      default:
        return 'bg-blue-500';
    }
  };

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
    
    if (percent < 0.05) return null;
    
    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Activity className="h-5 w-5 mr-2 text-brand-500" />
          Subscription Status Distribution
        </CardTitle>
        <CardDescription>
          Overview of your active, trial, and inactive subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 mb-4">
          {Object.entries(counts).map(([status, count]) => (
            <div key={status} className="text-center">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs uppercase text-muted-foreground">{status}</div>
              <Badge variant="outline" className={`mt-1 ${getStatusColor(status)}`}>
                {getPercentage(count)}%
              </Badge>
            </div>
          ))}
        </div>
        
        <div className="h-[240px] mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number) => [`${value} (${getPercentage(value)}%)`, 'Count']}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusDistribution;
