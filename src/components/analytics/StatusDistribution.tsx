
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Subscription } from '@/types/subscription';
import { Badge } from '@/components/ui/badge';
import { Activity, Check, X, Clock } from 'lucide-react';

interface StatusDistributionProps {
  subscriptions: Subscription[];
}

const StatusDistribution: React.FC<StatusDistributionProps> = ({ subscriptions }) => {
  const [chartData, setChartData] = useState<{name: string; value: number; color: string}[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);

  // Rainbow pastel color scheme
  const statusColors = {
    active: '#a8e6cf',  // pastel green
    trial: '#ffd3b6',   // pastel orange
    inactive: '#d9d9d9' // pastel gray
  };

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <Check className="h-3 w-3" />;
      case 'inactive':
        return <X className="h-3 w-3" />;
      case 'trial':
        return <Clock className="h-3 w-3" />;
      default:
        return null;
    }
  };

  useEffect(() => {
    // Count subscriptions by status - only these three statuses
    const statusCounts: Record<string, number> = {
      active: 0,
      trial: 0,
      inactive: 0
    };
    
    // Count directly from actual subscriptions
    subscriptions.forEach(sub => {
      if (sub.status in statusCounts) {
        statusCounts[sub.status]++;
      }
    });
    
    const totalCount = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);
    setTotal(totalCount);
    setCounts(statusCounts);
    
    // Create data for the status pie chart
    const data = [
      { name: 'Active', value: statusCounts.active, color: statusColors.active },
      { name: 'Trial', value: statusCounts.trial, color: statusColors.trial },
      { name: 'Inactive', value: statusCounts.inactive, color: statusColors.inactive },
    ].filter(item => item.value > 0);
    
    setChartData(data);
  }, [subscriptions]);
  
  const getPercentage = (count: number) => {
    return total > 0 ? Math.round((count / total) * 100) : 0;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-emerald-200';
      case 'trial':
        return 'bg-orange-200';
      case 'inactive':
        return 'bg-gray-200';
      default:
        return 'bg-blue-200';
    }
  };

  // Custom label renderer for the chart
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    name
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
    
    if (percent < 0.08) return null;
    
    return (
      <text
        x={x}
        y={y}
        fill="black"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Function to format tooltip values
  const tooltipFormatter = (value: number, name: string) => {
    return [`${value} (${Math.round((value / total) * 100)}%)`, name];
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
        
        <div className="h-[280px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomLabel}
                innerRadius={60}
                outerRadius={120}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={2} stroke="#fff" />
                ))}
              </Pie>
              <Tooltip 
                formatter={tooltipFormatter}
                contentStyle={{ 
                  backgroundColor: 'var(--background)', 
                  border: '1px solid var(--border)' 
                }}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ paddingTop: "20px" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusDistribution;
