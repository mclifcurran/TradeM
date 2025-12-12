import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Receipt, ReceiptCategory } from '../types';

const History: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [filteredReceipts, setFilteredReceipts] = useState<Receipt[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [monthFilter, setMonthFilter] = useState<string>(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const user = db.getCurrentUser();
    if (user) {
      const all = db.getReceipts(user.id);
      setReceipts(all);
    }
  }, []);

  useEffect(() => {
    let result = receipts;

    // Filter by Month
    if (monthFilter) {
      result = result.filter(r => r.spendDate.startsWith(monthFilter));
    }

    // Filter by Category
    if (categoryFilter !== 'all') {
      result = result.filter(r => r.category === categoryFilter);
    }

    setFilteredReceipts(result);
    setPage(1);
  }, [receipts, categoryFilter, monthFilter]);

  const totalPages = Math.ceil(filteredReceipts.length / itemsPerPage);
  const paginatedData = filteredReceipts.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const downloadCSV = () => {
    const headers = ['Spend Date', 'Created At', 'Vendor', 'Category', 'Amount', 'VAT'];
    const rows = filteredReceipts.map(r => [
      r.spendDate,
      r.createdAt,
      `"${r.vendor.replace(/"/g, '""')}"`, // Escape quotes
      r.category,
      r.amount.toFixed(2),
      (r.vatAmount || 0).toFixed(2)
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `receipts_${monthFilter}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-navy-900">History</h2>
        <button 
          onClick={downloadCSV} 
          disabled={filteredReceipts.length === 0}
          className="flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition"
        >
          <i className="ph ph-download-simple"></i>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Month</label>
          <input 
            type="month" 
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          >
            <option value="all">All Categories</option>
            {Object.values(ReceiptCategory).map(cat => (
               <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-semibold">Date</th>
                <th className="p-4 font-semibold">Vendor</th>
                <th className="p-4 font-semibold">Category</th>
                <th className="p-4 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {paginatedData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-gray-400">
                    No receipts found for this period.
                  </td>
                </tr>
              ) : (
                paginatedData.map(r => (
                  <tr key={r.id} className="hover:bg-gray-50 transition">
                    <td className="p-4 text-gray-600 whitespace-nowrap">
                       <div>{new Date(r.spendDate).toLocaleDateString()}</div>
                       <div className="text-[10px] text-gray-400">Added {new Date(r.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4 font-medium text-navy-900">{r.vendor}</td>
                    <td className="p-4">
                      <span className="inline-block px-2 py-1 rounded text-xs bg-gray-100 text-gray-600 capitalize">
                        {r.category}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-navy-900">£{r.amount.toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex justify-between items-center">
            <button 
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
            <button 
              disabled={page === totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;