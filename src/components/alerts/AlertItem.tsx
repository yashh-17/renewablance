
import { 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  DollarSign, 
  Info,
  PlusCircle,
  XCircle 
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

  return (
    <div 
      className={`p-3 rounded-lg hover:bg-muted/50 transition-colors ${getAlertBackground(alert.type)}`}
    >
      <div className="flex items-start">
        <div className="mt-0.5 mr-3">
          {getAlertIcon(alert.type)}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium">{alert.title}</h4>
          <p className="text-xs text-muted-foreground mt-1">{alert.message}</p>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">
              {alert.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <div className="flex space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7"
                onClick={() => onDismiss(alert.id)}
              >
                Dismiss
              </Button>
              {alert.action && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-xs h-7"
                  onClick={() => onAction(alert)}
                >
                  {alert.actionLabel || 'View'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertItem;
