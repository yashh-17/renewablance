
// Helper function to calculate exact days between two dates
export const calculateDaysBetween = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate.setHours(0, 0, 0, 0));
  const end = new Date(endDate.setHours(0, 0, 0, 0));
  
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(0, diffDays);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-IN', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
};

export const formatPrice = (price: number, billingCycle: string) => {
  return `₹${price.toFixed(2)}/${billingCycle.charAt(0)}`;
};

export const getRenewalUrgencyColor = (days: number) => {
  if (days <= 7) return "bg-destructive text-destructive-foreground";
  if (days <= 14) return "bg-warning-500 text-black";
  return "bg-muted text-muted-foreground";
};
