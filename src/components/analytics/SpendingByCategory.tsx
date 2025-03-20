
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from "recharts";

interface CategoryData {
  name: string;
  monthly: number;
  count: number;
}

interface SpendingByCategoryProps {
  categories: CategoryData[];
}

const SpendingByCategory: React.FC<SpendingByCategoryProps> = ({ categories }) => {
  // Format data for the chart
  const chartData = categories.map(category => ({
    name: category.name,
    amount: parseFloat(category.monthly.toFixed(2))
  }));

  return (
    <Card className="h-[400px] hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle>Monthly Spending by Category</CardTitle>
        <CardDescription>
          Breakdown of your subscription expenses by category (monthly equivalent)
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer 
          config={{ amount: { theme: { light: "#8B5CF6", dark: "#8B5CF6" } } }}
          className="h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 30 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
              />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value) => [`₹${value}`, "Monthly Spending"]}
                  />
                } 
              />
              <Bar 
                dataKey="amount" 
                radius={[4, 4, 0, 0]} 
                name="Monthly Spending" 
                fill="var(--color-amount)"
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SpendingByCategory;
