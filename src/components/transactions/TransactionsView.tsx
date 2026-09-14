import React, { useState, useMemo } from 'react';
import {
  Search,
  Edit2,
  Trash2,
  X,
  Filter,
  CreditCard,
  Smartphone,
  Banknote,
  Receipt,
  RotateCcw,
} from 'lucide-react';
import type { Expense, Category, PaymentMethod, SortField, SortOrder } from '../../types/expense';
import { formatCurrency, formatGroupDate } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';

interface TransactionsViewProps {
  expenses: Expense[];
  categories: Category[];
  currencyCode: string;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onOpenAddExpense: () => void;
  initialCategoryId?: string;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  expenses,
  categories,
  currencyCode,
  onEditExpense,
  onDeleteExpense,
  onOpenAddExpense,
  initialCategoryId,
}) => {
  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialCategoryId ? [initialCategoryId] : []
  );
  const [selectedMethods, setSelectedMethods] = useState<PaymentMethod[]>([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);

  // Category map for quick lookups
  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c]));
  }, [categories]);

  // Filter & sort logic (memoized to keep typing ultra smooth)
  const filteredExpenses = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return expenses.filter((exp) => {
      // Search matches description or notes or category name
      if (q) {
        const cat = categoryMap.get(exp.categoryId);
        const matchDesc = exp.description.toLowerCase().includes(q);
        const matchNotes = exp.notes ? exp.notes.toLowerCase().includes(q) : false;
        const matchCat = cat ? cat.name.toLowerCase().includes(q) : false;
        if (!matchDesc && !matchNotes && !matchCat) return false;
      }

      // Category filter
      if (selectedCategories.length > 0 && !selectedCategories.includes(exp.categoryId)) {
        return false;
      }

      // Payment method filter
      if (selectedMethods.length > 0 && !selectedMethods.includes(exp.paymentMethod)) {
        return false;
      }

      // Date range filters
      if (startDate && exp.date < startDate) return false;
      if (endDate && exp.date > endDate) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'date') {
        const diff = a.date.localeCompare(b.date);
        return sortOrder === 'asc' ? diff : -diff;
      } else {
        const diff = a.amountInCents - b.amountInCents;
        return sortOrder === 'asc' ? diff : -diff;
      }
    });
  }, [expenses, searchQuery, selectedCategories, selectedMethods, startDate, endDate, sortBy, sortOrder, categoryMap]);

  // Group filtered expenses by date
  const groupedByDate = useMemo(() => {
    const groups: Array<{ date: string; displayHeader: string; items: Expense[]; totalCents: number }> = [];
    const dateMap = new Map<string, Expense[]>();

    filteredExpenses.forEach((exp) => {
      const list = dateMap.get(exp.date) || [];
      list.push(exp);
      dateMap.set(exp.date, list);
    });

    dateMap.forEach((items, date) => {
      const totalCents = items.reduce((acc, curr) => acc + curr.amountInCents, 0);
      groups.push({
        date,
        displayHeader: formatGroupDate(date),
        items,
        totalCents,
      });
    });

    return groups;
  }, [filteredExpenses]);

  // Total filtered summary
  const totalFilteredCents = useMemo(() => {
    return filteredExpenses.reduce((acc, e) => acc + e.amountInCents, 0);
  }, [filteredExpenses]);

  const toggleCategoryFilter = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const toggleMethodFilter = (method: PaymentMethod) => {
    setSelectedMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method]
    );
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategories([]);
    setSelectedMethods([]);
    setStartDate('');
    setEndDate('');
    setSortBy('date');
    setSortOrder('desc');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategories.length > 0 ||
    selectedMethods.length > 0 ||
    startDate !== '' ||
    endDate !== '';

  const getMethodIcon = (method: PaymentMethod) => {
    switch (method) {
      case 'upi':
        return <Smartphone className="w-3.5 h-3.5" />;
      case 'card':
        return <CreditCard className="w-3.5 h-3.5" />;
      case 'cash':
        return <Banknote className="w-3.5 h-3.5" />;
    }
  };

  return (
    <div className="space-y-5 animate-fade-in pb-12">
      {/* 1. Header with Search, Sort, and Filter Controls */}
      <div className="ledger-card p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Debounced Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-ink-muted absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search expenses by payee, note, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-sm bg-paper-muted/60 dark:bg-darkpaper-muted/60 border border-paper-border dark:border-darkpaper-border rounded-xl text-ink-primary dark:text-darkink-primary placeholder:text-ink-light dark:placeholder:text-darkink-muted focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-ink-muted hover:text-ink-primary"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Right Action Tools: Sort & Filters */}
          <div className="flex items-center space-x-2">
            {/* Sort field dropdown */}
            <div className="flex items-center bg-paper-muted dark:bg-darkpaper-muted border border-paper-border dark:border-darkpaper-border rounded-xl p-1">
              <button
                onClick={() => {
                  if (sortBy === 'date') {
                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  } else {
                    setSortBy('date');
                    setSortOrder('desc');
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                  sortBy === 'date'
                    ? 'bg-paper-card dark:bg-darkpaper-card text-ink-primary dark:text-darkink-primary shadow-subtle font-semibold'
                    : 'text-ink-secondary dark:text-darkink-secondary hover:text-ink-primary'
                }`}
                title="Sort by Date"
              >
                <span>Date</span>
                {sortBy === 'date' && (
                  <span className="text-[10px] font-mono">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                )}
              </button>

              <button
                onClick={() => {
                  if (sortBy === 'amount') {
                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  } else {
                    setSortBy('amount');
                    setSortOrder('desc');
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                  sortBy === 'amount'
                    ? 'bg-paper-card dark:bg-darkpaper-card text-ink-primary dark:text-darkink-primary shadow-subtle font-semibold'
                    : 'text-ink-secondary dark:text-darkink-secondary hover:text-ink-primary'
                }`}
                title="Sort by Amount"
              >
                <span>Amount</span>
                {sortBy === 'amount' && (
                  <span className="text-[10px] font-mono">{sortOrder === 'desc' ? '↓' : '↑'}</span>
                )}
              </button>
            </div>

            {/* Filter Drawer Toggle */}
            <button
              onClick={() => setShowFilterDrawer(!showFilterDrawer)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border flex items-center space-x-1.5 transition-all ${
                showFilterDrawer || hasActiveFilters
                  ? 'border-forest bg-forest/10 text-forest dark:bg-forest/20 dark:text-forest-light font-semibold'
                  : 'border-paper-border dark:border-darkpaper-border text-ink-secondary dark:text-darkink-secondary hover:bg-paper-muted'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>Filters</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-forest animate-pulse" />
              )}
            </button>
          </div>
        </div>

        {/* Expandable Filter drawer */}
        {showFilterDrawer && (
          <div className="pt-3 border-t border-paper-borderSubtle dark:border-darkpaper-borderSubtle space-y-4 animate-slide-down">
            {/* Category pills */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted dark:text-darkink-muted mb-2">
                Filter by Category
              </label>
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleCategoryFilter(cat.id)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all border ${
                        isSelected
                          ? 'border-forest bg-forest text-paper-light font-semibold shadow-subtle'
                          : 'border-paper-border dark:border-darkpaper-border bg-paper-card dark:bg-darkpaper-card text-ink-secondary dark:text-darkink-secondary hover:border-ink-muted'
                      }`}
                    >
                      <CategoryIcon name={cat.icon} className="w-3 h-3" />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Method + Date Range row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Payment Methods */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted dark:text-darkink-muted mb-2">
                  Payment Method
                </label>
                <div className="flex space-x-2">
                  {(['upi', 'card', 'cash'] as PaymentMethod[]).map((m) => {
                    const isSelected = selectedMethods.includes(m);
                    return (
                      <button
                        key={m}
                        onClick={() => toggleMethodFilter(m)}
                        className={`px-3 py-1 rounded-lg text-xs font-medium uppercase transition-all border ${
                          isSelected
                            ? 'border-forest bg-forest text-paper-light font-semibold shadow-subtle'
                            : 'border-paper-border dark:border-darkpaper-border bg-paper-card dark:bg-darkpaper-card text-ink-secondary dark:text-darkink-secondary'
                        }`}
                      >
                        {m}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Date Range Inputs */}
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-muted dark:text-darkink-muted mb-2">
                  Date Range
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-lg text-ink-primary dark:text-darkink-primary focus:outline-none"
                    title="Start Date"
                  />
                  <span className="text-ink-muted text-xs">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-2.5 py-1 text-xs bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-lg text-ink-primary dark:text-darkink-primary focus:outline-none"
                    title="End Date"
                  />
                </div>
              </div>
            </div>

            {/* Clear Filters CTA */}
            {hasActiveFilters && (
              <div className="flex justify-end pt-1">
                <button
                  onClick={clearAllFilters}
                  className="text-xs text-terracotta hover:underline font-medium flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset all filters</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active Filters Summary Bar */}
        <div className="flex items-center justify-between text-xs text-ink-muted dark:text-darkink-muted pt-1 border-t border-paper-borderSubtle dark:border-darkpaper-borderSubtle">
          <span>
            Showing <strong className="text-ink-primary dark:text-darkink-primary">{filteredExpenses.length}</strong> transactions
          </span>
          <span>
            Total:{' '}
            <strong className="font-serif text-ink-primary dark:text-darkink-primary text-sm">
              {formatCurrency(totalFilteredCents, currencyCode)}
            </strong>
          </span>
        </div>
      </div>

      {/* 2. Grouped Transaction Stream */}
      {filteredExpenses.length === 0 ? (
        <div className="ledger-card p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-paper-muted dark:bg-darkpaper-muted flex items-center justify-center text-ink-muted mx-auto mb-3">
            <Receipt className="w-5 h-5 opacity-60" />
          </div>
          <h3 className="font-serif font-bold text-base text-ink-primary dark:text-darkink-primary mb-1">
            No matching transactions found
          </h3>
          <p className="text-xs text-ink-muted dark:text-darkink-muted max-w-sm mx-auto mb-4">
            Try adjusting your search query, clear active filters, or record a new expense.
          </p>
          {hasActiveFilters ? (
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-medium border border-paper-border dark:border-darkpaper-border hover:bg-paper-muted transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Filter Criteria</span>
            </button>
          ) : (
            <button
              onClick={onOpenAddExpense}
              className="inline-flex items-center space-x-1.5 bg-forest hover:bg-forest-dark text-paper-light px-4 py-2 rounded-xl text-xs font-medium shadow-subtle"
            >
              <span>Record Expense</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {groupedByDate.map((group) => (
            <div key={group.date} className="space-y-2">
              {/* Date Group Header */}
              <div className="flex items-center justify-between px-1">
                <span className="font-serif font-bold text-sm text-ink-primary dark:text-darkink-primary tracking-tight">
                  {group.displayHeader}
                </span>
                <span className="font-mono text-xs text-ink-muted dark:text-darkink-muted">
                  {formatCurrency(group.totalCents, currencyCode)}
                </span>
              </div>

              {/* Transactions in this date group */}
              <div className="ledger-card divide-y divide-paper-borderSubtle dark:divide-darkpaper-borderSubtle overflow-hidden">
                {group.items.map((item) => {
                  const cat = categoryMap.get(item.categoryId);
                  return (
                    <div
                      key={item.id}
                      className="p-3 sm:p-4 flex items-center justify-between hover:bg-paper-muted/50 dark:hover:bg-darkpaper-cardHover/60 transition-all duration-150 group"
                    >
                      {/* Left: Icon & Description */}
                      <div className="flex items-center space-x-3.5 min-w-0 flex-1 pr-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105"
                          style={{
                            backgroundColor: (cat?.color || '#6E6A66') + '20',
                            color: cat?.color || '#6E6A66',
                          }}
                        >
                          <CategoryIcon name={cat?.icon || 'Tag'} className="w-4 h-4" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-sm text-ink-primary dark:text-darkink-primary truncate">
                              {item.description}
                            </span>
                            {item.notes && (
                              <span
                                className="hidden sm:inline-block text-[11px] text-ink-muted dark:text-darkink-muted truncate max-w-xs italic"
                                title={item.notes}
                              >
                                — {item.notes}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 text-xs text-ink-muted dark:text-darkink-muted mt-0.5">
                            <span
                              className="font-medium inline-block truncate max-w-[120px]"
                              style={{ color: cat?.color }}
                            >
                              {cat?.name || 'Uncategorized'}
                            </span>
                            <span>•</span>
                            <span className="inline-flex items-center space-x-1 uppercase text-[10px] font-semibold">
                              {getMethodIcon(item.paymentMethod)}
                              <span>{item.paymentMethod}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Amount & Quick Actions */}
                      <div className="flex items-center space-x-3 flex-shrink-0">
                        <div className="text-right">
                          <span className="font-serif font-bold text-base sm:text-lg text-ink-primary dark:text-darkink-primary tabular-nums">
                            {formatCurrency(item.amountInCents, currencyCode)}
                          </span>
                        </div>

                        {/* Hover Actions: Edit & Delete */}
                        <div className="flex items-center space-x-1 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => onEditExpense(item)}
                            className="p-1.5 rounded-lg text-ink-secondary hover:text-forest hover:bg-forest-surface dark:hover:bg-forest/20 transition-colors"
                            title="Edit transaction"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteExpense(item.id)}
                            className="p-1.5 rounded-lg text-ink-secondary hover:text-terracotta hover:bg-terracotta-surface dark:hover:bg-terracotta/20 transition-colors"
                            title="Delete transaction"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
