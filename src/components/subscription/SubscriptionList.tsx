
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, MoreVertical, Calendar } from "lucide-react";
import { Subscription } from "@/types/subscription";
import { toast } from "sonner";

interface SubscriptionListProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  searchTerm?: string;
}

const SubscriptionList: React.FC<SubscriptionListProps> = ({
  subscriptions,
  onEdit,
  onDelete,
  searchTerm = ""
}) => {
  const [activeTab, setActiveTab] = useState("all");
  
  const formatPrice = (price: number, billingCycle: string) => {
    return `₹${price.toFixed(2)}/${billingCycle.charAt(0)}`;
  };
  
  const formatNextBilling = (date: string) => {
    return new Date(date).toLocaleDateString();
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success-500";
      case "inactive":
        return "bg-gray-400";
      case "trial":
        return "bg-warning-500";
      default:
        return "bg-brand-500";
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the subscription to ${name}?`)) {
      onDelete(id);
      toast.success(`Subscription to ${name} has been deleted`);
    }
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    // First filter by tab
    const matchesTab = activeTab === "all" || sub.status === activeTab;
    
    // Then filter by search term if it exists
    const matchesSearch = searchTerm 
      ? sub.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        sub.category.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="trial">Trial</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          {renderSubscriptionList(filteredSubscriptions)}
        </TabsContent>
        
        <TabsContent value="active" className="mt-0">
          {renderSubscriptionList(filteredSubscriptions)}
        </TabsContent>
        
        <TabsContent value="trial" className="mt-0">
          {renderSubscriptionList(filteredSubscriptions)}
        </TabsContent>
        
        <TabsContent value="inactive" className="mt-0">
          {renderSubscriptionList(filteredSubscriptions)}
        </TabsContent>
      </Tabs>
    </div>
  );

  function renderSubscriptionList(subscriptions: Subscription[]) {
    if (subscriptions.length === 0) {
      return (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium text-gray-500">No subscriptions found</h3>
          <p className="text-sm text-gray-400 mt-1">
            {searchTerm 
              ? `No results for "${searchTerm}"`
              : activeTab === "all" 
                ? "Add a subscription to get started"
                : `No ${activeTab} subscriptions found`}
          </p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {subscriptions.map((subscription) => (
          <Card key={subscription.id} className="subscription-card rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-start justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${subscription.iconBg || 'bg-brand-600'}`}>
                        {subscription.icon || subscription.name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium">{subscription.name}</h3>
                      <p className="text-sm text-muted-foreground">{subscription.category}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(subscription.status)}`}></div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(subscription)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Edit</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDelete(subscription.id, subscription.name)} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                
                <div className="p-4 pt-0">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <Badge variant={subscription.status === 'active' ? 'default' : subscription.status === 'trial' ? 'secondary' : 'outline'} className="text-xs">
                        {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1)}
                      </Badge>
                    </div>
                    <span className="text-lg font-semibold">
                      {formatPrice(subscription.price, subscription.billingCycle)}
                    </span>
                  </div>
                  
                  <div className="mt-4 flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>Next billing: {formatNextBilling(subscription.nextBillingDate)}</span>
                  </div>
                  
                  {subscription.usageData !== undefined && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Usage</span>
                        <span>{subscription.usageData}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            subscription.usageData > 75 ? 'bg-success-500' : 
                            subscription.usageData > 30 ? 'bg-warning-500' : 'bg-brand-500'
                          }`} 
                          style={{ width: `${subscription.usageData}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
};

export default SubscriptionList;
