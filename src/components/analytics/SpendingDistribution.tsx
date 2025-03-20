
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { PieChart, Pie, ResponsiveContainer, Cell } from "recharts";

interface CategoryData {
  name: string;
  monthly: number;
  count: number;
}

interface SpendingDistributionProps {
  categories: CategoryData[];
}

const COLORS = ["#8B5CF6", "#D946EF", "#F97316", "#0EA5E9", "#10B981", "#A855F7", "#EC4899"];

const SpendingDistribution: React.FC<SpendingDistributionProps> = ({ categories }) => {
  // Calculate total monthly spending
  const totalMonthly = categories.reduce((sum, category) => sum + category.monthly, 0);
  
  // Format data for the chart and calculate percentages
  const chartData = categories.map((category, index) => ({
    name: category.name,
    value: parseFloat(category.monthly.toFixed(2)),
    percentage: parseFloat(((category.monthly / totalMonthly) * 100).toFixed(1)),
    color: COLORS[index % COLORS.length]
  }));

  // Create the chart config with colors
  const chartConfig = chartData.reduce((config, item) => {
    config[item.name] = { 
      color: item.color,
      label: item.name
    };
    return config;
  }, {} as Record<string, { color: string, label: string }>);

  return (
    <Card className="h-[400px] hover:shadow-md transition-all duration-300">
      <CardHeader>
        <CardTitle>Spending Distribution</CardTitle>
        <CardDescription>
          Percentage of total monthly spending by category
        </CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ChartContainer 
          config={chartConfig}
          className="h-full"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                nameKey="name"
                label={({ percentage }) => `${percentage}%`}
                labelLine={false}
                animationDuration={1000}
                animationBegin={200}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value, name) => [`₹${value} (${chartData.find(d => d.name === name)?.percentage}%)`, name]}
                    nameKey="name"
                  />
                } 
              />
              <ChartLegend 
                content={<ChartLegendContent nameKey="name" />}
                verticalAlign="bottom"
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default SpendingDistribution;
