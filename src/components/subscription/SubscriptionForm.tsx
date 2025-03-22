
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
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { getSubscriptions } from "@/services/subscriptionService";
import { Calendar } from "@/components/ui/calendar";
import { Search, CheckCircle2, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  isEditMode?: boolean; // Explicitly check if we're in edit mode for top bar
  availableSubscriptions?: Subscription[]; // For autocomplete in top bar edit mode
}

const SubscriptionForm: React.FC<SubscriptionFormProps> = ({
  open,
  onClose,
  onSave,
  subscription,
  isEditMode = false,
  availableSubscriptions = []
}) => {
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [status, setStatus] = useState("active");
  const [usageHours, setUsageHours] = useState<number | string>("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autocompleteOpen, setAutocompleteOpen] = useState(false);
  const [subscriptionOptions, setSubscriptionOptions] = useState<Subscription[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Determine if we're in edit mode (either explicitly or via subscription prop)
  const effectiveEditMode = isEditMode || !!subscription;

  // Filter subscription options based on search query
  const filteredOptions = subscriptionOptions.filter(sub => 
    sub.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Load subscription options for autocomplete when in explicit edit mode
  useEffect(() => {
    if (isEditMode) {
      // Only load subscriptions for autocomplete in top bar edit mode
      const subs = availableSubscriptions.length > 0 
        ? availableSubscriptions 
        : getSubscriptions();
      setSubscriptionOptions(subs);
      setAutocompleteOpen(true);
    }
  }, [isEditMode, availableSubscriptions, open]);

  // Reset search when form closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  // Load subscription data if editing
  useEffect(() => {
    if (subscription) {
      setName(subscription.name);
      setCategory(subscription.category);
      setPrice(subscription.price);
      setBillingCycle(subscription.billingCycle);
      setStatus(subscription.status);
      
      // Set start date if it exists
      if (subscription.startDate) {
        setStartDate(new Date(subscription.startDate));
      } else {
        // Default to created date if no start date
        setStartDate(new Date(subscription.createdAt));
      }
      
      // Convert usageData percentage to approximate hours if available
      if (subscription.usageData !== undefined) {
        // Assuming 100% usage is about 30 hours per month
        const hours = Math.round((subscription.usageData / 100) * 30);
        setUsageHours(hours);
      } else {
        setUsageHours("");
      }
    } else if (!isEditMode) {
      // Reset form for new subscription (but not for edit mode without selection)
      setName("");
      setCategory("");
      setPrice("");
      setBillingCycle("monthly");
      setStatus("active");
      setUsageHours("");
      setStartDate(new Date()); // Default to today for new subscriptions
    }
    
    // Clear any previous errors when form opens
    setErrors({});
  }, [subscription, open, isEditMode]);

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
    
    if (!startDate) {
      newErrors.startDate = "Start date is required";
    }
    
    if (usageHours !== "" && (isNaN(Number(usageHours)) || Number(usageHours) < 0 || Number(usageHours) > 744)) {
      newErrors.usageHours = "Usage hours must be a number between 0 and 744 (31 days × 24 hours)";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    const nextBillingDate = new Date();
    // Keep the existing next billing date if editing
    if (subscription?.nextBillingDate) {
      nextBillingDate.setTime(new Date(subscription.nextBillingDate).getTime());
    } else {
      // Calculate next billing date based on start date and billing cycle
      if (startDate) {
        nextBillingDate.setTime(startDate.getTime());
        if (billingCycle === "weekly") {
          nextBillingDate.setDate(nextBillingDate.getDate() + 7);
        } else if (billingCycle === "monthly") {
          nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        } else if (billingCycle === "yearly") {
          nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
        }
      }
    }
    
    // Calculate usageData percentage based on hours
    // Assuming average monthly usage of 30 hours is 100%
    let usageData = 0;
    if (usageHours !== "") {
      const hours = Number(usageHours);
      // Cap at 100% (30 hours)
      usageData = Math.min(Math.round((hours / 30) * 100), 100);
    } else if (subscription?.usageData !== undefined) {
      // Keep existing usage data if no new input
      usageData = subscription.usageData;
    } else {
      // Random placeholder for new subscriptions without hours
      usageData = Math.floor(Math.random() * 100);
    }

    const newSubscription: Subscription = {
      id: subscription?.id || Date.now().toString(),
      name,
      category,
      price: Number(price),
      billingCycle,
      status,
      nextBillingDate: nextBillingDate.toISOString(),
      createdAt: subscription?.createdAt || new Date().toISOString(),
      startDate: startDate ? startDate.toISOString() : new Date().toISOString(),
      usageData,
      icon: subscription?.icon,
      iconBg: subscription?.iconBg,
    };
    
    onSave(newSubscription);
    onClose();
  };

  const handleSubscriptionSelect = (sub: Subscription) => {
    setName(sub.name);
    setCategory(sub.category);
    setPrice(sub.price);
    setBillingCycle(sub.billingCycle);
    setStatus(sub.status);
    
    // Set start date if it exists
    if (sub.startDate) {
      setStartDate(new Date(sub.startDate));
    } else {
      // Default to created date if no start date
      setStartDate(new Date(sub.createdAt));
    }
    
    if (sub.usageData !== undefined) {
      const hours = Math.round((sub.usageData / 100) * 30);
      setUsageHours(hours);
    } else {
      setUsageHours("");
    }
    
    setAutocompleteOpen(false);
  };

  const getDialogTitle = () => {
    if (isEditMode && !subscription) {
      return "Edit Subscription";
    } else if (subscription) {
      return `Edit ${subscription.name} Subscription`;
    } else {
      return "Add Subscription";
    }
  };

  const getDialogDescription = () => {
    if (isEditMode && !subscription) {
      return "Select a subscription to edit.";
    } else if (subscription) {
      return "Update your subscription details below.";
    } else {
      return "Enter the details of your subscription.";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] animate-in fade-in-50 duration-300">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {getDialogTitle()}
          </DialogTitle>
          <DialogDescription>
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            
            {isEditMode && !subscription ? (
              <div className="col-span-3">
                <Popover open={autocompleteOpen} onOpenChange={setAutocompleteOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={autocompleteOpen}
                      onClick={() => setAutocompleteOpen(true)}
                      className="w-full justify-between"
                    >
                      {name || "Select subscription..."}
                      <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Search subscriptions..." 
                        value={searchQuery}
                        onValueChange={setSearchQuery}
                      />
                      <CommandEmpty>No subscription found.</CommandEmpty>
                      <CommandGroup>
                        <CommandList>
                          {filteredOptions.map((sub) => (
                            <CommandItem
                              key={sub.id}
                              value={sub.name}
                              onSelect={() => handleSubscriptionSelect(sub)}
                              className="cursor-pointer"
                            >
                              <div className="flex items-center">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${sub.iconBg || 'bg-gray-500'}`}>
                                  <span className="text-white text-xs font-bold">{sub.icon || sub.name.charAt(0)}</span>
                                </div>
                                <span>{sub.name}</span>
                              </div>
                              {name === sub.name && (
                                <CheckCircle2 className="ml-auto h-4 w-4 text-green-600" />
                              )}
                            </CommandItem>
                          ))}
                        </CommandList>
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            ) : (
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="Netflix, Spotify, etc."
              />
            )}
            
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
                ₹
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
            <Label htmlFor="startDate" className="text-right">
              Start Date
            </Label>
            <div className="col-span-3">
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    id="startDate"
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setCalendarOpen(false);
                    }}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground mt-1">
                The date you first subscribed to this service
              </p>
            </div>
            {errors.startDate && (
              <p className="text-destructive text-sm col-start-2 col-span-3">
                {errors.startDate}
              </p>
            )}
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="usageHours" className="text-right">
              Usage Hours
            </Label>
            <div className="col-span-3">
              <Input
                id="usageHours"
                type="number"
                min="0"
                max="744"
                value={usageHours}
                onChange={(e) => setUsageHours(e.target.value)}
                placeholder="Hours used per month"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Estimated hours you use this subscription per month
              </p>
            </div>
            {errors.usageHours && (
              <p className="text-destructive text-sm col-start-2 col-span-3">
                {errors.usageHours}
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
          <Button onClick={handleSubmit} className="relative overflow-hidden hover:animate-pulse">
            <span className="relative z-10">
              {subscription || (isEditMode && name) ? "Update" : "Save"}
            </span>
            <span className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 hover:opacity-20 transition-opacity duration-300"></span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionForm;
