
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
import { TrendingUp, ExternalLink } from 'lucide-react';
import { format, subMonths, differenceInCalendarMonths } from 'date-fns';
import { Button } from '@/components/ui/button';

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

    for (let i = 11; i >= 0; i--) {
      const monthDate = subMonths(now, i);
      const monthKey = format(monthDate, 'MMM yyyy');
      
      const monthlyTotal = subs.reduce((total, sub) => {
        const startDate = sub.startDate ? new Date(sub.startDate) : new Date(sub.createdAt);
        
        if (startDate > monthDate) return total;
        
        const monthsAgo = differenceInCalendarMonths(now, monthDate);
        
        if (sub.status === 'inactive') {
          const wasActive = monthsAgo < 3 ? Math.random() > 0.7 : Math.random() > 0.3;
          if (!wasActive) return total;
        }
        
        if (sub.billingCycle === "monthly") {
          return total + sub.price;
        } else if (sub.billingCycle === "yearly") {
          return total + (sub.price / 12);
        } else if (sub.billingCycle === "weekly") {
          return total + (sub.price * 4.33);
        }
        return total;
      }, 0);
      
      monthlyData.push({
        month: monthKey,
        spending: monthlyTotal.toFixed(2)
      });
      
      if (monthlyTotal > highestSpending) {
        highestSpending = monthlyTotal;
        peakMonth = monthKey;
        peakIndex = 11 - i;
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

  const renderPeakTooltip = (props: any) => {
    const { active, payload } = props;
    
    if (active && payload && payload.length && peakPoint && 
        payload[0].payload.month === peakPoint.month) {
      return (
        <div className="px-3 py-2 bg-background border rounded-md shadow-md">
          <p className="font-medium text-sm">Peak Spending Month</p>
          <p className="text-sm">Rs.{parseFloat(payload[0].value).toFixed(2)}</p>
        </div>
      );
    }
    
    return null;
  };

  const openFullScreenChart = () => {
    const newWindow = window.open('', '_blank');
    if (!newWindow) {
      alert('Please allow pop-ups to view the full screen chart');
      return;
    }

    const chartHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Spending Trend - Full View</title>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <script src="https://cdn.tailwindcss.com"></script>
          <script src="https://unpkg.com/react@17/umd/react.production.min.js"></script>
          <script src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"></script>
          <script src="https://unpkg.com/recharts@2.1.9/umd/Recharts.min.js"></script>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              padding: 2rem;
              background-color: #f9fafb;
            }
            .chart-container {
              background-color: white;
              border-radius: 0.5rem;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              padding: 1.5rem;
              margin-bottom: 1rem;
              height: 80vh;
            }
            h1 {
              font-size: 1.5rem;
              font-weight: 600;
              margin-bottom: 1rem;
              color: #111827;
            }
            p {
              color: #6b7280;
              margin-bottom: 2rem;
            }
          </style>
        </head>
        <body>
          <div class="container mx-auto max-w-6xl">
            <h1 class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                <polyline points="17 6 23 6 23 12"></polyline>
              </svg>
              Spending Trend Over Time
            </h1>
            <p>Visualize your subscription spending over the last 12 months</p>
            <div class="chart-container">
              <div id="chart"></div>
            </div>
          </div>
          <script>
            const chartData = ${JSON.stringify(chartData)};
            const peakPoint = ${JSON.stringify(peakPoint)};
            
            const renderChart = () => {
              const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } = Recharts;
              
              return React.createElement(
                ResponsiveContainer,
                { width: '100%', height: '100%' },
                React.createElement(
                  LineChart,
                  {
                    data: chartData,
                    margin: { top: 20, right: 40, left: 20, bottom: 60 }
                  },
                  [
                    React.createElement(CartesianGrid, { strokeDasharray: '3 3', key: 'grid' }),
                    React.createElement(XAxis, { 
                      dataKey: 'month', 
                      tick: { fontSize: 12 },
                      angle: -45,
                      textAnchor: 'end',
                      height: 60,
                      dy: 10,
                      key: 'xaxis'
                    }),
                    React.createElement(YAxis, { 
                      tick: { fontSize: 12 },
                      tickFormatter: (value) => \`Rs.\${value}\`,
                      width: 70,
                      key: 'yaxis'
                    }),
                    React.createElement(Tooltip, { 
                      formatter: (value) => [\`Rs.\${value}\`, 'Spending'],
                      labelFormatter: (label) => \`Month: \${label}\`,
                      key: 'tooltip'
                    }),
                    React.createElement(Legend, { 
                      verticalAlign: 'top',
                      height: 36,
                      key: 'legend'
                    }),
                    React.createElement(Line, { 
                      type: 'monotone', 
                      dataKey: 'spending', 
                      name: 'Monthly Spending', 
                      stroke: '#3b82f6', 
                      strokeWidth: 2,
                      dot: { r: 4, fill: '#3b82f6' },
                      activeDot: { r: 6 },
                      key: 'line'
                    }),
                    peakPoint && React.createElement(ReferenceDot, { 
                      x: peakPoint.month, 
                      y: peakPoint.spending.toFixed(2), 
                      r: 6,
                      fill: '#ef4444',
                      stroke: '#fff',
                      strokeWidth: 2,
                      isFront: true,
                      key: 'peak'
                    })
                  ]
                )
              );
            };
            
            // Wait for the DOM to be ready and libraries to load
            window.onload = function() {
              if (typeof React !== 'undefined' && typeof ReactDOM !== 'undefined' && typeof Recharts !== 'undefined') {
                ReactDOM.render(renderChart(), document.getElementById('chart'));
              } else {
                document.getElementById('chart').innerHTML = '<div style="color: red; text-align: center; padding: 20px;">Error: Required libraries failed to load. Please try again.</div>';
              }
            };
          </script>
        </body>
      </html>
    `;

    newWindow.document.write(chartHtml);
    newWindow.document.close();
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-brand-500" />
            Spending Trend Over Time
          </CardTitle>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 px-2" 
            onClick={openFullScreenChart}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            <span className="text-xs">Full View</span>
          </Button>
        </div>
        <CardDescription>
          Visualize your subscription spending over the last 12 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div 
          className="w-full h-[350px] md:h-[400px] relative cursor-pointer" 
          onClick={openFullScreenChart}
        >
          <ResponsiveContainer width="99%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 20,
                right: 40,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
                dy={10}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `Rs.${value}`}
                width={70}
              />
              <Tooltip 
                formatter={(value) => [`Rs.${value}`, 'Spending']}
                labelFormatter={(label) => `Month: ${label}`}
                wrapperStyle={{ zIndex: 10 }}
                contentStyle={{ 
                  backgroundColor: 'var(--background)', 
                  border: '1px solid var(--border)' 
                }}
              />
              <Legend 
                verticalAlign="top"
                height={36}
                wrapperStyle={{
                  paddingTop: "10px",
                  paddingBottom: "10px"
                }}
              />
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
                <span>Peak spending ({peakPoint.month}): Rs.{peakPoint.spending.toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-center mt-4">
          <p className="text-xs text-muted-foreground">Click on the graph to view in full screen</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpendingTrendOverTime;
