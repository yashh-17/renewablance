
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (user) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-brand-50">
      <header className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide"><circle cx="12" cy="12" r="10"/><polyline points="8 12 12 16 16 12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>
            </div>
            <h1 className="text-xl font-bold text-gray-800">SubsTracker</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {isLoggedIn ? (
              <Button 
                onClick={() => navigate("/dashboard")} 
                className="bg-brand-600 hover:bg-brand-700 transition-all duration-300 transform hover:scale-105"
              >
                Dashboard
              </Button>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" className="transition-all duration-300 transform hover:scale-105">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-brand-600 hover:bg-brand-700 transition-all duration-300 transform hover:scale-105">Sign up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-5xl font-bold text-gray-900 leading-tight">
              Take Control of Your <span className="text-brand-600">Subscriptions</span>
            </h1>
            <p className="text-xl text-gray-600">
              Track, manage, and optimize your recurring payments. Never waste money on unused services again.
            </p>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 transition-all duration-300 hover:translate-x-2">
                <div className="bg-success-50 p-1 rounded-full">
                  <svg className="w-5 h-5 text-success-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Track All Subscriptions</h3>
                  <p className="text-gray-600">Manage all your subscriptions in one place</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 transition-all duration-300 hover:translate-x-2">
                <div className="bg-success-50 p-1 rounded-full">
                  <svg className="w-5 h-5 text-success-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Get Smart Recommendations</h3>
                  <p className="text-gray-600">We'll suggest ways to optimize your spending</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 transition-all duration-300 hover:translate-x-2">
                <div className="bg-success-50 p-1 rounded-full">
                  <svg className="w-5 h-5 text-success-600" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Never Miss a Payment</h3>
                  <p className="text-gray-600">Get reminders before you're charged</p>
                </div>
              </div>
            </div>
            <div className="pt-4">
              <Link to="/register">
                <Button size="lg" className="bg-brand-600 hover:bg-brand-700 animate-pulse-slow transition-all duration-300 transform hover:scale-105">
                  Get Started - It's Free
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex justify-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Your Subscriptions</h2>
                  <span className="bg-brand-100 text-brand-800 text-sm px-2 py-1 rounded-md">₹56.97/mo</span>
                </div>
                
                {/* Netflix subscription example */}
                <div className="bg-white border border-gray-100 rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow transition-all duration-300 transform hover:scale-102 hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center">
                      N
                    </div>
                    <div>
                      <h3 className="font-medium">Netflix</h3>
                      <p className="text-sm text-gray-500">Entertainment</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹15.99</p>
                    <p className="text-xs text-gray-500">Monthly</p>
                  </div>
                </div>
                
                {/* Spotify subscription example */}
                <div className="bg-white border border-gray-100 rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow transition-all duration-300 transform hover:scale-102 hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-600 text-white w-10 h-10 rounded-full flex items-center justify-center">
                      S
                    </div>
                    <div>
                      <h3 className="font-medium">Spotify</h3>
                      <p className="text-sm text-gray-500">Music</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹9.99</p>
                    <p className="text-xs text-gray-500">Monthly</p>
                  </div>
                </div>
                
                {/* iCloud subscription example */}
                <div className="bg-white border border-gray-100 rounded-lg p-4 flex items-center justify-between shadow-sm hover:shadow transition-all duration-300 transform hover:scale-102 hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="bg-gray-400 text-white w-10 h-10 rounded-full flex items-center justify-center">
                      i
                    </div>
                    <div>
                      <h3 className="font-medium">iCloud</h3>
                      <p className="text-sm text-gray-500">Cloud Storage</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">₹2.99</p>
                    <p className="text-xs text-gray-500">Monthly</p>
                  </div>
                </div>
                
                <div className="bg-warning-50 border border-warning-100 rounded-lg p-4 mt-2 transition-all duration-300 hover:bg-warning-100">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-warning-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-medium text-warning-800">Recommendation</h3>
                      <p className="text-sm text-warning-700">Your Disney+ subscription shows low usage. Consider cancelling to save ₹7.99/mo.</p>
                    </div>
                  </div>
                </div>
                
                <Button variant="outline" className="w-full transition-all duration-300 hover:bg-brand-50">View All</Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
