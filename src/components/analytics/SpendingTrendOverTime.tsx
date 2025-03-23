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
import { TrendingUp, Maximize2 } from 'lucide-react';
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
          <p className="text-sm">₹{parseFloat(payload[0].value).toFixed(2)}</p>
        </div>
      );
    }
    
    return null;
  };

  const openFullScreenChart = () => {
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Spending Trend - Full View</title>
            <style>
              body {
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: #f8f9fa;
              }
              .container {
                background-color: white;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                padding: 20px;
                max-width: 1200px;
                margin: 0 auto;
              }
              h1 {
                font-size: 24px;
                margin-bottom: 20px;
                color: #333;
              }
              .peak-info {
                margin-top: 15px;
                font-size: 14px;
                color: #666;
                display: flex;
                align-items: center;
              }
              .peak-dot {
                width: 12px;
                height: 12px;
                background-color: #ef4444;
                border-radius: 50%;
                display: inline-block;
                margin-right: 8px;
              }
            </style>
            <script src="https://unpkg.com/recharts/umd/Recharts.min.js"></script>
          </head>
          <body>
            <div class="container">
              <h1>Spending Trend Over Time</h1>
              <div id="chart" style="width: 100%; height: 500px;"></div>
              ${peakPoint ? `
                <div class="peak-info">
                  <span class="peak-dot"></span>
                  <span>Peak spending (${peakPoint.month}): ₹${peakPoint.spending.toFixed(2)}</span>
                </div>
              ` : ''}
            </div>

            <script>
              const chartData = ${JSON.stringify(chartData)};
              const peakPoint = ${JSON.stringify(peakPoint)};
              
              const { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceDot } = Recharts;
              
              const renderChart = () => {
                const chartContainer = document.getElementById('chart');
                
                if (chartContainer && window.Recharts) {
                  ReactDOM.render(
                    React.createElement(ResponsiveContainer, { width: '100%', height: '100%' },
                      React.createElement(LineChart, {
                        data: chartData,
                        margin: { top: 20, right: 50, left: 30, bottom: 80 }
                      }, [
                        React.createElement(CartesianGrid, { strokeDasharray: '3 3' }),
                        React.createElement(XAxis, { 
                          dataKey: 'month', 
                          angle: -45, 
                          textAnchor: 'end', 
                          height: 70, 
                          dy: 10 
                        }),
                        React.createElement(YAxis, { 
                          tickFormatter: (value) => `₹${value}` 
                        }),
                        React.createElement(Tooltip, { 
                          formatter: (value) => [`₹${value}`, 'Spending'],
                          labelFormatter: (label) => `Month: ${label}`
                        }),
                        React.createElement(Legend),
                        React.createElement(Line, { 
                          type: 'monotone', 
                          dataKey: 'spending', 
                          name: 'Monthly Spending',
                          stroke: '#3b82f6',
                          strokeWidth: 2,
                          dot: { r: 4, fill: '#3b82f6' },
                          activeDot: { r: 6 }
                        }),
                        peakPoint && React.createElement(ReferenceDot, {
                          x: peakPoint.month,
                          y: peakPoint.spending.toFixed(2),
                          r: 6,
                          fill: '#ef4444',
                          stroke: '#fff',
                          strokeWidth: 2,
                          isFront: true
                        })
                      ])
                    ),
                    chartContainer
                  );
                } else {
                  chartContainer.innerHTML = '<p>Chart library not loaded. Please try again later.</p>';
                }
              };
              
              if (typeof React === 'undefined' || typeof ReactDOM === 'undefined') {
                const reactScript = document.createElement('script');
                reactScript.src = 'https://unpkg.com/react@17/umd/react.production.min.js';
                document.head.appendChild(reactScript);
                
                const reactDOMScript = document.createElement('script');
                reactDOMScript.src = 'https://unpkg.com/react-dom@17/umd/react-dom.production.min.js';
                reactDOMScript.onload = renderChart;
                document.head.appendChild(reactDOMScript);
              } else {
                renderChart();
              }
            </script>
          </body>
        </html>
      `);
      newWindow.document.close();
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-brand-500" />
            Spending Trend Over Time
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={openFullScreenChart} 
            className="h-8 w-8" 
            title="Open in full screen"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
        </CardTitle>
        <CardDescription>
          Visualize your subscription spending over the last 12 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="w-full h-[350px] md:h-[400px] relative cursor-pointer" onClick={openFullScreenChart}>
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
                tickFormatter={(value) => `₹${value}`}
                width={70}
              />
              <Tooltip 
                formatter={(value) => [`₹${value}`, 'Spending']}
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
