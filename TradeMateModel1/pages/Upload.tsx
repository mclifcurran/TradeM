import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../services/db';
import { parseReceiptImage } from '../services/geminiService';
import { ReceiptCategory, ParsedReceiptData } from '../types';

interface ScannedItem {
  id: string; // temp id
  file: File;
  previewUrl: string;
  data: ParsedReceiptData;
  isLoading: boolean;
  isSaved: boolean;
  error?: string;
}

const Upload: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [resetDate, setResetDate] = useState<string>('');

  useEffect(() => {
    const user = db.getCurrentUser();
    if (!user) {
        navigate('/login');
        return;
    }
    const currentMonthCount = db.getReceiptsForMonth(user.id, new Date()).length;
    if (!user.isPro && currentMonthCount >= 10) {
        setQuotaExceeded(true);
    }

    // Calculate reset date (1st of next month)
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    setResetDate(nextMonth.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }));
  }, [navigate]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5); // Limit to 5
      
      const newItems: ScannedItem[] = [];

      for (const file of files) {
        const previewUrl = URL.createObjectURL(file);
        newItems.push({
          id: Math.random().toString(36).substr(2, 9),
          file,
          previewUrl,
          data: {
              vendor: 'Scanning...',
              date: '',
              amount: 0,
              category: 'miscellaneous'
          },
          isLoading: true,
          isSaved: false
        });
      }

      setItems(prev => [...prev, ...newItems]);

      // Process with Gemini
      newItems.forEach(async (item) => {
        try {
            const base64 = await fileToBase64(item.file);
            const result = await parseReceiptImage(base64);
            
            setItems(current => current.map(i => {
                if (i.id === item.id) {
                    if (result.error === 'bad_image') {
                        return { ...i, isLoading: false, error: "We couldn't read that receipt. Please retake the photo." };
                    }
                    return { ...i, isLoading: false, data: result };
                }
                return i;
            }));
        } catch (err) {
            setItems(current => current.map(i => i.id === item.id ? { ...i, isLoading: false, error: "Failed to process image." } : i));
        }
      });
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleUpdateItem = (id: string, field: keyof ParsedReceiptData, value: any) => {
    setItems(prev => prev.map(item => {
        if (item.id === id && !item.isSaved) {
            return { ...item, data: { ...item.data, [field]: value } };
        }
        return item;
    }));
  };

  const handleSave = async (item: ScannedItem) => {
    const user = db.getCurrentUser();
    if (!user) return;
    
    // Final check for empty or invalid data
    if(!item.data.vendor || item.data.amount === 0) {
        alert("Please ensure Vendor and Amount are filled.");
        return;
    }

    try {
        const base64 = await fileToBase64(item.file);
        db.addReceipt({
            userId: user.id,
            imageUrl: base64, // Storing full image in LS is bad practice for prod, but per instructions for this demo structure.
            vendor: item.data.vendor,
            amount: Number(item.data.amount),
            vatAmount: Number(item.data.vat_amount || 0),
            category: item.data.category,
            spendDate: item.data.date || new Date().toISOString(),
        });
        
        setItems(prev => prev.map(i => i.id === item.id ? { ...i, isSaved: true } : i));
    } catch (e) {
        alert("Error saving receipt.");
    }
  };

  const handleRemove = (id: string) => {
      setItems(prev => prev.filter(i => i.id !== id));
  };

  if (quotaExceeded) {
      return (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4 px-4">
              <div className="bg-brand-50 p-6 rounded-full text-brand-600 animate-bounce">
                  <i className="ph-fill ph-lock-key text-5xl"></i>
              </div>
              <h2 className="text-3xl font-bold text-navy-900">Limit Reached</h2>
              <p className="text-gray-600 max-w-xs mx-auto">You've hit your 10 receipt limit for this month. Go Pro to scan unlimited receipts.</p>
              <div className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-medium text-gray-500">
                  Resets automatically on {resetDate}
              </div>
              <button 
                onClick={() => navigate('/settings')}
                className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-brand-500/30 transition transform hover:-translate-y-1"
              >
                  Upgrade to Pro
              </button>
          </div>
      )
  }

  return (
    <div className="pb-10 space-y-6">
        <h2 className="text-3xl font-bold text-navy-900">Upload Receipts</h2>

        {/* Upload Area */}
        {items.length === 0 && (
            <div 
                onClick={() => fileInputRef.current?.click()}
                className="group border-2 border-dashed border-gray-300 rounded-2xl bg-white p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-brand-50 hover:border-brand-400 transition duration-300 min-h-[300px]"
            >
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-brand-100 group-hover:scale-110 transition duration-300">
                    <i className="ph-fill ph-camera text-4xl text-gray-400 group-hover:text-brand-600"></i>
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-2">Snap or Upload</h3>
                <p className="text-gray-500 max-w-sm mx-auto">Tap here to take a photo or select an image file. We'll extract the details automatically.</p>
                <div className="mt-6 flex items-center gap-2 text-xs text-gray-400 uppercase tracking-widest font-semibold">
                    <span>JPG</span>
                    <span>•</span>
                    <span>PNG</span>
                    <span>•</span>
                    <span>PDF</span>
                </div>
            </div>
        )}

        {/* Hidden Input */}
        <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            multiple 
            accept="image/*,application/pdf"
            className="hidden" 
        />

        {/* List of scanned items */}
        <div className="space-y-6">
            {items.map((item) => (
                <div key={item.id} className={`bg-white rounded-xl shadow-md border-2 ${item.isSaved ? 'border-green-500' : 'border-transparent'} overflow-hidden transition-all duration-300`}>
                    
                    {/* Header / Status */}
                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Receipt {items.indexOf(item) + 1}</span>
                        {item.isSaved ? (
                            <span className="text-green-600 text-xs font-bold flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full"><i className="ph-fill ph-check-circle"></i> SAVED</span>
                        ) : (
                            <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700 bg-white hover:bg-red-50 border border-red-100 p-1.5 rounded-lg transition" title="Remove">
                                <i className="ph-bold ph-trash"></i>
                            </button>
                        )}
                    </div>

                    <div className="p-5 flex flex-col md:flex-row gap-6">
                        {/* Image Preview */}
                        <div className="w-full md:w-1/3 shrink-0">
                            <div className="relative group">
                                <img src={item.previewUrl} alt="Receipt" className="w-full h-64 object-cover rounded-xl border border-gray-200 shadow-sm" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-xl">
                                    <a href={item.previewUrl} target="_blank" rel="noreferrer" className="text-white text-sm font-bold border border-white px-4 py-2 rounded-lg hover:bg-white hover:text-black transition">
                                        View Full Size
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Form / Loading State */}
                        <div className="w-full md:w-2/3 space-y-4">
                            {item.isLoading ? (
                                <div className="h-full flex flex-col items-center justify-center space-y-4 py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <div className="relative">
                                        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <i className="ph-fill ph-sparkle text-brand-600 text-xs"></i>
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-600 animate-pulse">Analysing receipt...</p>
                                </div>
                            ) : item.error ? (
                                <div className="bg-red-50 text-red-600 p-6 rounded-xl flex flex-col items-center text-center gap-2 border border-red-100">
                                    <i className="ph-fill ph-warning-circle text-4xl"></i>
                                    <p className="font-bold">Couldn't read receipt</p>
                                    <p className="text-sm">{item.error}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Vendor</label>
                                            <div className="relative">
                                                <i className="ph-bold ph-storefront absolute left-3 top-3 text-gray-400"></i>
                                                <input 
                                                    type="text" 
                                                    disabled={item.isSaved}
                                                    value={item.data.vendor} 
                                                    onChange={(e) => handleUpdateItem(item.id, 'vendor', e.target.value)}
                                                    className="w-full pl-9 p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none disabled:bg-gray-100 disabled:text-gray-500 font-medium text-navy-900" 
                                                    placeholder="e.g. Screwfix"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Date</label>
                                            <input 
                                                type="date" 
                                                disabled={item.isSaved}
                                                value={item.data.date} 
                                                onChange={(e) => handleUpdateItem(item.id, 'date', e.target.value)}
                                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none disabled:bg-gray-100 disabled:text-gray-500" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Category</label>
                                            <select 
                                                disabled={item.isSaved}
                                                value={item.data.category} 
                                                onChange={(e) => handleUpdateItem(item.id, 'category', e.target.value)}
                                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none bg-white disabled:bg-gray-100 disabled:text-gray-500 capitalize"
                                            >
                                                {Object.values(ReceiptCategory).map(cat => (
                                                    <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">Amount (£)</label>
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                disabled={item.isSaved}
                                                value={item.data.amount} 
                                                onChange={(e) => handleUpdateItem(item.id, 'amount', parseFloat(e.target.value))}
                                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none disabled:bg-gray-100 disabled:text-gray-500 font-bold" 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">VAT (£)</label>
                                            <input 
                                                type="number" 
                                                step="0.01"
                                                disabled={item.isSaved}
                                                value={item.data.vat_amount || 0} 
                                                onChange={(e) => handleUpdateItem(item.id, 'vat_amount', parseFloat(e.target.value))}
                                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none disabled:bg-gray-100 disabled:text-gray-500" 
                                            />
                                        </div>
                                    </div>
                                    {!item.isSaved && (
                                        <button 
                                            onClick={() => handleSave(item)}
                                            className="w-full mt-4 bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-500/20 transform active:scale-95 flex items-center justify-center gap-2"
                                        >
                                            <i className="ph-bold ph-check"></i>
                                            Confirm & Save
                                        </button>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            ))}
        </div>
        
        {items.length > 0 && (
             <div className="mt-8 text-center pb-8">
                 <button onClick={() => fileInputRef.current?.click()} className="text-brand-600 font-bold hover:text-brand-700 flex items-center justify-center gap-2 mx-auto border-2 border-brand-100 hover:border-brand-200 px-6 py-3 rounded-full transition">
                     <i className="ph-bold ph-plus"></i>
                     Add more receipts
                 </button>
             </div>
        )}
    </div>
  );
};

export default Upload;