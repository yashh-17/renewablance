
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
  // Generate a unique background color based on category name
  const getCategoryColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-green-500', 'bg-yellow-500', 
      'bg-red-500', 'bg-orange-500', 'bg-teal-500'
    ];
    
    // Simple hash function to get deterministic color
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };
  
  return (
    <Card className="rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>Top Spending Categories</CardTitle>
        <CardDescription>
          Categories with the highest monthly spending
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.slice(0, 4).map((category, index) => (
            <div 
              key={category.name} 
              className="space-y-1 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 animate-in fade-in slide-in-from-bottom-5"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-full ${getCategoryColor(category.name)} flex items-center justify-center text-white`}>
                  {category.name.charAt(0)}
                </div>
                <div className="text-lg font-semibold">{category.name}</div>
              </div>
              <div className="text-2xl font-bold text-primary">
                ₹{category.monthly.toFixed(2)}/mo
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
