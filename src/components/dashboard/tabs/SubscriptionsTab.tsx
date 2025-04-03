
import SubscriptionList from '@/components/subscription/SubscriptionList';
import { Subscription } from '@/types/subscription';

interface SubscriptionsTabProps {
  subscriptions: Subscription[];
  searchTerm: string;
  onEdit: (subscription: Subscription) => void;
  onDelete: (id: string) => void;
}

const SubscriptionsTab = ({ 
  subscriptions,
  searchTerm,
  onEdit,
  onDelete
}: SubscriptionsTabProps) => {
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Subscriptions</h2>
      </div>
      
      <SubscriptionList 
        subscriptions={subscriptions}
        onEdit={onEdit}
        onDelete={onDelete}
        searchTerm={searchTerm}
      />
    </div>
  );
};

export default SubscriptionsTab;
