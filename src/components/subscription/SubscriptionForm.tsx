
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Subscription } from "@/types/subscription";

const CATEGORIES = [
  "Entertainment",
  "Productivity",
  "Cloud Storage",
  "Food",
  "Music",
  "Video",
  "News",
  "Social Media",
  "Health & Fitness",
  "Other",
];

const BILLING_CYCLES = [
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly" },
];

interface SubscriptionFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (subscription: Subscription) => void;
  subscription?: Subscription | null;
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  open,
  onClose,
  onSave,
  subscription,
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [status, setStatus] = useState("active");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load subscription data if editing
  useEffect(() => {
    if (subscription) {
      setName(subscription.name);
      setCategory(subscription.category);
      setPrice(subscription.price);
      setBillingCycle(subscription.billingCycle);
      setStatus(subscription.status);
    } else {
      // Reset form for new subscription
      setName("");
      setCategory("");
      setPrice("");
      setBillingCycle("monthly");
      setStatus("active");
    }
  }, [subscription, open]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!category) {
      newErrors.category = "Category is required";
    }
    
    if (!price) {
      newErrors.price = "Price is required";
    } else if (isNaN(Number(price)) || Number(price) < 0) {
      newErrors.price = "Price must be a positive number";
    }
    
    if (!billingCycle) {
      newErrors.billingCycle = "Billing cycle is required";
    }
    
    if (!status) {
      newErrors.status = "Status is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    const nextBillingDate = new Date();
    if (billingCycle === "weekly") {
      nextBillingDate.setDate(nextBillingDate.getDate() + 7);
    } else if (billingCycle === "monthly") {
      nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
    } else if (billingCycle === "yearly") {
      nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
    }
    
    const usageData = Math.floor(Math.random() * 100); // Placeholder for demo

    const newSubscription: Subscription = {
      id: subscription?.id || Date.now().toString(),
      name,
      category,
      price: Number(price),
      billingCycle,
      status,
      nextBillingDate: nextBillingDate.toISOString(),
      createdAt: subscription?.createdAt || new Date().toISOString(),
      usageData,
    };
    
    onSave(newSubscription);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {subscription ? "Edit Subscription" : "Add Subscription"}
          </DialogTitle>
          <DialogDescription>
            {subscription
              ? "Update your subscription details below."
              : "Enter the details of your subscription."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Netflix, Spotify, etc."
            />
            {errors.name && (
              <p className="text-destructive text-sm col-start-2 col-span-3">
                {errors.name}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select
              value={category}
              onValueChange={setCategory}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-destructive text-sm col-start-2 col-span-3">
                {errors.category}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <div className="relative col-span-3">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                $
              </span>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="pl-7"
                placeholder="9.99"
              />
            </div>
            {errors.price && (
              <p className="text-destructive text-sm col-start-2 col-span-3">
                {errors.price}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Billing Cycle</Label>
            <div className="col-span-3">
              <RadioGroup
                value={billingCycle}
                onValueChange={setBillingCycle}
                className="flex space-x-4"
              >
                {BILLING_CYCLES.map((cycle) => (
                  <div className="flex items-center space-x-2" key={cycle.value}>
                    <RadioGroupItem value={cycle.value} id={cycle.value} />
                    <Label htmlFor={cycle.value}>{cycle.label}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            {errors.billingCycle && (
              <p className="text-destructive text-sm col-start-2 col-span-3">
                {errors.billingCycle}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Status</Label>
            <div className="col-span-3">
              <RadioGroup
                value={status}
                onValueChange={setStatus}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="trial" id="trial" />
                  <Label htmlFor="trial">Trial</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="inactive" id="inactive" />
                  <Label htmlFor="inactive">Inactive</Label>
                </div>
              </RadioGroup>
            </div>
            {errors.status && (
              <p className="text-destructive text-sm col-start-2 col-span-3">
                {errors.status}
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {subscription ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionForm;
