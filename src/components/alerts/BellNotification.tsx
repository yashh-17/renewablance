
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
  const [hasInitialized, setHasInitialized] = useState(false);
  const [localUnreadCount, setLocalUnreadCount] = useState(0); // Start with 0 instead of prop
  const ref = useRef<HTMLDivElement>(null);
  const initTimeoutRef = useRef<NodeJS.Timeout>();
  
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

  // Initialize component with proper delay to allow alerts system to load
  useEffect(() => {
    initTimeoutRef.current = setTimeout(() => {
      setHasInitialized(true);
      // Only set the initial count from props after initialization
      if (unreadCount > 0) {
        setLocalUnreadCount(unreadCount);
      }
    }, 500); // Give alerts system time to initialize
    
    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, [unreadCount]);

  // Listen for alerts count updates from AlertsModule with proper validation
  useEffect(() => {
    const handleAlertsCountUpdate = (event: CustomEvent) => {
      if (event.detail?.count !== undefined && typeof event.detail.count === 'number') {
        const count = Math.max(0, event.detail.count); // Ensure non-negative
        console.log('BellNotification received count update:', count);
        setLocalUnreadCount(count);
      }
    };
    
    window.addEventListener('alerts-count-updated', handleAlertsCountUpdate as EventListener);
    
    return () => {
      window.removeEventListener('alerts-count-updated', handleAlertsCountUpdate as EventListener);
    };
  }, []);

  // Update from props only if it's higher than current local count (avoid stale data)
  useEffect(() => {
    if (hasInitialized && unreadCount > localUnreadCount) {
      setLocalUnreadCount(unreadCount);
    }
  }, [unreadCount, localUnreadCount, hasInitialized]);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    // Don't modify count here - let AlertsModule handle it
  };

  // Only show badge if we have a positive count and component is initialized
  const shouldShowBadge = hasInitialized && localUnreadCount > 0;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label={`Notifications${shouldShowBadge ? ` (${localUnreadCount} unread)` : ''}`}
      >
        <Bell className="h-5 w-5 text-gray-600" />
        {shouldShowBadge && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-medium text-white">
            {localUnreadCount > 99 ? '99+' : localUnreadCount}
          </span>
        )}
      </button>
      
      <AnimatePresence>
        {isOpen && hasInitialized && (
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
