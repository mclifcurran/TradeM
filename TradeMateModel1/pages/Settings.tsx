import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { User } from '../types';

const Settings: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [usage, setUsage] = useState(0);

  useEffect(() => {
    const u = db.getCurrentUser();
    setUser(u);
    if (u) {
      const receipts = db.getReceiptsForMonth(u.id, new Date());
      setUsage(receipts.length);
    }
  }, []);

  const handleUpgrade = () => {
    if (!user) return;
    // Mock Stripe Checkout
    const confirm = window.confirm("Mock Stripe Checkout: Confirm payment of £10 for Pro Plan?");
    if (confirm) {
      db.upgradeToPro(user.id);
      setUser({ ...user, isPro: true });
      alert("Successfully upgraded to Pro!");
    }
  };

  const getResetDate = () => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return nextMonth.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
  };

  if (!user) return <div>Loading...</div>;

  const limit = 10;
  const percentage = user.isPro ? 0 : Math.min((usage / limit) * 100, 100);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-navy-900">Settings & Billing</h2>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-navy-800 mb-4">Your Plan</h3>
        
        <div className="flex items-center justify-between mb-6">
           <div>
             <p className="text-2xl font-bold text-navy-900">{user.isPro ? 'Pro Plan' : 'Free Plan'}</p>
             <p className="text-gray-500 text-sm">{user.isPro ? 'Unlimited receipts' : '10 receipts per month'}</p>
           </div>
           {user.isPro ? (
             <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Active</span>
           ) : (
             <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">Free</span>
           )}
        </div>

        {!user.isPro && (
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
               <span className="text-gray-600">Monthly Usage</span>
               <span className={`font-bold ${usage >= limit ? 'text-red-500' : 'text-navy-900'}`}>{usage} / {limit}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2.5">
               <div className={`h-2.5 rounded-full ${usage >= limit ? 'bg-red-500' : 'bg-brand-500'}`} style={{ width: `${percentage}%` }}></div>
            </div>
            {usage >= limit && (
                <p className="text-red-500 text-xs mt-2 font-medium">You have reached your monthly limit.</p>
            )}
            <p className="text-xs text-gray-500 mt-2">Quota resets on {getResetDate()}.</p>
          </div>
        )}

        {!user.isPro && (
          <button 
            onClick={handleUpgrade}
            className="w-full bg-navy-900 hover:bg-navy-800 text-white font-bold py-3 rounded-lg shadow transition flex items-center justify-center gap-2"
          >
            <span>Upgrade to Pro</span>
            <span className="bg-brand-600 text-white text-xs px-2 py-0.5 rounded">£10/mo</span>
          </button>
        )}
        
        {user.isPro && (
             <p className="text-center text-sm text-gray-500">Thank you for being a Pro member!</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
         <h3 className="text-lg font-semibold text-navy-800 mb-4">Account</h3>
         <p className="text-sm text-gray-500 mb-1">Name</p>
         <p className="text-navy-900 font-medium mb-4">{user.name}</p>
         <p className="text-sm text-gray-500 mb-1">Email</p>
         <p className="text-navy-900 font-medium mb-4">{user.email}</p>
         
         <div className="border-t border-gray-100 pt-4">
            <p className="text-xs text-gray-400">User ID: {user.id}</p>
         </div>
      </div>
    </div>
  );
};

export default Settings;