
export interface Subscription {
  id: string;
  name: string;
  category: string;
  price: number;
  billingCycle: string;
  status: string;
  nextBillingDate: string;
  createdAt: string;
  startDate?: string;
  usageData?: number;
  icon?: string;
  iconBg?: string;
}
