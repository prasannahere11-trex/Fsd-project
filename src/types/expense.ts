export type PaymentMethod = 'cash' | 'card' | 'upi';

export interface Expense {
  id: string;
  amountInCents: number; // Integer representation (e.g., ₹250.50 -> 25050 paise)
  categoryId: string;
  description: string;
  date: string; // ISO date string YYYY-MM-DD
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: number; // Epoch timestamp ms
}

export interface Category {
  id: string;
  name: string;
  icon: string; // Lucide icon identifier
  color: string; // Main brand hex
  bgColor: string; // Subtle surface color for tags
  budgetInCents: number; // Monthly budget limit in cents (0 = no budget)
  isDefault?: boolean;
}

export type SortField = 'date' | 'amount';
export type SortOrder = 'asc' | 'desc';
export type ActiveTab = 'dashboard' | 'transactions' | 'budgets' | 'analytics';

export interface FilterState {
  search: string;
  categoryIds: string[];
  paymentMethods: PaymentMethod[];
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  sortBy: SortField;
  sortOrder: SortOrder;
  minAmountInCents?: number;
  maxAmountInCents?: number;
}

export interface CategoryBreakdownItem {
  categoryId: string;
  categoryName: string;
  color: string;
  icon: string;
  totalInCents: number;
  percentage: number;
  count: number;
  budgetInCents: number;
}

export interface DailySpendPoint {
  date: string; // YYYY-MM-DD
  displayDate: string; // "14 Sep"
  amountInCents: number;
  cumulativeInCents: number;
}

export interface MonthComparisonItem {
  monthKey: string; // "2026-09"
  label: string;    // "Sep 2026"
  shortLabel: string; // "Sep"
  totalInCents: number;
  count: number;
  isCurrentMonth: boolean;
}
