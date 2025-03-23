
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
  const [innerRingData, setInnerRingData] = useState<{name: string; value: number; color: string}[]>([]);
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
    
    // Main outer ring data
    const data = [
      { name: 'Active', value: statusCounts.active, color: '#16a34a' },
      { name: 'Trial', value: statusCounts.trial, color: '#eab308' },
      { name: 'Inactive', value: statusCounts.inactive, color: '#6b7280' },
    ].filter(item => item.value > 0);
    
    setChartData(data);
    
    // Create inner ring data based on subscription categories
    const categoryData: Record<string, number> = {};
    subscriptions.forEach(sub => {
      if (!categoryData[sub.category]) {
        categoryData[sub.category] = 0;
      }
      categoryData[sub.category]++;
    });
    
    // Color palette for categories
    const categoryColors = [
      '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
      '#8b5cf6', '#ec4899', '#6366f1', '#f97316'
    ];
    
    // Create inner ring data array with colors
    const innerData = Object.entries(categoryData)
      .map(([category, count], index) => ({
        name: category,
        value: count,
        color: categoryColors[index % categoryColors.length]
      }))
      .filter(item => item.value > 0);
    
    setInnerRingData(innerData);
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
        
        <div className="h-[280px] mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              {/* Inner ring - categories */}
              <Pie
                data={innerRingData}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={60}
                fill="#8884d8"
                paddingAngle={1}
                dataKey="value"
              >
                {innerRingData.map((entry, index) => (
                  <Cell key={`cell-inner-${index}`} fill={entry.color} />
                ))}
              </Pie>
              
              {/* Outer ring - subscription status */}
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                innerRadius={70}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-outer-${index}`} fill={entry.color} strokeWidth={2} stroke="#fff" />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value: number, name: string) => {
                  return [`${value} (${Math.round((value / total) * 100)}%)`, name];
                }}
                contentStyle={{ 
                  backgroundColor: 'var(--background)', 
                  border: '1px solid var(--border)' 
                }}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ paddingTop: '20px' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-xs text-center text-muted-foreground mt-2">
            <span>Inner ring: Categories | Outer ring: Subscription Status</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusDistribution;
