
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import AlertsModule from '@/components/alerts/AlertsModule';
import RenewalTimeline from '@/components/subscription/RenewalTimeline';
import DashboardStats from '@/components/dashboard/DashboardStats';
import SubscriptionList from '@/components/subscription/SubscriptionList';
import RecommendationsSection from './RecommendationsSection';
import RecentSubscriptions from './RecentSubscriptions'; // Add this import
import { Subscription } from '@/types/subscription';
import { IndianRupee } from 'lucide-react';

interface DashboardOverviewProps {
  subscriptions: Subscription[];
  recommendations: any[];
  monthlyBudget: number | null;
  totalMonthlySpend: number;
  handleEditSubscription: (subscription: Subscription) => void;
  handleRecommendationAction: (rec: any) => void;
  onViewAllClick: () => void;
}

const DashboardOverview = ({
  subscriptions,
  recommendations,
  monthlyBudget,
  totalMonthlySpend,
  handleEditSubscription,
  handleRecommendationAction,
  onViewAllClick
}: DashboardOverviewProps) => {
  return (
    <div className="space-y-8">
      {monthlyBudget !== null && totalMonthlySpend > 0 && (
        <Alert className={totalMonthlySpend > monthlyBudget ? "border-destructive" : "border-success-500"}>
          <div className="flex items-center">
            <IndianRupee className="h-4 w-4 mr-2" />
            <AlertTitle>Monthly Budget: ₹{monthlyBudget.toFixed(2)}</AlertTitle>
          </div>
          <AlertDescription>
            Current monthly spending: ₹{totalMonthlySpend.toFixed(2)} 
            {totalMonthlySpend > monthlyBudget ? (
              <span className="text-destructive ml-1">
                (₹{(totalMonthlySpend - monthlyBudget).toFixed(2)} over budget)
              </span>
            ) : (
              <span className="text-success-500 ml-1">
                (₹{(monthlyBudget - totalMonthlySpend).toFixed(2)} under budget)
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <AlertsModule onEditSubscription={handleEditSubscription} />
        </div>
        <div>
          <RenewalTimeline onEditSubscription={handleEditSubscription} />
        </div>
      </div>
      
      <DashboardStats subscriptions={subscriptions} />
      
      {recommendations.length > 0 && (
        <RecommendationsSection 
          recommendations={recommendations} 
          onRecommendationAction={handleRecommendationAction} 
        />
      )}
      
      <RecentSubscriptions 
        subscriptions={subscriptions.slice(0, 3)} 
        onEdit={handleEditSubscription} 
        onDelete={() => {}} 
        onViewAllClick={onViewAllClick}
      />
    </div>
  );
};

export default DashboardOverview;
