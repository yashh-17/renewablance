
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface TopNavBarProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  onAddSubscription: () => void;
}

const TopNavBar: React.FC<TopNavBarProps> = ({ 
  activeTab, 
  onTabChange, 
  onAddSubscription 
}) => {
  return (
    <div className="flex items-center justify-between bg-white py-3 px-4 border-b sticky top-0 z-10">
      <div className="w-1/3"> {/* Empty space for balance */}
      </div>
      
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-auto">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="flex items-center space-x-2 w-1/3 justify-end">
        <Button variant="outline" size="icon" className="rounded-full">
          <Search className="h-4 w-4" />
        </Button>
        <Button onClick={onAddSubscription} className="bg-brand-600 hover:bg-brand-700 rounded-full">
          <Plus className="h-4 w-4 mr-2" />
          Add New
        </Button>
      </div>
    </div>
  );
};

export default TopNavBar;
