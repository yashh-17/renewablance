
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '@/components/auth/RegisterForm';

const Register = () => {
  const navigate = useNavigate();
  
  // Check if user is already logged in
  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-brand-100 flex flex-col justify-center">
      <div className="container px-4 mx-auto">
        <div className="flex justify-center mb-8">
          <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white p-3 rounded-xl">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide"><circle cx="12" cy="12" r="10"/><polyline points="8 12 12 16 16 12"/><line x1="12" y1="8" x2="12" y2="16"/></svg>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">SubsTracker</h1>
        <p className="text-center text-gray-600 mb-8">Take control of your subscriptions</p>
        <RegisterForm />
      </div>
    </div>
  );
};

export default Register;
