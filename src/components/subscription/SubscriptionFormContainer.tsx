
import { useState } from 'react';
import { Subscription } from '@/types/subscription';
import SubscriptionForm from '@/components/subscription/SubscriptionForm';

interface SubscriptionFormContainerProps {
  onSave: (subscription: Subscription) => void;
  subscriptions: Subscription[];
}

const SubscriptionFormContainer = ({ onSave, subscriptions }: SubscriptionFormContainerProps) => {
  const [formOpen, setFormOpen] = useState(false);
  const [isTopBarEditMode, setIsTopBarEditMode] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  
  const handleAddSubscription = () => {
    setIsTopBarEditMode(false);
    setSelectedSubscription(null);
    setFormOpen(true);
  };
  
  const handleEditFromTopBar = () => {
    setIsTopBarEditMode(true);
    setSelectedSubscription(null);
    setFormOpen(true);
  };
  
  const handleEditSubscription = (subscription: Subscription) => {
    setIsTopBarEditMode(false);
    setSelectedSubscription(subscription);
    setFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setFormOpen(false);
    setIsTopBarEditMode(false);
    setSelectedSubscription(null);
  };
  
  const handleSaveSubscription = (subscription: Subscription) => {
    onSave(subscription);
    handleCloseForm();
    
    // Ensure events are triggered for the alerts system
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('subscription-updated'));
      
      // If it's a new subscription, trigger a specific event
      if (!selectedSubscription) {
        window.dispatchEvent(new CustomEvent('new-subscription-added', {
          detail: { subscription }
        }));
      }
      
      // Check if this subscription will renew soon
      const nextBillingDate = new Date(subscription.nextBillingDate);
      const now = new Date();
      const daysToRenewal = Math.floor((nextBillingDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysToRenewal <= 7) {
        window.dispatchEvent(new CustomEvent('renewal-detected'));
      }
    }, 200);
  };

  return {
    formOpen,
    isTopBarEditMode,
    selectedSubscription,
    handleAddSubscription,
    handleEditFromTopBar,
    handleEditSubscription,
    handleCloseForm,
    handleSaveSubscription,
    form: (
      <SubscriptionForm
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSaveSubscription}
        subscription={selectedSubscription}
        isEditMode={isTopBarEditMode}
        availableSubscriptions={subscriptions}
      />
    )
  };
};

export default SubscriptionFormContainer;
