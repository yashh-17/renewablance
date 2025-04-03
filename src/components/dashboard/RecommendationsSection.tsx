
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, ArrowRight } from 'lucide-react';

interface RecommendationsSectionProps {
  recommendations: any[];
  onRecommendationAction: (rec: any) => void;
}

const RecommendationsSection = ({ recommendations, onRecommendationAction }: RecommendationsSectionProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="border-l-4 border-l-warning-500 rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-warning-500" />
                {rec.type === 'underutilized' ? 'Low Usage Detected' : 
                 rec.type === 'duplicate' ? 'Duplicate Services' : 
                 'Budget Recommendation'}
              </CardTitle>
              <CardDescription>{rec.message.replace(/\$/g, '₹')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="p-2 h-auto font-normal text-brand-600 rounded-md hover:bg-brand-50 w-full justify-start"
                onClick={() => onRecommendationAction(rec)}
              >
                {rec.action} <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RecommendationsSection;
