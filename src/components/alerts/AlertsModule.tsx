import { useState, useEffect, useCallback } from 'react';
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
  Info,
  AlertOctagon,
  PlusCircle,
  XCircle 
} from 'lucide-react';
import { Subscription } from '@/types/subscription';
import { getSubscriptions, getSubscriptionsDueForRenewal } from '@/services/subscriptionService';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  type: 'info' | 'warning' | 'success' | 'renewal' | 'spending' | 'newSubscription' | 'missedPayment';
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
  const { toast: uiToast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [lastData, setLastData] = useState<{
    totalSpend: number;
    count: number;
    subscriptionIds: string[];
    checkedRenewalsDates: Record<string, boolean>;
  }>({ 
    totalSpend: 0, 
    count: 0, 
    subscriptionIds: [],
    checkedRenewalsDates: {} 
  });

  const generateAlerts = useCallback((currentSubscriptions: Subscription[], forceRegenerate = false) => {
    const now = new Date();
    const newAlerts: Alert[] = [];
    
    const upcomingRenewals = getSubscriptionsDueForRenewal(30);
    
    upcomingRenewals.forEach(sub => {
      const renewalDate = new Date(sub.nextBillingDate);
      const daysToRenewal = Math.ceil(
        (renewalDate.getTime() - now.getTime()) / 
        (1000 * 60 * 60 * 24)
      );
      
      const alertId = `renewal-${sub.id}-${daysToRenewal}-${renewalDate.toISOString()}`;
      
      const checkedKey = `${sub.id}-${renewalDate.toISOString()}`;
      
      if (forceRegenerate || !lastData.checkedRenewalsDates[checkedKey]) {
        if (daysToRenewal <= 3 || daysToRenewal === 7 || daysToRenewal === 14 || daysToRenewal === 30) {
          let urgency = '';
          if (daysToRenewal <= 3) urgency = 'Urgent: ';
          else if (daysToRenewal <= 7) urgency = 'Soon: ';
          
          newAlerts.push({
            id: alertId,
            type: 'renewal',
            title: `${urgency}${sub.name} renewal reminder`,
            message: `Your subscription to ${sub.name} will renew in ${daysToRenewal} day${daysToRenewal !== 1 ? 's' : ''}. The charge will be ₹${sub.price.toFixed(2)}.`,
            date: now,
            read: false,
            action: () => onEditSubscription && onEditSubscription(sub),
            actionLabel: 'View Details'
          });
          
          if (daysToRenewal <= 3 && !lastData.checkedRenewalsDates[checkedKey]) {
            uiToast({
              title: `${sub.name} renewal reminder`,
              description: `Your subscription will renew in ${daysToRenewal} day${daysToRenewal !== 1 ? 's' : ''}.`,
              variant: "default"
            });
          }
        }
      }
    });
    
    const checkedRenewalsDates = { ...lastData.checkedRenewalsDates };
    upcomingRenewals.forEach(sub => {
      const renewalDate = new Date(sub.nextBillingDate);
      checkedRenewalsDates[`${sub.id}-${renewalDate.toISOString()}`] = true;
    });
    
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
    
    const currentIds = currentSubscriptions.map(sub => sub.id);
    
    if (lastData.totalSpend > 0 && (forceRegenerate || totalMonthlySpend !== lastData.totalSpend)) {
      const spendingIncrease = totalMonthlySpend - lastData.totalSpend;
      const percentIncrease = (spendingIncrease / lastData.totalSpend) * 100;
      
      if (spendingIncrease > 0 && percentIncrease > 15) {
        newAlerts.push({
          id: `spending-${now.getTime()}`,
          type: 'spending',
          title: 'Unusual spending increase detected',
          message: `Your monthly subscription spending has increased by ${percentIncrease.toFixed(0)}% (₹${spendingIncrease.toFixed(2)}) compared to your previous total.`,
          date: now,
          read: false,
          action: () => {
            if (onEditSubscription) {
              const mostExpensive = currentSubscriptions
                .filter(sub => !lastData.subscriptionIds.includes(sub.id))
                .sort((a, b) => b.price - a.price)[0];
              
              if (mostExpensive) {
                onEditSubscription(mostExpensive);
              }
            }
          },
          actionLabel: 'Review Expenses'
        });
      } else if (spendingIncrease < 0 && Math.abs(percentIncrease) > 15) {
        newAlerts.push({
          id: `spending-decrease-${now.getTime()}`,
          type: 'info',
          title: 'Significant spending decrease',
          message: `Your monthly subscription spending has decreased by ${Math.abs(percentIncrease).toFixed(0)}% (₹${Math.abs(spendingIncrease).toFixed(2)}).`,
          date: now,
          read: false
        });
      }
    }
    
    if (lastData.subscriptionIds.length > 0) {
      const newSubIds = currentIds.filter(id => !lastData.subscriptionIds.includes(id));
      
      if (newSubIds.length > 0) {
        const newSubscriptions = currentSubscriptions.filter(sub => newSubIds.includes(sub.id));
        
        newSubscriptions.forEach(newSub => {
          newAlerts.push({
            id: `new-sub-${newSub.id}-${now.getTime()}`,
            type: 'newSubscription',
            title: 'New subscription added',
            message: `You've added a new subscription: ${newSub.name} (₹${newSub.price.toFixed(2)}/${newSub.billingCycle}).`,
            date: now,
            read: false,
            action: () => onEditSubscription && onEditSubscription(newSub),
            actionLabel: 'View Details'
          });
          
          const renewalDate = new Date(newSub.nextBillingDate);
          const daysToRenewal = Math.ceil(
            (renewalDate.getTime() - now.getTime()) / 
            (1000 * 60 * 60 * 24)
          );
          
          if (daysToRenewal <= 30) {
            let urgency = '';
            if (daysToRenewal <= 3) urgency = 'Urgent: ';
            else if (daysToRenewal <= 7) urgency = 'Soon: ';
            
            newAlerts.push({
              id: `renewal-new-${newSub.id}-${daysToRenewal}-${now.getTime()}`,
              type: 'renewal',
              title: `${urgency}${newSub.name} renewal reminder (new subscription)`,
              message: `Your new subscription to ${newSub.name} will renew in ${daysToRenewal} day${daysToRenewal !== 1 ? 's' : ''}. The charge will be ₹${newSub.price.toFixed(2)}.`,
              date: now,
              read: false,
              action: () => onEditSubscription && onEditSubscription(newSub),
              actionLabel: 'View Details'
            });
            
            if (daysToRenewal <= 3) {
              uiToast({
                title: `${newSub.name} renewal reminder`,
                description: `Your new subscription will renew in ${daysToRenewal} day${daysToRenewal !== 1 ? 's' : ''}.`,
                variant: "default"
              });
            }
          }
        });
      }
    }
    
    const potentialMissedPayments = currentSubscriptions.filter(sub => {
      if (sub.status !== 'active') return false;
      
      const nextBillingDate = new Date(sub.nextBillingDate);
      return nextBillingDate < now && (now.getTime() - nextBillingDate.getTime()) < (7 * 24 * 60 * 60 * 1000);
    });
    
    if (potentialMissedPayments.length > 0) {
      potentialMissedPayments.forEach(sub => {
        const daysMissed = Math.floor((now.getTime() - new Date(sub.nextBillingDate).getTime()) / (24 * 60 * 60 * 1000));
        
        newAlerts.push({
          id: `missed-payment-${sub.id}-${now.getTime()}`,
          type: 'missedPayment',
          title: 'Possible missed payment',
          message: `Your ${sub.name} subscription payment was due ${daysMissed} day${daysMissed !== 1 ? 's' : ''} ago. Please check your payment method.`,
          date: now,
          read: false,
          action: () => onEditSubscription && onEditSubscription(sub),
          actionLabel: 'Review Subscription'
        });
      });
    }
    
    setLastData({
      totalSpend: currentSubscriptions.reduce((total, sub) => {
        if (sub.status !== 'active' && sub.status !== 'trial') return total;
        
        if (sub.billingCycle === "monthly") {
          return total + sub.price;
        } else if (sub.billingCycle === "yearly") {
          return total + (sub.price / 12);
        } else if (sub.billingCycle === "weekly") {
          return total + (sub.price * 4.33);
        }
        return total;
      }, 0),
      count: currentSubscriptions.length,
      subscriptionIds: currentSubscriptions.map(sub => sub.id),
      checkedRenewalsDates: checkedRenewalsDates
    });
    
    setAlerts(prevAlerts => {
      const oldAlerts = prevAlerts.filter(alert => 
        !alert.read && 
        !newAlerts.some(newAlert => newAlert.id === alert.id)
      );
      
      return [...newAlerts, ...oldAlerts].sort((a, b) => 
        b.date.getTime() - a.date.getTime()
      );
    });
  }, [onEditSubscription, lastData, uiToast]);

  const loadData = useCallback(() => {
    console.log('Loading subscription data for alerts');
    const currentSubscriptions = getSubscriptions();
    setSubscriptions(currentSubscriptions);
    generateAlerts(currentSubscriptions, false);
  }, [generateAlerts]);

  const forceRefresh = useCallback(() => {
    console.log('Force refreshing alerts');
    const currentSubscriptions = getSubscriptions();
    setSubscriptions(currentSubscriptions);
    generateAlerts(currentSubscriptions, true);
  }, [generateAlerts]);

  useEffect(() => {
    forceRefresh();
    
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key && event.key.includes('subscriptions_')) {
        forceRefresh();
      }
    };
    
    const handleCustomEvent = () => {
      forceRefresh();
    };
    
    const handleRenewalDetected = () => {
      forceRefresh();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('subscription-updated', handleCustomEvent);
    window.addEventListener('renewal-detected', handleRenewalDetected);
    
    const intervalId = setInterval(loadData, 10000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('subscription-updated', handleCustomEvent);
      window.removeEventListener('renewal-detected', handleRenewalDetected);
      clearInterval(intervalId);
    };
  }, [loadData, forceRefresh]);

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

  const getAlertBackground = (type: string) => {
    switch (type) {
      case 'warning':
        return 'bg-warning-50 border-l-2 border-l-warning-500';
      case 'success':
        return 'bg-success-50 border-l-2 border-l-success-500';
      case 'renewal':
        return 'bg-blue-50 border-l-2 border-l-blue-500';
      case 'spending':
        return 'bg-red-50 border-l-2 border-l-red-500';
      case 'missedPayment':
        return 'bg-red-50 border-l-2 border-l-red-500';
      case 'newSubscription':
        return 'bg-green-50 border-l-2 border-l-green-500';
      case 'info':
      default:
        return 'bg-muted/30 border-l-2 border-l-brand-500';
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
            Alerts & Notifications Center
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
      <CardContent className="max-h-[400px] overflow-y-auto">
        {alerts.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No alerts at this time</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alerts.filter(alert => !alert.read).map(alert => (
              <div 
                key={alert.id} 
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
