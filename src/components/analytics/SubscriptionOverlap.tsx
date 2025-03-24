
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Subscription } from '@/types/subscription';
import { CircleDollarSign } from 'lucide-react';

interface SubscriptionOverlapProps {
  subscriptions: Subscription[];
}

interface CategoryGroup {
  name: string;
  services: Subscription[];
  totalCost: number;
}

const SubscriptionOverlap: React.FC<SubscriptionOverlapProps> = ({ subscriptions }) => {
  const [overlappingGroups, setOverlappingGroups] = useState<CategoryGroup[]>([]);
  
  useEffect(() => {
    findOverlappingSubscriptions();
  }, [subscriptions]);

  const findOverlappingSubscriptions = () => {
    // Group subscriptions by category
    const categoryMap: Record<string, Subscription[]> = {};
    
    subscriptions.forEach(subscription => {
      if (subscription.status !== 'active' && subscription.status !== 'trial') return;
      
      if (!categoryMap[subscription.category]) {
        categoryMap[subscription.category] = [];
      }
      
      categoryMap[subscription.category].push(subscription);
    });
    
    // Find categories with multiple subscriptions
    const overlapping: CategoryGroup[] = [];
    
    Object.entries(categoryMap).forEach(([category, subs]) => {
      if (subs.length > 1) {
        // Calculate total monthly cost
        const totalCost = subs.reduce((sum, sub) => {
          if (sub.billingCycle === 'monthly') {
            return sum + sub.price;
          } else if (sub.billingCycle === 'yearly') {
            return sum + (sub.price / 12);
          } else if (sub.billingCycle === 'weekly') {
            return sum + (sub.price * 4.33);
          }
          return sum;
        }, 0);
        
        overlapping.push({
          name: category,
          services: subs,
          totalCost
        });
      }
    });
    
    // Sort by number of services and then by total cost
    overlapping.sort((a, b) => {
      if (b.services.length !== a.services.length) {
        return b.services.length - a.services.length;
      }
      return b.totalCost - a.totalCost;
    });
    
    setOverlappingGroups(overlapping);
  };

  // Generate a size for the circle based on total cost
  const getCircleSize = (totalCost: number) => {
    const minSize = 120;
    const maxSize = 200;
    const maxCost = Math.max(...overlappingGroups.map(g => g.totalCost), 1000);
    
    const size = minSize + ((totalCost / maxCost) * (maxSize - minSize));
    return Math.max(Math.min(size, maxSize), minSize);
  };

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <CircleDollarSign className="h-5 w-5 mr-2 text-brand-500" />
          Subscription Overlap & Duplication
        </CardTitle>
        <CardDescription>
          Detect overlapping services in the same category
        </CardDescription>
      </CardHeader>
      <CardContent>
        {overlappingGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[300px] text-center">
            <p className="text-muted-foreground mb-2">No overlapping subscriptions found</p>
            <p className="text-sm text-muted-foreground">
              You don't have multiple subscriptions in the same category
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-6 py-4">
            {overlappingGroups.map((group, index) => {
              const size = getCircleSize(group.totalCost);
              
              return (
                <div 
                  key={index} 
                  className="relative flex flex-col items-center"
                >
                  <div 
                    className="rounded-full flex items-center justify-center mb-4 relative"
                    style={{ 
                      width: `${size}px`, 
                      height: `${size}px`,
                      background: 'radial-gradient(circle, rgba(249,250,251,1) 0%, rgba(209,213,219,0.3) 100%)',
                      border: '1px dashed #d1d5db'
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <p className="font-semibold text-sm mb-1">{group.name}</p>
                        <p className="text-xs text-muted-foreground">{group.services.length} services</p>
                        <p className="text-xs font-medium">Rs.{group.totalCost.toFixed(2)}/mo</p>
                      </div>
                    </div>
                    
                    {/* Service icons distributed around the circle */}
                    {group.services.map((service, i) => {
                      const angle = (i * (360 / group.services.length)) * (Math.PI / 180);
                      const radius = size / 2 - 20;
                      const left = radius * Math.cos(angle) + (size / 2);
                      const top = radius * Math.sin(angle) + (size / 2);
                      
                      return (
                        <div 
                          key={service.id}
                          className={`absolute flex items-center justify-center w-10 h-10 rounded-full text-white font-bold shadow-md ${service.iconBg || 'bg-blue-500'}`}
                          style={{
                            left: `${left - 20}px`,
                            top: `${top - 20}px`,
                          }}
                          title={`${service.name} - Rs.${service.price} ${service.billingCycle}`}
                        >
                          {service.icon || service.name.charAt(0)}
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Services list */}
                  <div className="text-sm w-full max-w-[200px]">
                    <p className="font-medium text-center mb-2">Potential overlap:</p>
                    <ul className="space-y-1.5">
                      {group.services.map(service => (
                        <li key={service.id} className="flex justify-between items-center">
                          <span className="truncate">{service.name}</span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            Rs.{service.price}
                            /{service.billingCycle.slice(0, 2)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Recommendation */}
        {overlappingGroups.length > 0 && (
          <div className="mt-6 bg-amber-50 p-3 rounded-md text-sm">
            <p className="font-medium text-amber-800">Potential savings opportunity</p>
            <p className="text-amber-700 mt-1">
              You have {overlappingGroups.length} categor{overlappingGroups.length === 1 ? 'y' : 'ies'} with multiple subscriptions. 
              Consider consolidating these services to reduce costs.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionOverlap;
