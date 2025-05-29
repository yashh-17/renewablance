
// Helper function to calculate exact days between two dates
export const calculateDaysBetween = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

// Calculate the next billing date based on the current date and billing cycle
export const calculateNextBillingDate = (
  currentDate: Date,
  billingCycle: string,
  previousBillingDate?: Date
): Date => {
  const result = new Date(currentDate);
  
  if (previousBillingDate) {
    const targetMonth = result.getMonth();
    const targetYear = result.getFullYear();
    
    const previousDay = previousBillingDate.getDate();
    result.setDate(previousDay);
    
    result.setMonth(targetMonth);
    result.setFullYear(targetYear);
  }
  
  if (billingCycle === 'weekly') {
    result.setDate(result.getDate() + 7);
  } else if (billingCycle === 'monthly') {
    const currentDay = result.getDate();
    
    result.setMonth(result.getMonth() + 1);
    
    const newMonth = result.getMonth();
    const expectedMonth = (currentDate.getMonth() + 1) % 12;
    
    if (newMonth !== expectedMonth) {
      result.setDate(0);
    }
  } else if (billingCycle === 'yearly') {
    result.setFullYear(result.getFullYear() + 1);
    
    if (result.getMonth() === 1 && result.getDate() === 29) {
      const isLeapYear = (year: number) => {
        return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
      };
      
      if (!isLeapYear(result.getFullYear())) {
        result.setDate(28);
      }
    }
  }
  
  return result;
};
