export interface User {
  id: string;
  email: string;
  name: string;
  isPro: boolean;
}

export enum ReceiptCategory {
  Fuel = 'fuel',
  Materials = 'materials',
  Tools = 'tools',
  Food = 'food',
  Hotel = 'hotel',
  Travel = 'travel',
  Training = 'training',
  Miscellaneous = 'miscellaneous',
}

export interface Receipt {
  id: string;
  userId: string;
  imageUrl: string;
  vendor: string;
  amount: number;
  vatAmount?: number;
  category: ReceiptCategory | string;
  spendDate: string; // ISO Date string
  createdAt: string; // ISO Timestamp
}

export interface ParsedReceiptData {
  vendor: string;
  date: string;
  amount: number;
  vat_amount?: number;
  category: string;
  error?: string;
}

export interface MonthlyStats {
  totalSpent: number;
  totalVat: number;
  byCategory: Record<string, number>;
  receiptCount: number;
}