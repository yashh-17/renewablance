
import { Subscription } from "@/types/subscription";

// Helper function to determine if a subscription is underutilized
export const isUnderUtilized = (subscription: Subscription): boolean => {
  // If usage data is not available, can't determine
  if (subscription.usageData === undefined) return false;
  
  // Consider subscriptions with less than 30% usage as underutilized
  return subscription.usageData < 30;
};

// Get recommendations for subscriptions
export const getRecommendations = (subscriptions: Subscription[]): any[] => {
  const recommendations = [];
  
  // Find underutilized subscriptions
  const underUtilizedSubs = subscriptions.filter(isUnderUtilized);
  
  for (const sub of underUtilizedSubs) {
    let recommendation = {
      id: `rec-${sub.id}`,
      subscriptionId: sub.id,
      subscriptionName: sub.name,
      type: 'underutilized',
      message: `Your ${sub.name} subscription is only used ${sub.usageData}% of the time. Consider downgrading or cancelling.`,
      action: 'Consider downgrading or canceling',
    };
    
    recommendations.push(recommendation);
  }
  
  // Check for duplicate category subscriptions
  const categoryCounts: Record<string, string[]> = {};
  for (const sub of subscriptions) {
    if (!categoryCounts[sub.category]) {
      categoryCounts[sub.category] = [];
    }
    categoryCounts[sub.category].push(sub.name);
  }
  
  for (const [category, names] of Object.entries(categoryCounts)) {
    if (names.length > 1) {
      let recommendation = {
        id: `rec-cat-${category}`,
        type: 'duplicate',
        category,
        subscriptions: names,
        message: `You have multiple ${category} subscriptions: ${names.join(', ')}. Consider consolidating.`,
        action: 'Consider consolidating services',
      };
      
      recommendations.push(recommendation);
    }
  }
  
  // Calculate monthly cost and suggest budget
  const monthlyCost = subscriptions.reduce((total, sub) => {
    if (sub.billingCycle === "monthly") {
      return total + sub.price;
    } else if (sub.billingCycle === "yearly") {
      return total + (sub.price / 12);
    } else if (sub.billingCycle === "weekly") {
      return total + (sub.price * 4.33);
    }
    return total;
  }, 0);
  
  // Add a budget recommendation if monthly cost is over 50
  if (monthlyCost > 50) {
    recommendations.push({
      id: 'rec-budget',
      type: 'budget',
      message: `Your monthly subscription cost is ₹${monthlyCost.toFixed(2)}. Consider setting a budget to reduce costs.`,
      action: 'Consider setting a budget',
      monthlyCost,
    });
  }
  
  return recommendations;
};
