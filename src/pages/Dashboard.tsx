
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import DashboardOverview from '@/components/dashboard/DashboardOverview';
import SubscriptionsTab from '@/components/dashboard/tabs/SubscriptionsTab';
import AnalyticsTab from '@/components/dashboard/tabs/AnalyticsTab';
import TopNavBar from '@/components/dashboard/TopNavBar';
import { useDashboardData } from '@/hooks/useDashboardData';
import { useTabNavigation } from '@/hooks/useTabNavigation';
import SubscriptionFormContainer from '@/components/subscription/SubscriptionFormContainer';
import { Subscription } from '@/types/subscription';

const Dashboard = () => {
  const {
    subscriptions,
    recommendations,
    monthlyBudget,
    totalMonthlySpend,
    handleSaveSubscription,
    handleDeleteSubscription,
  } = useDashboardData();

  const {
    activeTab,
    setActiveTab,
    searchTerm,
    handleSearch,
    handleRecommendationAction
  } = useTabNavigation();
  
  // Extract subscription form handling logic
  const formContainer = SubscriptionFormContainer({
    onSave: (subscription: Subscription) => {
      handleSaveSubscription(
        subscription,
        formContainer.selectedSubscription,
        formContainer.isTopBarEditMode
      );
      
      // If adding a new subscription, switch to overview tab
      const isNewSubscription = !formContainer.selectedSubscription && !formContainer.isTopBarEditMode;
      if (isNewSubscription && activeTab !== 'overview') {
        setActiveTab('overview');
      }
    },
    subscriptions
  });
  
  // Handle recommendation actions that require editing a subscription
  const handleRecommendation = (rec: any) => {
    const result = handleRecommendationAction(rec);
    if (result.action === 'edit' && result.subscriptionId) {
      const subscription = subscriptions.find(sub => sub.id === result.subscriptionId);
      if (subscription) {
        formContainer.handleEditSubscription(subscription);
      }
    }
  };

  return (
    <DashboardLayout>
      <TopNavBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddSubscription={formContainer.handleAddSubscription}
        onEditSubscription={formContainer.handleEditFromTopBar}
        onSearch={handleSearch}
      />
      
      <div className="mt-6">
        {activeTab === 'overview' && (
          <DashboardOverview
            subscriptions={subscriptions}
            recommendations={recommendations}
            monthlyBudget={monthlyBudget}
            totalMonthlySpend={totalMonthlySpend}
            handleEditSubscription={formContainer.handleEditSubscription}
            handleRecommendationAction={handleRecommendation}
            onViewAllClick={() => setActiveTab('subscriptions')}
          />
        )}
        
        {activeTab === 'analytics' && (
          <AnalyticsTab subscriptions={subscriptions} />
        )}
        
        {activeTab === 'subscriptions' && (
          <SubscriptionsTab
            subscriptions={subscriptions}
            searchTerm={searchTerm}
            onEdit={formContainer.handleEditSubscription}
            onDelete={handleDeleteSubscription}
          />
        )}
      </div>
      
      {formContainer.form}
    </DashboardLayout>
  );
};

export default Dashboard;
