
import { useState } from 'react';
import { toast } from 'sonner';

export const useTabNavigation = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (activeTab !== 'subscriptions') {
      setActiveTab('subscriptions');
      toast.info('Switched to Subscriptions tab to show search results');
    }
  };
  
  const handleRecommendationAction = (rec: any) => {
    switch (rec.type) {
      case 'underutilized':
        return { action: 'edit', subscriptionId: rec.subscriptionId };
      case 'duplicate':
        setActiveTab('subscriptions');
        toast.info(`Switched to Subscriptions tab to review your ${rec.category} subscriptions`);
        return { action: 'none' };
      case 'budget':
        setActiveTab('analytics');
        toast.info('Switched to Analytics tab to review your spending');
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
