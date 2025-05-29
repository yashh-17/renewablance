
import { Subscription } from '@/types/subscription';
import { Button } from '@/components/ui/button';
import { calculateDaysBetween, formatDate, formatPrice } from './utils/renewalUtils';

interface RenewalItemProps {
  subscription: Subscription;
  forceUpdate: number;
  onEditSubscription?: (subscription: Subscription) => void;
}

const RenewalItem: React.FC<RenewalItemProps> = ({ 
  subscription, 
  forceUpdate, 
  onEditSubscription 
}) => {
  const now = new Date();
  const renewalDate = new Date(subscription.nextBillingDate);
  const daysToRenewal = calculateDaysBetween(now, renewalDate);
  const isPastDue = renewalDate < now;
  const dayText = isPastDue ? "Renewal due today" : `${daysToRenewal} day${daysToRenewal !== 1 ? 's' : ''} left`;

  return (
    <div 
      key={`${subscription.id}-${forceUpdate}`} 
      className="flex items-center justify-between p-2 bg-muted/30 rounded-md hover:bg-muted/50 transition-colors"
    >
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${subscription.iconBg || 'bg-brand-600'} mr-3`}>
          {subscription.icon || subscription.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-medium text-sm">{subscription.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatDate(subscription.nextBillingDate)} • {formatPrice(subscription.price, subscription.billingCycle)} 
            <span className="ml-1 font-semibold">
              ({dayText})
            </span>
          </p>
        </div>
      </div>
      
      {onEditSubscription && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onEditSubscription(subscription)}
          className="text-xs px-2"
        >
          Edit
        </Button>
      )}
    </div>
  );
};

export default RenewalItem;
