
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus, IndianRupee, Pencil } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import BellNotification from '../alerts/BellNotification';
import { getSubscriptions, getSubscriptionsDueForRenewal } from '@/services/subscriptionService';
import { Subscription } from '@/types/subscription';

interface TopNavBarProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  onAddSubscription: () => void;
  onEditSubscription?: () => void;
  onSearch?: (searchTerm: string) => void;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ 
  activeTab, 
  onTabChange, 
  onAddSubscription,
  onEditSubscription,
  onSearch
}) => {
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [budget, setBudget] = useState<string>(() => {
    return localStorage.getItem('monthlyBudget') || '';
  });
  const [unreadAlertsCount, setUnreadAlertsCount] = useState(0);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();

  const checkForAlerts = useCallback(() => {
    try {
      const subs = getSubscriptions();
      const upcomingRenewals = getSubscriptionsDueForRenewal(7);
      console.log("TopNavBar found upcoming renewals:", upcomingRenewals.length);
      
      setUnreadAlertsCount(upcomingRenewals.length);
    } catch (error) {
      console.error('Error checking for alerts:', error);
      setUnreadAlertsCount(0);
    }
  }, []);

  const debouncedCheckForAlerts = useCallback(() => {
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = setTimeout(checkForAlerts, 300);
  }, [checkForAlerts]);

  useEffect(() => {
    checkForAlerts();
    
    const handleSubscriptionEvent = () => {
      debouncedCheckForAlerts();
    };
    
    const handleAlertsCountUpdate = (event: CustomEvent) => {
      if (event.detail?.count !== undefined) {
        console.log('Received alerts count update:', event.detail.count);
        setUnreadAlertsCount(event.detail.count);
      }
    };
    
    const events = [
      'subscription-updated',
      'renewal-detected', 
      'new-subscription-added'
    ];
    
    events.forEach(event => {
      window.addEventListener(event, handleSubscriptionEvent);
    });
    
    window.addEventListener('alerts-count-updated', handleAlertsCountUpdate as EventListener);
    
    // Periodic check with longer interval to prevent excessive calls
    const intervalId = setInterval(checkForAlerts, 60000); // Check every minute
    
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleSubscriptionEvent);
      });
      window.removeEventListener('alerts-count-updated', handleAlertsCountUpdate as EventListener);
      clearInterval(intervalId);
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [checkForAlerts, debouncedCheckForAlerts]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchTerm.trim()) {
      onSearch(searchTerm);
    }
  };

  const toggleSearch = () => {
    setSearchVisible(!searchVisible);
    if (!searchVisible) {
      setSearchTerm('');
    }
  };

  const handleBudgetSave = () => {
    const budgetValue = parseFloat(budget);
    if (!isNaN(budgetValue) && budgetValue > 0) {
      localStorage.setItem('monthlyBudget', budget);
      setShowBudgetDialog(false);
      
      window.dispatchEvent(new CustomEvent('subscription-updated'));
    }
  };

  const handleEditSpecificSubscription = useCallback((subscription: Subscription) => {
    if (onEditSubscription) {
      window.dispatchEvent(new CustomEvent('edit-subscription', { 
        detail: { subscription } 
      }));
    }
  }, [onEditSubscription]);

  return (
    <div className="flex items-center justify-between bg-white py-3 px-4 border-b sticky top-0 z-10">
      <div className="w-1/3 flex justify-start">
        <Button 
          variant="outline" 
          onClick={() => setShowBudgetDialog(true)} 
          className="flex items-center"
        >
          <IndianRupee className="h-4 w-4 mr-1" />
          Set Budget
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex items-center space-x-2 w-1/3 justify-end">
        {searchVisible ? (
          <form onSubmit={handleSearch} className="flex items-center">
            <Input
              type="text"
              placeholder="Search subscriptions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="mr-2 w-48"
              autoFocus
            />
            <Button type="submit" variant="outline" size="icon" className="rounded-full">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <Button variant="outline" size="icon" className="rounded-full" onClick={toggleSearch}>
            <Search className="h-4 w-4" />
          </Button>
        )}
        
        <BellNotification 
          unreadCount={unreadAlertsCount} 
          onEditSubscription={handleEditSpecificSubscription}
        />
        
        {onEditSubscription && (
          <Button 
            onClick={onEditSubscription} 
            variant="outline" 
            className="bg-white border-brand-600 text-brand-600 hover:bg-brand-50 rounded-full"
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
        
        <Button onClick={onAddSubscription} className="bg-brand-600 hover:bg-brand-700 rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>

      <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Set Monthly Budget</DialogTitle>
            <DialogDescription>
              Set a monthly budget limit for your subscriptions to better manage your expenses.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="budget" className="text-right">Budget</label>
              <div className="relative col-span-3">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  ₹
                </span>
                <Input
                  id="budget"
                  type="number"
                  min="0"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="pl-7"
                  placeholder="1000"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBudgetDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleBudgetSave}>
              Save Budget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TopNavBar;
