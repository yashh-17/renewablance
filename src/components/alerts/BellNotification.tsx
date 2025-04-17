
import React, { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { AnimatePresence, motion } from 'framer-motion';
import AlertsModule from './AlertsModule';
import { Subscription } from '@/types/subscription';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';

interface BellNotificationProps {
  unreadCount?: number;
  onEditSubscription?: (subscription: Subscription) => void;
}

const BellNotification: React.FC<BellNotificationProps> = ({ 
  unreadCount = 0,
  onEditSubscription
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  // Close dropdown when clicking outside
  useOnClickOutside(ref, () => setIsOpen(false));
  
  // Close dropdown when pressing escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-medium text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 z-50"
            style={{ maxHeight: 'calc(100vh - 200px)' }}
          >
            <Card className="overflow-hidden shadow-lg border border-gray-200">
              <div className="max-h-[80vh] overflow-y-auto">
                <AlertsModule onEditSubscription={onEditSubscription} />
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BellNotification;
