
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface CategoryData {
  name: string;
  monthly: number;
  count: number;
}

interface TopSpendingCategoriesProps {
  categories: CategoryData[];
}

const TopSpendingCategories: React.FC<TopSpendingCategoriesProps> = ({ categories }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Spending Categories</CardTitle>
        <CardDescription>
          Categories with the highest monthly spending
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.slice(0, 4).map((category) => (
            <div key={category.name} className="space-y-1">
              <div className="text-lg font-semibold">{category.name}</div>
              <div className="text-2xl font-bold text-primary">
                ${category.monthly.toFixed(2)}/mo
              </div>
              <div className="text-sm text-muted-foreground">
                {category.count} subscription{category.count !== 1 ? 's' : ''}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TopSpendingCategories;
