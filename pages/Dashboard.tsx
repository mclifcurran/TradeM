import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';
import { MonthlyStats, Receipt, User } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<MonthlyStats | null>(null);
  const [recentReceipts, setRecentReceipts] = useState<Receipt[]>([]);
  const [user, setUser] = useState<User | null>(null);
  // Default to current month YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const currentUser = db.getCurrentUser();
    setUser(currentUser);
    if (currentUser) {
      // Create a date object from the selected month string (e.g., "2023-10")
      const [year, month] = selectedMonth.split('-').map(Number);
      const dateForStats = new Date(year, month - 1, 1);
      
      setStats(db.getStats(currentUser.id, dateForStats));
      
      const all = db.getReceipts(currentUser.id);
      setRecentReceipts(all.slice(0, 5));
    }
  }, [selectedMonth]);

  const downloadCSV = () => {
    if (!user || !stats) return;
    
    const [year, month] = selectedMonth.split('-').map(Number);
    // Get receipts specific to this month view
    const all = db.getReceipts(user.id);
    const filtered = all.filter(r => {
        const d = new Date(r.spendDate);
        return d.getMonth() === (month - 1) && d.getFullYear() === year;
    });

    if (filtered.length === 0) {
        alert("No receipts to export for this month.");
        return;
    }

    const headers = ['Spend Date', 'Created At', 'Vendor', 'Category', 'Amount', 'VAT'];
    const rows = filtered.map(r => [
      r.spendDate,
      r.createdAt,
      `"${r.vendor.replace(/"/g, '""')}"`,
      r.category,
      r.amount.toFixed(2),
      (r.vatAmount || 0).toFixed(2)
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `trademate_expenses_${selectedMonth}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!stats || !user) return <div className="p-4 text-center">Loading...</div>;

  const chartData = Object.keys(stats.byCategory).map(cat => ({
    name: cat.charAt(0).toUpperCase() + cat.slice(1),
    amount: stats.byCategory[cat]
  }));

  // Calculate current quota usage based on REAL time, not selected month
  const currentUsage = db.getReceiptsForMonth(user.id, new Date()).length;

  return (
    <div className="space-y-8">
      {/* Header with Month Selector and Export */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-bold text-navy-900 tracking-tight">Dashboard</h2>
          <p className="text-gray-500 font-medium">Overview for {user.name}</p>
        </div>
        
        <div className="flex items-center gap-3">
           <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-navy-900 text-sm font-semibold rounded-lg focus:ring-brand-500 focus:border-brand-500 block p-2.5 outline-none shadow-sm"
           />
           <button 
             onClick={downloadCSV}
             className="bg-gray-50 border border-gray-200 hover:bg-gray-100 text-navy-800 p-2.5 rounded-lg transition shadow-sm"
             title="Export CSV"
           >
             <i className="ph ph-download-simple text-xl"></i>
           </button>
           <Link to="/upload" className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-brand-500/30 flex items-center gap-2 transition whitespace-nowrap transform active:scale-95">
              <i className="ph-bold ph-plus text-lg"></i>
              <span>Add Receipt</span>
           </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* Total Spent */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 col-span-2 md:col-span-2 flex flex-col justify-between hover:shadow-md transition duration-300">
          <div className="flex justify-between items-start">
             <div>
                <p className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Total Spent ({selectedMonth})</p>
                <p className="text-4xl font-extrabold text-navy-900 tracking-tight">£{stats.totalSpent.toFixed(2)}</p>
             </div>
             <div className="bg-brand-50 p-3 rounded-xl text-brand-600">
                <i className="ph-fill ph-wallet text-2xl"></i>
             </div>
          </div>
        </div>

        {/* VAT */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition duration-300">
           <div className="flex justify-between items-start">
               <div>
                   <p className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Total VAT</p>
                   <p className="text-2xl font-bold text-navy-900">£{stats.totalVat.toFixed(2)}</p>
               </div>
               <div className="bg-green-50 p-2 rounded-lg text-green-600">
                   <i className="ph-bold ph-percent text-xl"></i>
               </div>
           </div>
        </div>

        {/* Limit */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden hover:shadow-md transition duration-300 group">
           <div className="relative z-10">
               <p className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Monthly Limit</p>
               <div className="flex items-baseline gap-1 mb-3">
                 <p className="text-2xl font-bold text-navy-900">{currentUsage}</p>
                 <span className="text-sm text-gray-400 font-medium">/ {user.isPro ? '∞' : '10'}</span>
               </div>
               {!user.isPro && (
                   <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                       <div className={`h-full ${currentUsage >= 10 ? 'bg-red-500' : 'bg-brand-500'}`} style={{width: `${Math.min((currentUsage/10)*100, 100)}%`}}></div>
                   </div>
               )}
           </div>
           <div className="absolute -bottom-6 -right-6 text-gray-50 group-hover:text-gray-100 transition duration-500 rotate-12">
               <i className="ph-fill ph-receipt text-8xl"></i>
           </div>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-80">
           <div className="flex items-center gap-2 mb-6">
                <i className="ph-fill ph-chart-bar text-brand-500"></i>
                <h3 className="text-lg font-bold text-navy-900">Spend by Category</h3>
           </div>
           <ResponsiveContainer width="100%" height="100%">
             <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
               <XAxis dataKey="name" tick={{fontSize: 11, fill: '#6b7280'}} axisLine={false} tickLine={false} dy={10} />
               <YAxis tick={{fontSize: 11, fill: '#6b7280'}} axisLine={false} tickLine={false} />
               <Tooltip 
                  cursor={{fill: '#f3f4f6'}}
                  contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                  formatter={(value) => [`£${Number(value).toFixed(2)}`, 'Spent']} 
                />
               <Bar dataKey="amount" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={40} />
             </BarChart>
           </ResponsiveContainer>
        </div>
      ) : (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center">
             <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                <i className="ph-fill ph-chart-pie-slice text-3xl"></i>
             </div>
             <p className="text-gray-900 font-medium">No spending data found for this month.</p>
             <p className="text-gray-500 text-sm mt-1">Upload a receipt to get started.</p>
          </div>
      )}

      {/* Recent List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
         <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
             <h3 className="font-bold text-navy-900 text-lg">Recent Uploads</h3>
             <Link to="/history" className="text-brand-600 text-sm font-bold hover:text-brand-700 flex items-center gap-1">
                View All <i className="ph-bold ph-caret-right"></i>
             </Link>
         </div>
         <div className="divide-y divide-gray-100">
            {recentReceipts.length === 0 ? (
                <div className="p-12 text-center text-gray-400 flex flex-col items-center">
                    <i className="ph-duotone ph-receipt text-5xl mb-3 text-gray-300"></i>
                    <p className="font-medium">No receipts yet.</p>
                </div>
            ) : (
                recentReceipts.map(receipt => (
                    <div key={receipt.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition group cursor-default">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white border border-gray-100 shadow-sm rounded-xl flex items-center justify-center text-brand-600 text-xl group-hover:scale-105 transition duration-300">
                                <i className={`ph-fill ${getIconForCategory(receipt.category)}`}></i>
                            </div>
                            <div>
                                <p className="font-bold text-navy-900 line-clamp-1 text-base">{receipt.vendor}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded capitalize">{receipt.category}</span>
                                    <span className="text-xs text-gray-400">• {new Date(receipt.spendDate).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                        <span className="font-bold text-navy-900 text-lg">£{receipt.amount.toFixed(2)}</span>
                    </div>
                ))
            )}
         </div>
      </div>
    </div>
  );
};

const getIconForCategory = (cat: string) => {
    switch(cat.toLowerCase()) {
        case 'fuel': return 'ph-gas-pump';
        case 'materials': return 'ph-bricks';
        case 'tools': return 'ph-wrench';
        case 'food': return 'ph-hamburger';
        case 'hotel': return 'ph-bed';
        case 'travel': return 'ph-airplane-tilt';
        case 'training': return 'ph-student';
        default: return 'ph-receipt';
    }
}

export default Dashboard;