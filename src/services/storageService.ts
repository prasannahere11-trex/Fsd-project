import type { Expense, Category, PaymentMethod } from '../types/expense';
import { DEFAULT_CATEGORIES } from '../constants/categories';
import { format, subDays } from 'date-fns';

const STORAGE_KEYS = {
  EXPENSES: 'ledger_expenses_v1',
  CATEGORIES: 'ledger_categories_v1',
  THEME: 'ledger_theme',
  CURRENCY: 'ledger_currency',
};

// Seed realistic dataset spanning 4 months leading up to current date
export function generateSampleData(): { expenses: Expense[]; categories: Category[] } {
  const categories = [...DEFAULT_CATEGORIES];
  const expenses: Expense[] = [];

  const baseDate = new Date(); // Current system date
  
  // Helper to create date string YYYY-MM-DD
  const makeDate = (d: Date) => format(d, 'yyyy-MM-dd');

  // Sample recurring and realistic transaction blueprints
  const blueprints: Array<{
    desc: string;
    catId: string;
    amountCentsRange: [number, number];
    method: PaymentMethod;
    frequency: 'daily' | 'few-days' | 'weekly' | 'monthly';
  }> = [
    { desc: 'Morning Cold Brew & Croissant', catId: 'cat_food', amountCentsRange: [28000, 42000], method: 'upi', frequency: 'few-days' },
    { desc: 'Weekly Supermarket Groceries', catId: 'cat_food', amountCentsRange: [180000, 320000], method: 'card', frequency: 'weekly' },
    { desc: 'Artisanal Sourdough & Pantry', catId: 'cat_food', amountCentsRange: [45000, 85000], method: 'upi', frequency: 'weekly' },
    { desc: 'Dinner at O Pedro / Bistro', catId: 'cat_food', amountCentsRange: [140000, 260000], method: 'card', frequency: 'weekly' },
    { desc: 'Office Cafeteria Lunch', catId: 'cat_food', amountCentsRange: [15000, 28000], method: 'upi', frequency: 'daily' },
    
    { desc: 'Uber Ride to Workspace', catId: 'cat_transport', amountCentsRange: [22000, 45000], method: 'upi', frequency: 'few-days' },
    { desc: 'Fuel Refill & Shell Premium', catId: 'cat_transport', amountCentsRange: [150000, 250000], method: 'card', frequency: 'weekly' },
    { desc: 'Metro Card Auto-Recharge', catId: 'cat_transport', amountCentsRange: [50000, 100000], method: 'upi', frequency: 'weekly' },
    
    { desc: 'Amazon Pantry & Household Supplies', catId: 'cat_shopping', amountCentsRange: [120000, 280000], method: 'card', frequency: 'weekly' },
    { desc: 'Uniqlo Oxford Shirts & Tee', catId: 'cat_shopping', amountCentsRange: [249000, 499000], method: 'card', frequency: 'monthly' },
    { desc: 'Books from Midland Bookstore', catId: 'cat_shopping', amountCentsRange: [85000, 160000], method: 'upi', frequency: 'few-days' },
    
    { desc: 'High-Speed Fiber Internet Bill', catId: 'cat_bills', amountCentsRange: [119900, 149900], method: 'upi', frequency: 'monthly' },
    { desc: 'Electricity & Utility Charges', catId: 'cat_bills', amountCentsRange: [320000, 480000], method: 'upi', frequency: 'monthly' },
    { desc: 'Mobile Postpaid Plan', catId: 'cat_bills', amountCentsRange: [79900, 99900], method: 'upi', frequency: 'monthly' },
    { desc: 'Apartment Maintenance Charge', catId: 'cat_bills', amountCentsRange: [250000, 350000], method: 'upi', frequency: 'monthly' },
    
    { desc: 'Spotify Premium Family Plan', catId: 'cat_entertainment', amountCentsRange: [19900, 19900], method: 'card', frequency: 'monthly' },
    { desc: 'Netflix 4K Ultra Subscription', catId: 'cat_entertainment', amountCentsRange: [64900, 64900], method: 'card', frequency: 'monthly' },
    { desc: 'PVR IMAX Weekend Cinema Tickets', catId: 'cat_entertainment', amountCentsRange: [90000, 160000], method: 'upi', frequency: 'few-days' },
    
    { desc: 'Monthly Gym Membership & Access', catId: 'cat_health', amountCentsRange: [250000, 250000], method: 'card', frequency: 'monthly' },
    { desc: 'Pharmacy Vitamins & Supplements', catId: 'cat_health', amountCentsRange: [65000, 140000], method: 'upi', frequency: 'weekly' },
    
    { desc: 'Google One Cloud Storage Plan', catId: 'cat_other', amountCentsRange: [13000, 13000], method: 'card', frequency: 'monthly' },
    { desc: 'Special Birthday Gift for Sibling', catId: 'cat_other', amountCentsRange: [220000, 350000], method: 'card', frequency: 'monthly' },
    { desc: 'Local Dry Cleaning & Laundry', catId: 'cat_other', amountCentsRange: [45000, 90000], method: 'cash', frequency: 'few-days' },
  ];

  let idCounter = 1;

  // Generate for past 105 days (approx 3.5 months)
  for (let i = 105; i >= 0; i--) {
    const dayDate = subDays(baseDate, i);
    const dayOfWeek = dayDate.getDay();
    const dayOfMonth = dayDate.getDate();

    blueprints.forEach((bp) => {
      let shouldAdd = false;

      if (bp.frequency === 'daily' && (dayOfWeek >= 1 && dayOfWeek <= 5)) {
        shouldAdd = Math.random() < 0.7;
      } else if (bp.frequency === 'few-days') {
        shouldAdd = Math.random() < 0.35;
      } else if (bp.frequency === 'weekly') {
        if (dayOfWeek === 6 || dayOfWeek === 0 || dayOfWeek === 3) {
          shouldAdd = Math.random() < 0.45;
        }
      } else if (bp.frequency === 'monthly') {
        if (dayOfMonth === 2 || dayOfMonth === 15) {
          shouldAdd = true;
        }
      }

      if (shouldAdd) {
        const [min, max] = bp.amountCentsRange;
        const randomAmount = Math.floor(min + Math.random() * (max - min));
        const roundedAmount = Math.round(randomAmount / 1000) * 1000;

        expenses.push({
          id: `seed_exp_${idCounter++}`,
          amountInCents: Math.max(roundedAmount, min),
          categoryId: bp.catId,
          description: bp.desc,
          date: makeDate(dayDate),
          paymentMethod: bp.method,
          createdAt: dayDate.getTime() + (idCounter * 1000),
        });
      }
    });
  }

  // Sort descending by date
  expenses.sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

  return { expenses, categories };
}

export const storageService = {
  // --- Expenses ---
  getExpenses(): Expense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (!data) {
        const seed = generateSampleData();
        this.saveExpenses(seed.expenses);
        this.saveCategories(seed.categories);
        return seed.expenses;
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch (e) {
      console.error('Failed to load expenses from localStorage:', e);
      return [];
    }
  },

  saveExpenses(expenses: Expense[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed to save expenses to localStorage:', e);
    }
  },

  addExpense(expense: Omit<Expense, 'id' | 'createdAt'>): Expense {
    const expenses = this.getExpenses();
    const newExpense: Expense = {
      ...expense,
      id: 'exp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      createdAt: Date.now(),
    };
    const updated = [newExpense, ...expenses];
    this.saveExpenses(updated);
    return newExpense;
  },

  updateExpense(id: string, updates: Partial<Omit<Expense, 'id' | 'createdAt'>>): Expense | null {
    const expenses = this.getExpenses();
    const index = expenses.findIndex((e) => e.id === id);
    if (index === -1) return null;

    const updatedExpense: Expense = {
      ...expenses[index],
      ...updates,
    };
    expenses[index] = updatedExpense;
    this.saveExpenses(expenses);
    return updatedExpense;
  },

  deleteExpense(id: string): boolean {
    const expenses = this.getExpenses();
    const filtered = expenses.filter((e) => e.id !== id);
    if (filtered.length === expenses.length) return false;
    this.saveExpenses(filtered);
    return true;
  },

  // --- Categories ---
  getCategories(): Category[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
      if (!data) {
        this.saveCategories(DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
      }
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        return DEFAULT_CATEGORIES;
      }
      return parsed;
    } catch (e) {
      console.error('Failed to load categories:', e);
      return DEFAULT_CATEGORIES;
    }
  },

  saveCategories(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories:', e);
    }
  },

  addCategory(category: Omit<Category, 'id'>): Category {
    const categories = this.getCategories();
    const newCat: Category = {
      ...category,
      id: 'cat_custom_' + Date.now(),
      isDefault: false,
    };
    const updated = [...categories, newCat];
    this.saveCategories(updated);
    return newCat;
  },

  updateCategory(id: string, updates: Partial<Omit<Category, 'id'>>): Category | null {
    const categories = this.getCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const updated = {
      ...categories[index],
      ...updates,
    };
    categories[index] = updated;
    this.saveCategories(categories);
    return updated;
  },

  deleteCategory(id: string): boolean {
    const categories = this.getCategories();
    const target = categories.find((c) => c.id === id);
    if (!target || target.isDefault) return false;

    const filtered = categories.filter((c) => c.id !== id);
    this.saveCategories(filtered);

    // Reassign any expenses belonging to deleted category to 'cat_other'
    const expenses = this.getExpenses();
    let hasChanges = false;
    const remapped = expenses.map((exp) => {
      if (exp.categoryId === id) {
        hasChanges = true;
        return { ...exp, categoryId: 'cat_other' };
      }
      return exp;
    });
    if (hasChanges) {
      this.saveExpenses(remapped);
    }

    return true;
  },

  // --- Reset & Export ---
  resetToSampleData(): { expenses: Expense[]; categories: Category[] } {
    const sample = generateSampleData();
    this.saveExpenses(sample.expenses);
    this.saveCategories(sample.categories);
    return sample;
  },

  clearAllData(): void {
    this.saveExpenses([]);
    this.saveCategories(DEFAULT_CATEGORIES);
  },

  exportToCSV(expenses: Expense[], categories: Category[]): void {
    const catMap = new Map(categories.map((c) => [c.id, c.name]));
    
    const headers = ['Date', 'Description', 'Category', 'Payment Method', 'Amount', 'Amount (Paise/Cents)', 'Notes'];
    const rows = expenses.map((e) => {
      const catName = catMap.get(e.categoryId) || 'Uncategorized';
      const formattedAmount = (e.amountInCents / 100).toFixed(2);
      const cleanDesc = `"${(e.description || '').replace(/"/g, '""')}"`;
      const cleanNotes = `"${(e.notes || '').replace(/"/g, '""')}"`;
      
      return [
        e.date,
        cleanDesc,
        `"${catName}"`,
        e.paymentMethod.toUpperCase(),
        formattedAmount,
        e.amountInCents,
        cleanNotes,
      ].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ledger_expenses_export_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // --- Preferences ---
  getTheme(): 'light' | 'dark' {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  },

  setTheme(theme: 'light' | 'dark'): void {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Failed to set theme:', e);
    }
  },

  getCurrency(): string {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENCY) || 'INR';
    } catch {
      return 'INR';
    }
  },

  setCurrency(code: string): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, code);
    } catch (e) {
      console.error('Failed to set currency:', e);
    }
  },
};
