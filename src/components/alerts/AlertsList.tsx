
import { Alert } from './types';
import AlertItem from './AlertItem';

interface AlertsListProps {
  alerts: Alert[];
  onDismiss: (alertId: string) => void;
  onAction: (alert: Alert) => void;
}

const AlertsList = ({ alerts, onDismiss, onAction }: AlertsListProps) => {
  const unreadAlertsCount = alerts.filter(alert => !alert.read).length;
  
  if (alerts.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No alerts at this time</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {alerts.map(alert => (
        <AlertItem 
          key={alert.id} 
          alert={alert} 
          onDismiss={onDismiss} 
          onAction={onAction} 
        />
      ))}
      
      {unreadAlertsCount === 0 && alerts.length > 0 && (
        <div className="text-center py-4">
          <p className="text-muted-foreground">No new alerts</p>
        </div>
      )}
    </div>
  );
};

export default AlertsList;
