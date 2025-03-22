import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  DollarSign, 
  Info 
} from 'lucide-react';
import { Subscription } from '@/types/subscription';
import { getSubscriptions, getSubscriptionsDueForRenewal } from '@/services/subscriptionService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'success' | 'renewal';
  title: string;
  message: string;
  date: Date;
  read: boolean;
  action?: () => void;
  actionLabel?: string;
}

interface AlertsModuleProps {
  onEditSubscription?: (subscription: Subscription) => void;
}

const AlertsModule: React.FC<AlertsModuleProps> = ({ onEditSubscription }) => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [lastData, setLastData] = useState<{
    totalSpend: number;
    count: number;
  }>({ totalSpend: 0, count: 0 });

  const generateAlerts = (currentSubscriptions: Subscription[], forceRegenerate = false) => {
    const now = new Date();
    const newAlerts: Alert[] = [];
    
    // 1. Renewal alerts - subscriptions due for renewal in the next 3 days
    const upcomingRenewals = getSubscriptionsDueForRenewal(3);
    
    upcomingRenewals.forEach(sub => {
      const daysToRenewal = Math.ceil(
        (new Date(sub.nextBillingDate).getTime() - now.getTime()) / 
        (1000 * 60 * 60 * 24)
      );
      
      newAlerts.push({
        id: `renewal-${sub.id}-${now.getTime()}`,
        type: 'renewal',
        title: `${sub.name} renewal reminder`,
        message: `Your subscription to ${sub.name} will renew in ${daysToRenewal} day${daysToRenewal !== 1 ? 's' : ''}. The charge will be ₹${sub.price.toFixed(2)}.`,
        date: now,
        read: false,
        action: () => onEditSubscription && onEditSubscription(sub),
        actionLabel: 'View Details'
      });
    });
    
    // 2. Calculate current metrics
    const totalMonthlySpend = currentSubscriptions.reduce((total, sub) => {
      if (sub.status !== 'active' && sub.status !== 'trial') return total;
      
      if (sub.billingCycle === "monthly") {
        return total + sub.price;
      } else if (sub.billingCycle === "yearly") {
        return total + (sub.price / 12);
      } else if (sub.billingCycle === "weekly") {
        return total + (sub.price * 4.33);
      }
      return total;
    }, 0);
    
    // 3. Check for unusual activity (significant spending increase)
    if (lastData.totalSpend > 0 && forceRegenerate) {
      const spendingIncrease = totalMonthlySpend - lastData.totalSpend;
      const percentIncrease = (spendingIncrease / lastData.totalSpend) * 100;
      
      if (spendingIncrease > 0 && percentIncrease > 20) {
        newAlerts.push({
          id: `spending-${now.getTime()}`,
          type: 'warning',
          title: 'Unusual spending increase detected',
          message: `Your monthly subscription spending has increased by ${percentIncrease.toFixed(0)}% (₹${spendingIncrease.toFixed(2)}) compared to your previous total.`,
          date: now,
          read: false
        });
      }
    }
    
    // 4. Check for new subscriptions
    if (lastData.count > 0 && currentSubscriptions.length > lastData.count && forceRegenerate) {
      const newSubsCount = currentSubscriptions.length - lastData.count;
      
      newAlerts.push({
        id: `new-subs-${now.getTime()}`,
        type: 'info',
        title: 'New subscription(s) added',
        message: `You've added ${newSubsCount} new subscription${newSubsCount !== 1 ? 's' : ''} to your account.`,
        date: now,
        read: false
      });
    }
    
    // Update last data
    setLastData({
      totalSpend: totalMonthlySpend,
      count: currentSubscriptions.length
    });
    
    // Merge with existing unread alerts 
    setAlerts(prevAlerts => {
      // Keep unread alerts that are not duplicates
      const oldAlerts = prevAlerts.filter(alert => 
        !alert.read && 
        !newAlerts.some(newAlert => 
          newAlert.title === alert.title && 
          newAlert.message === alert.message
        )
      );
      
      return [...newAlerts, ...oldAlerts].sort((a, b) => 
        b.date.getTime() - a.date.getTime()
      );
    });
  };

  useEffect(() => {
    const loadData = () => {
      const currentSubscriptions = getSubscriptions();
      setSubscriptions(currentSubscriptions);
      generateAlerts(currentSubscriptions, subscriptions.length > 0);
    };
    
    loadData();
    
    // Listen for subscription updates
    const handleStorageChange = () => {
      loadData();
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const markAsRead = (alertId: string) => {
    setAlerts(prevAlerts => prevAlerts.map(alert => 
      alert.id === alertId ? { ...alert, read: true } : alert
    ));
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-warning-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-success-500" />;
      case 'renewal':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'info':
      default:
        return <Info className="h-5 w-5 text-brand-500" />;
    }
  };

  const handleAction = (alert: Alert) => {
    if (alert.action) {
      alert.action();
    }
    markAsRead(alert.id);
  };

  const unreadAlertsCount = alerts.filter(alert => !alert.read).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <Bell className="h-5 w-5 mr-2 text-brand-500" />
            Alerts & Notifications
          </CardTitle>
          {unreadAlertsCount > 0 && (
            <span className="px-2 py-1 text-xs bg-brand-500 text-white rounded-full">
              {unreadAlertsCount} new
            </span>
          )}
        </div>
        <CardDescription>
          Stay informed about your subscription activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.filter(alert => !alert.read).map(alert => (
              <div 
                key={alert.id} 
                className="p-3 border rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
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
                          onClick={() => markAsRead(alert.id)}
                        >
                          Dismiss
                        </Button>
                        {alert.action && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="text-xs h-7"
                            onClick={() => handleAction(alert)}
                          >
                            {alert.actionLabel || 'View'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {unreadAlertsCount === 0 && (
              <div className="text-center py-4">
                <p className="text-muted-foreground">No new alerts</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AlertsModule;
