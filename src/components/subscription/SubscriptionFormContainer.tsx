
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
  };

  return {
    formOpen,
    isTopBarEditMode,
    selectedSubscription,
    handleAddSubscription,
    handleEditFromTopBar,
    handleEditSubscription,
    handleCloseForm,
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
