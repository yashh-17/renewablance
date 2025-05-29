
import { Subscription } from '@/types/subscription';
import { Clock, AlertCircle, CheckCircle } from 'lucide-react';
import RenewalItem from './RenewalItem';

interface RenewalSectionProps {
  title: string;
  subscriptions: Subscription[];
  urgencyLevel: 'high' | 'medium' | 'low';
  forceUpdate: number;
  onEditSubscription?: (subscription: Subscription) => void;
}

const RenewalSection: React.FC<RenewalSectionProps> = ({
  title,
  subscriptions,
  urgencyLevel,
  forceUpdate,
  onEditSubscription
}) => {
  if (subscriptions.length === 0) return null;

  const getIcon = () => {
    switch (urgencyLevel) {
      case 'high':
        return <AlertCircle className="h-4 w-4 mr-1 text-destructive" />;
      case 'medium':
        return <Clock className="h-4 w-4 mr-1 text-warning-500" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 mr-1 text-muted-foreground" />;
    }
  };

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-muted-foreground flex items-center mb-2">
        {getIcon()}
        {title}
      </h3>
      <div className="space-y-2">
        {subscriptions.map(sub => (
          <RenewalItem
            key={sub.id}
            subscription={sub}
            forceUpdate={forceUpdate}
            onEditSubscription={onEditSubscription}
          />
        ))}
      </div>
    </div>
  );
};

export default RenewalSection;
