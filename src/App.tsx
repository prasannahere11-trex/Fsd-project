import { useState, useEffect, useMemo } from 'react';
import type { Expense, Category, ActiveTab } from './types/expense';
import { storageService } from './services/storageService';
import { Header } from './components/layout/Header';
import { Dashboard } from './components/dashboard/Dashboard';
import { TransactionsView } from './components/transactions/TransactionsView';
import { BudgetView } from './components/budget/BudgetView';
import { MonthlyComparisonView } from './components/analytics/MonthlyComparisonView';
import { ExpenseModal } from './components/modals/ExpenseModal';
import { CategoryModal } from './components/modals/CategoryModal';
import { DeleteConfirmModal } from './components/modals/DeleteConfirmModal';
import { ToastContainer } from './components/common/Toast';
import type { ToastMessage } from './components/common/Toast';
import { Plus } from 'lucide-react';
import { format, subMonths, parseISO } from 'date-fns';

export function App() {
  // Application Data States
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currency, setCurrency] = useState<string>('INR');

  // Active Month for Dashboard & Budgets
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    return format(new Date(), 'yyyy-MM');
  });

  // Modal and Interaction States
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [targetCategoryFilter, setTargetCategoryFilter] = useState<string | undefined>(undefined);
  const [deleteModalConfig, setDeleteModalConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Initial Load & Hydration
  useEffect(() => {
    const loadedExpenses = storageService.getExpenses();
    const loadedCategories = storageService.getCategories();
    const currentTheme = storageService.getTheme();
    const currentCurrency = storageService.getCurrency();

    setExpenses(loadedExpenses);
    setCategories(loadedCategories);
    setTheme(currentTheme);
    setCurrency(currentCurrency);

    if (currentTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  // Theme Toggle
  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    storageService.setTheme(nextTheme);
    addToast('info', `Switched to ${nextTheme} theme`);
  };

  // Currency change
  const handleCurrencyChange = (newCurr: string) => {
    setCurrency(newCurr);
    storageService.setCurrency(newCurr);
    addToast('success', `Currency set to ${newCurr}`);
  };

  // Available Months for dropdown (Last 12 months)
  const availableMonths = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = subMonths(now, i);
      months.push({
        value: format(d, 'yyyy-MM'),
        label: format(d, 'MMMM yyyy'),
      });
    }
    return months;
  }, []);

  // Current Month Label
  const selectedMonthLabel = useMemo(() => {
    try {
      const parsed = parseISO(`${selectedMonth}-01`);
      return format(parsed, 'MMMM yyyy');
    } catch {
      return selectedMonth;
    }
  }, [selectedMonth]);

  // Expenses partition for current and previous month
  const currentMonthExpenses = useMemo(() => {
    return expenses.filter((e) => e.date.startsWith(selectedMonth));
  }, [expenses, selectedMonth]);

  const previousMonthExpenses = useMemo(() => {
    try {
      const parsed = parseISO(`${selectedMonth}-01`);
      const prev = subMonths(parsed, 1);
      const prevKey = format(prev, 'yyyy-MM');
      return expenses.filter((e) => e.date.startsWith(prevKey));
    } catch {
      return [];
    }
  }, [expenses, selectedMonth]);

  // Expense Handlers
  const handleSaveExpense = (
    expenseData: Omit<Expense, 'id' | 'createdAt'>,
    expenseId?: string
  ) => {
    if (expenseId) {
      const updated = storageService.updateExpense(expenseId, expenseData);
      if (updated) {
        setExpenses((prev) => prev.map((e) => (e.id === expenseId ? updated : e)));
        addToast('success', 'Transaction updated in ledger');
      }
    } else {
      const created = storageService.addExpense(expenseData);
      setExpenses((prev) => [created, ...prev]);
      addToast('success', 'New expense logged successfully');
    }
  };

  const handleOpenEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsExpenseModalOpen(true);
  };

  const handleDeleteExpensePrompt = (expenseId: string) => {
    const target = expenses.find((e) => e.id === expenseId);
    setDeleteModalConfig({
      isOpen: true,
      title: 'Delete Ledger Entry',
      message: `Are you sure you want to delete "${target?.description || 'this expense'}"? This action cannot be undone.`,
      onConfirm: () => {
        storageService.deleteExpense(expenseId);
        setExpenses((prev) => prev.filter((e) => e.id !== expenseId));
        setDeleteModalConfig((prev) => ({ ...prev, isOpen: false }));
        addToast('info', 'Transaction deleted');
      },
    });
  };

  // Category Handlers
  const handleAddCategory = (categoryData: Omit<Category, 'id'>) => {
    const created = storageService.addCategory(categoryData);
    setCategories((prev) => [...prev, created]);
    addToast('success', `Category "${created.name}" created`);
  };

  const handleUpdateCategory = (id: string, updates: Partial<Omit<Category, 'id'>>) => {
    const updated = storageService.updateCategory(id, updates);
    if (updated) {
      setCategories((prev) => prev.map((c) => (c.id === id ? updated : c)));
      addToast('success', `Category "${updated.name}" updated`);
    }
  };

  const handleUpdateCategoryBudget = (categoryId: string, budgetInCents: number) => {
    const updated = storageService.updateCategory(categoryId, { budgetInCents });
    if (updated) {
      setCategories((prev) => prev.map((c) => (c.id === categoryId ? updated : c)));
      addToast('success', `Budget target updated for ${updated.name}`);
    }
  };

  const handleDeleteCategoryPrompt = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;

    setDeleteModalConfig({
      isOpen: true,
      title: 'Delete Category',
      message: `Delete "${cat.name}"? Any transactions assigned to this category will automatically be re-categorized as "Other".`,
      onConfirm: () => {
        storageService.deleteCategory(id);
        setCategories((prev) => prev.filter((c) => c.id !== id));
        setExpenses(storageService.getExpenses());
        setDeleteModalConfig((prev) => ({ ...prev, isOpen: false }));
        addToast('info', `Category "${cat.name}" removed`);
      },
    });
  };

  // Export CSV Handler
  const handleExportCSV = () => {
    if (expenses.length === 0) {
      addToast('error', 'No expenses available to export');
      return;
    }
    storageService.exportToCSV(expenses, categories);
    addToast('success', `Exported ${expenses.length} records to CSV`);
  };

  // Reset Data Handler
  const handleResetPrompt = () => {
    setDeleteModalConfig({
      isOpen: true,
      title: 'Reset to Sample Data',
      message: 'This will replace all current ledger records with 3+ months of realistic curated sample expenses. Continue?',
      onConfirm: () => {
        const sample = storageService.resetToSampleData();
        setExpenses(sample.expenses);
        setCategories(sample.categories);
        setDeleteModalConfig((prev) => ({ ...prev, isOpen: false }));
        addToast('success', 'Reset ledger to 3+ months of realistic sample data');
      },
    });
  };

  // Navigate to transactions view with category filter
  const handleViewTransactions = (categoryId?: string) => {
    setTargetCategoryFilter(categoryId);
    setActiveTab('transactions');
  };

  return (
    <div className="min-h-screen bg-paper-light dark:bg-darkpaper-bg transition-colors flex flex-col font-sans">
      {/* 1. Global Navigation Header */}
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'transactions') {
            setTargetCategoryFilter(undefined);
          }
        }}
        onOpenAddExpense={() => {
          setEditingExpense(null);
          setIsExpenseModalOpen(true);
        }}
        onOpenCategories={() => setIsCategoryModalOpen(true)}
        onExportCSV={handleExportCSV}
        onResetData={handleResetPrompt}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        availableMonths={availableMonths}
      />

      {/* 2. Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'dashboard' && (
          <Dashboard
            currentMonthExpenses={currentMonthExpenses}
            previousMonthExpenses={previousMonthExpenses}
            categories={categories}
            currencyCode={currency}
            selectedMonthLabel={selectedMonthLabel}
            onOpenAddExpense={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            onViewTransactions={handleViewTransactions}
            onViewBudgets={() => setActiveTab('budgets')}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsView
            expenses={expenses}
            categories={categories}
            currencyCode={currency}
            onEditExpense={handleOpenEditExpense}
            onDeleteExpense={handleDeleteExpensePrompt}
            onOpenAddExpense={() => {
              setEditingExpense(null);
              setIsExpenseModalOpen(true);
            }}
            initialCategoryId={targetCategoryFilter}
          />
        )}

        {activeTab === 'budgets' && (
          <BudgetView
            expenses={currentMonthExpenses}
            categories={categories}
            currencyCode={currency}
            selectedMonthLabel={selectedMonthLabel}
            onUpdateCategoryBudget={handleUpdateCategoryBudget}
            onOpenCategories={() => setIsCategoryModalOpen(true)}
          />
        )}

        {activeTab === 'analytics' && (
          <MonthlyComparisonView
            allExpenses={expenses}
            currencyCode={currency}
            onSelectMonth={(monthKey) => {
              setSelectedMonth(monthKey);
              setActiveTab('dashboard');
              addToast('info', `Switched period to ${monthKey}`);
            }}
          />
        )}
      </main>

      {/* 3. Mobile Floating Action Button (FAB) */}
      <div className="sm:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            setEditingExpense(null);
            setIsExpenseModalOpen(true);
          }}
          className="w-14 h-14 rounded-full bg-forest hover:bg-forest-dark text-paper-light flex items-center justify-center shadow-modal active:scale-95 transition-transform"
          aria-label="Add expense"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* 4. Modals */}
      <ExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => {
          setIsExpenseModalOpen(false);
          setEditingExpense(null);
        }}
        onSave={handleSaveExpense}
        categories={categories}
        editingExpense={editingExpense}
        currencyCode={currency}
      />

      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onUpdateCategory={handleUpdateCategory}
        onDeleteCategory={handleDeleteCategoryPrompt}
        currencyCode={currency}
      />

      <DeleteConfirmModal
        isOpen={deleteModalConfig.isOpen}
        title={deleteModalConfig.title}
        message={deleteModalConfig.message}
        onConfirm={deleteModalConfig.onConfirm}
        onCancel={() => setDeleteModalConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* 5. Toasts Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}

export default App;
