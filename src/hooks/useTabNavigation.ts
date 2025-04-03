
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";

export const useTabNavigation = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (activeTab !== 'subscriptions') {
      setActiveTab('subscriptions');
      toast({
        title: "Search Results",
        description: "Switched to Subscriptions tab to show search results",
      });
    }
  };
  
  const handleRecommendationAction = (rec: any) => {
    switch (rec.type) {
      case 'underutilized':
        return { action: 'edit', subscriptionId: rec.subscriptionId };
      case 'duplicate':
        setActiveTab('subscriptions');
        toast({
          title: "Category Focus",
          description: `Switched to Subscriptions tab to review your ${rec.category} subscriptions`,
        });
        return { action: 'none' };
      case 'budget':
        setActiveTab('analytics');
        toast({
          title: "Budget Analysis",
          description: 'Switched to Analytics tab to review your spending',
        });
        return { action: 'none' };
      default:
        return { action: 'none' };
    }
  };

  return {
    activeTab,
    setActiveTab,
    searchTerm,
    handleSearch,
    handleRecommendationAction
  };
};
