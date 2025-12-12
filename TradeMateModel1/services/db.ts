import { User, Receipt, MonthlyStats } from '../types';

// Mock database keys
const USERS_KEY = 'trademate_users';
const RECEIPTS_KEY = 'trademate_receipts';
const CURRENT_USER_KEY = 'trademate_current_user';

// Helper to generate IDs
const generateId = () => Math.random().toString(36).substr(2, 9);

export const db = {
  // Auth & User Management
  register: (email: string, password: string, name: string): User => {
    // In a real app, hash password here.
    const usersRaw = localStorage.getItem(USERS_KEY);
    const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];
    
    if (users.find((u) => u.email === email)) {
      throw new Error('User already exists');
    }

    const newUser: User = {
      id: generateId(),
      email,
      name: name || email.split('@')[0],
      isPro: false,
    };

    // Store user with "hashed" password (mock)
    users.push({ ...newUser, password: btoa(password) });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return newUser;
  },

  login: (email: string, password: string): User => {
    const usersRaw = localStorage.getItem(USERS_KEY);
    const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];
    
    // Simple mock auth check
    const user = users.find((u) => u.email === email && u.password === btoa(password));
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const { password: _, ...safeUser } = user;
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
    return safeUser;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem(CURRENT_USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  },

  upgradeToPro: (userId: string) => {
     const usersRaw = localStorage.getItem(USERS_KEY);
     const users: any[] = usersRaw ? JSON.parse(usersRaw) : [];
     const updatedUsers = users.map(u => u.id === userId ? { ...u, isPro: true } : u);
     localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
     
     // Update current session
     const currentUser = db.getCurrentUser();
     if (currentUser && currentUser.id === userId) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({ ...currentUser, isPro: true }));
     }
  },

  // Receipt Management
  addReceipt: (receipt: Omit<Receipt, 'id' | 'createdAt'>): Receipt => {
    const receiptsRaw = localStorage.getItem(RECEIPTS_KEY);
    const receipts: Receipt[] = receiptsRaw ? JSON.parse(receiptsRaw) : [];

    const newReceipt: Receipt = {
      ...receipt,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };

    receipts.push(newReceipt);
    localStorage.setItem(RECEIPTS_KEY, JSON.stringify(receipts));
    return newReceipt;
  },

  getReceipts: (userId: string): Receipt[] => {
    const receiptsRaw = localStorage.getItem(RECEIPTS_KEY);
    const receipts: Receipt[] = receiptsRaw ? JSON.parse(receiptsRaw) : [];
    return receipts
      .filter((r) => r.userId === userId)
      .sort((a, b) => new Date(b.spendDate).getTime() - new Date(a.spendDate).getTime());
  },

  getReceiptsForMonth: (userId: string, date: Date): Receipt[] => {
    const receipts = db.getReceipts(userId);
    const start = new Date(date.getFullYear(), date.getMonth(), 1);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
    
    return receipts.filter(r => {
        const d = new Date(r.createdAt); // Limit is based on creation date usually for quotas
        return d >= start && d <= end;
    });
  },

  getStats: (userId: string, monthDate: Date = new Date()): MonthlyStats => {
    // Statistics based on Spend Date for accounting
    const allReceipts = db.getReceipts(userId);
    const currentMonthReceipts = allReceipts.filter(r => {
        const d = new Date(r.spendDate);
        return d.getMonth() === monthDate.getMonth() && d.getFullYear() === monthDate.getFullYear();
    });

    // Quota count uses the current actual calendar month for limit checking, 
    // but here we might want stats for the selected view month. 
    // For dashboard display, we usually want financial totals.
    
    const stats: MonthlyStats = {
      totalSpent: 0,
      totalVat: 0,
      byCategory: {},
      receiptCount: currentMonthReceipts.length 
    };

    currentMonthReceipts.forEach(r => {
      stats.totalSpent += r.amount;
      stats.totalVat += (r.vatAmount || 0);
      stats.byCategory[r.category] = (stats.byCategory[r.category] || 0) + r.amount;
    });

    return stats;
  }
};