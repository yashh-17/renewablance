
import { 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  DollarSign, 
  Info,
  PlusCircle,
  XCircle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert } from './types';
import { getAlertBackground } from './alertUtils';

interface AlertItemProps {
  alert: Alert;
  onDismiss: (alertId: string) => void;
  onAction: (alert: Alert) => void;
}

const AlertItem = ({ alert, onDismiss, onAction }: AlertItemProps) => {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'renewal':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'spending':
        return <DollarSign className="h-5 w-5 text-red-500" />;
      case 'newSubscription':
        return <PlusCircle className="h-5 w-5 text-green-500" />;
      case 'missedPayment':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-brand-500" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return `${hours} hr${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffMins / 1440);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };

  return (
    <div 
      className={`p-3 rounded-lg hover:bg-muted/30 transition-colors relative ${getAlertBackground(alert.type)}`}
    >
      <div className="absolute top-2 right-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600 rounded-full"
          onClick={() => onDismiss(alert.id)}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      
      <div className="flex items-start pr-6">
        <div className="mt-0.5 mr-3">
          {getAlertIcon(alert.type)}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium">{alert.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-muted-foreground">
              {formatTime(alert.date)}
            </span>
            {alert.action && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs h-7 rounded-full"
                onClick={() => onAction(alert)}
              >
                {alert.actionLabel || 'View'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertItem;
