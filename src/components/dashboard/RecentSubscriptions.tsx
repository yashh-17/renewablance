
import { Button } from "@/components/ui/button";
import SubscriptionList from '@/components/subscription/SubscriptionList';
import { Subscription } from "@/types/subscription";

interface RecentSubscriptionsProps {
  subscriptions: Subscription[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
  onViewAllClick: () => void;
}

const RecentSubscriptions = ({ 
  subscriptions,
  onEdit,
  onDelete,
  onViewAllClick
}: RecentSubscriptionsProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Subscriptions</h2>
        <Button 
          onClick={onViewAllClick}
          variant="outline"
          className="rounded-md"
        >
          View All
        </Button>
      </div>
      
      <SubscriptionList 
        subscriptions={subscriptions}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default RecentSubscriptions;
