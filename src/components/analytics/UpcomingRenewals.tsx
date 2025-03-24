
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Check } from 'lucide-react';
import { Subscription } from '@/types/subscription';
import { format, parse, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';

interface UpcomingRenewalsProps {
  subscriptions: Subscription[];
}

const UpcomingRenewals: React.FC<UpcomingRenewalsProps> = ({ subscriptions }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [renewalDays, setRenewalDays] = useState<Record<string, Subscription[]>>({});
  const [tooltipVisible, setTooltipVisible] = useState<string | null>(null);

  // Generate calendar days for the current month
  useEffect(() => {
    const firstDay = startOfMonth(currentMonth);
    const lastDay = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: firstDay, end: lastDay });
    setCalendarDays(days);
  }, [currentMonth]);

  // Map subscriptions to renewal days
  useEffect(() => {
    const renewals: Record<string, Subscription[]> = {};
    
    subscriptions.forEach(subscription => {
      if (subscription.status !== 'active' && subscription.status !== 'trial') return;
      
      const nextBillingDate = new Date(subscription.nextBillingDate);
      const dateKey = format(nextBillingDate, 'yyyy-MM-dd');
      
      if (!renewals[dateKey]) {
        renewals[dateKey] = [];
      }
      
      renewals[dateKey].push(subscription);
    });
    
    setRenewalDays(renewals);
  }, [subscriptions]);

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() - 1);
      return newMonth;
    });
  };

  // Navigate to next month
  const nextMonth = () => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      newMonth.setMonth(prev.getMonth() + 1);
      return newMonth;
    });
  };

  // Calculate color intensity based on number of renewals
  const getHeatmapColor = (date: Date) => {
    const dateKey = format(date, 'yyyy-MM-dd');
    const count = renewalDays[dateKey]?.length || 0;
    
    if (count === 0) return 'bg-gray-100 hover:bg-gray-200';
    if (count === 1) return 'bg-green-100 hover:bg-green-200';
    if (count === 2) return 'bg-green-200 hover:bg-green-300';
    if (count === 3) return 'bg-green-300 hover:bg-green-400';
    return 'bg-green-400 hover:bg-green-500';
  };

  const handleDayMouseEnter = (dateKey: string) => {
    if (renewalDays[dateKey]?.length > 0) {
      setTooltipVisible(dateKey);
    }
  };

  const handleDayMouseLeave = () => {
    setTooltipVisible(null);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-brand-500" />
          Upcoming Renewals
        </CardTitle>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <CardDescription>
            Calendar view of your subscription renewals
          </CardDescription>
          <div className="flex gap-2">
            <button 
              onClick={prevMonth}
              className="p-1 rounded hover:bg-gray-200"
              aria-label="Previous month"
            >
              ←
            </button>
            <span className="font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
            <button 
              onClick={nextMonth}
              className="p-1 rounded hover:bg-gray-200"
              aria-label="Next month"
            >
              →
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Day labels */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-xs font-medium">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const hasRenewals = dateKey in renewalDays;
            const dayRenewals = renewalDays[dateKey] || [];
            const isTooltipVisible = tooltipVisible === dateKey;
            
            return (
              <div
                key={index}
                className={`
                  relative aspect-square rounded-md flex flex-col items-center justify-center
                  ${getHeatmapColor(day)}
                  ${hasRenewals ? 'cursor-pointer' : ''}
                `}
                title={hasRenewals ? `${dayRenewals.length} renewal(s)` : ''}
                onMouseEnter={() => handleDayMouseEnter(dateKey)}
                onMouseLeave={handleDayMouseLeave}
              >
                <span className="text-sm">{format(day, 'd')}</span>
                {hasRenewals && (
                  <>
                    <span className="text-xs text-green-700">
                      {dayRenewals.length} item{dayRenewals.length > 1 ? 's' : ''}
                    </span>
                    {isTooltipVisible && (
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-white border rounded-md shadow-lg p-2 z-50 w-48 mt-1">
                        <p className="font-semibold text-sm mb-1">
                          {format(day, 'MMMM d, yyyy')}
                        </p>
                        <ul className="text-xs space-y-1 max-h-32 overflow-y-auto">
                          {dayRenewals.map(sub => (
                            <li key={sub.id} className="flex items-center">
                              <Check className="h-3 w-3 mr-1 text-green-500 flex-shrink-0" />
                              <span className="font-medium truncate">{sub.name}</span>
                              <span className="ml-1 text-muted-foreground">Rs.{sub.price}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap justify-end mt-4 gap-3">
          <div className="flex items-center text-xs">
            <div className="h-3 w-3 rounded bg-gray-100 mr-1"></div>
            <span>No renewals</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="h-3 w-3 rounded bg-green-100 mr-1"></div>
            <span>1 renewal</span>
          </div>
          <div className="flex items-center text-xs">
            <div className="h-3 w-3 rounded bg-green-300 mr-1"></div>
            <span>Multiple renewals</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UpcomingRenewals;
