import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  ArrowRight,
  PiggyBank,
  Calendar,
  CreditCard,
  PlusCircle,
  Receipt,
  Sparkles,
} from 'lucide-react';
import type { Expense, Category, CategoryBreakdownItem, DailySpendPoint } from '../../types/expense';
import { AnimatedAmount } from '../common/AnimatedAmount';
import { formatCurrency } from '../../utils/formatters';
import { CategoryDonutChart } from './CategoryDonutChart';
import { DailySpendingChart } from './DailySpendingChart';
import { TopCategoriesBarList } from './TopCategoriesBarList';

interface DashboardProps {
  currentMonthExpenses: Expense[];
  previousMonthExpenses: Expense[];
  categories: Category[];
  currencyCode: string;
  selectedMonthLabel: string;
  onOpenAddExpense: () => void;
  onViewTransactions: (filterCategoryId?: string) => void;
  onViewBudgets: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  currentMonthExpenses,
  previousMonthExpenses,
  categories,
  currencyCode,
  selectedMonthLabel,
  onOpenAddExpense,
  onViewTransactions,
  onViewBudgets,
}) => {
  // Current month total
  const currentTotalInCents = currentMonthExpenses.reduce((acc, e) => acc + e.amountInCents, 0);
  const prevTotalInCents = previousMonthExpenses.reduce((acc, e) => acc + e.amountInCents, 0);

  // Percentage change calculation
  let percentageChange = 0;
  let isIncrease = false;
  if (prevTotalInCents > 0) {
    percentageChange = ((currentTotalInCents - prevTotalInCents) / prevTotalInCents) * 100;
    isIncrease = percentageChange > 0;
  } else if (currentTotalInCents > 0) {
    percentageChange = 100;
    isIncrease = true;
  }

  // Total monthly budget across categories
  const totalBudgetInCents = categories.reduce((acc, c) => acc + (c.budgetInCents || 0), 0);
  const remainingBudgetInCents = Math.max(0, totalBudgetInCents - currentTotalInCents);
  const budgetUsagePercent = totalBudgetInCents > 0 ? (currentTotalInCents / totalBudgetInCents) * 100 : 0;

  // Category breakdown calculation
  const categoryMap = new Map(categories.map((c) => [c.id, c]));
  const catTotalsMap = new Map<string, { total: number; count: number }>();

  currentMonthExpenses.forEach((e) => {
    const prev = catTotalsMap.get(e.categoryId) || { total: 0, count: 0 };
    catTotalsMap.set(e.categoryId, {
      total: prev.total + e.amountInCents,
      count: prev.count + 1,
    });
  });

  const categoryBreakdown: CategoryBreakdownItem[] = Array.from(catTotalsMap.entries())
    .map(([catId, { total, count }]) => {
      const cat = categoryMap.get(catId) || {
        id: catId,
        name: 'Other',
        color: '#6E6A66',
        icon: 'Tag',
        budgetInCents: 0,
        bgColor: '#F3F1EE',
      };
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        color: cat.color,
        icon: cat.icon,
        totalInCents: total,
        percentage: currentTotalInCents > 0 ? (total / currentTotalInCents) * 100 : 0,
        count,
        budgetInCents: cat.budgetInCents || 0,
      };
    })
    .sort((a, b) => b.totalInCents - a.totalInCents);

  // Daily timeline data calculation
  const dailySpendMap = new Map<string, number>();
  currentMonthExpenses.forEach((e) => {
    dailySpendMap.set(e.date, (dailySpendMap.get(e.date) || 0) + e.amountInCents);
  });

  const sortedDates = Array.from(dailySpendMap.keys()).sort();
  let cumulative = 0;
  const dailySpendPoints: DailySpendPoint[] = sortedDates.map((dateStr) => {
    const amt = dailySpendMap.get(dateStr) || 0;
    cumulative += amt;
    const dateObj = new Date(dateStr);
    const displayDate = `${dateObj.getDate()} ${dateObj.toLocaleDateString('default', { month: 'short' })}`;
    return {
      date: dateStr,
      displayDate,
      amountInCents: amt,
      cumulativeInCents: cumulative,
    };
  });

  // Intentional Empty State for First-Time or Empty Months
  if (currentMonthExpenses.length === 0 && previousMonthExpenses.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
        <div className="ledger-card p-8 sm:p-12 text-center border-dashed border-2 border-paper-border dark:border-darkpaper-border">
          <div className="w-16 h-16 rounded-2xl bg-forest/10 text-forest mx-auto flex items-center justify-center mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="font-serif font-bold text-2xl text-ink-primary dark:text-darkink-primary mb-2">
            Welcome to Ledger
          </h2>
          <p className="text-sm text-ink-secondary dark:text-darkink-secondary max-w-md mx-auto mb-6">
            Your deliberate personal finance journal is pristine. Record your first expense to unlock interactive category breakdowns, velocity charts, and budget limits.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onOpenAddExpense}
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-forest hover:bg-forest-dark text-paper-light px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-subtle active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Record First Expense</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Hero KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spend Card */}
        <div className="ledger-card p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-darkink-muted">
              Total Spent ({selectedMonthLabel})
            </span>
            <div className="w-8 h-8 rounded-lg bg-paper-muted dark:bg-darkpaper-muted flex items-center justify-center text-ink-secondary dark:text-darkink-secondary">
              <Receipt className="w-4 h-4" />
            </div>
          </div>

          <div className="mb-3">
            <AnimatedAmount
              amountInCents={currentTotalInCents}
              currencyCode={currencyCode}
              size="xl"
            />
          </div>

          {/* % Change vs previous month */}
          <div className="flex items-center space-x-1.5 text-xs font-medium">
            {prevTotalInCents > 0 ? (
              <>
                <span
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-md ${
                    isIncrease
                      ? 'bg-terracotta-surface text-terracotta dark:bg-terracotta/20 dark:text-terracotta-light'
                      : 'bg-forest-surface text-forest dark:bg-forest/20 dark:text-forest-light'
                  }`}
                >
                  {isIncrease ? (
                    <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                  )}
                  {Math.abs(percentageChange).toFixed(1)}%
                </span>
                <span className="text-ink-muted dark:text-darkink-muted">
                  vs previous month ({formatCurrency(prevTotalInCents, currencyCode, true)})
                </span>
              </>
            ) : (
              <span className="text-ink-muted dark:text-darkink-muted">First active period</span>
            )}
          </div>
        </div>

        {/* Monthly Budget Remaining */}
        <div className="ledger-card p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-darkink-muted">
              Budget Remaining
            </span>
            <div className="w-8 h-8 rounded-lg bg-forest/10 text-forest flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>

          <div className="mb-3">
            {totalBudgetInCents > 0 ? (
              <AnimatedAmount
                amountInCents={remainingBudgetInCents}
                currencyCode={currencyCode}
                size="xl"
              />
            ) : (
              <div className="text-lg font-medium text-ink-secondary dark:text-darkink-secondary pt-1">
                No limit set
              </div>
            )}
          </div>

          {totalBudgetInCents > 0 ? (
            <div>
              <div className="flex items-center justify-between text-xs text-ink-muted dark:text-darkink-muted mb-1">
                <span>{budgetUsagePercent.toFixed(0)}% used</span>
                <span>Limit: {formatCurrency(totalBudgetInCents, currencyCode, true)}</span>
              </div>
              <div className="h-1.5 w-full bg-paper-muted dark:bg-darkpaper-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    budgetUsagePercent >= 100
                      ? 'bg-terracotta'
                      : budgetUsagePercent >= 80
                      ? 'bg-ochre'
                      : 'bg-forest'
                  }`}
                  style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
                />
              </div>
            </div>
          ) : (
            <button
              onClick={onViewBudgets}
              className="text-xs font-medium text-forest hover:underline flex items-center space-x-1"
            >
              <span>Set category budgets</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Transaction Count */}
        <div className="ledger-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-darkink-muted">
              Transactions Logged
            </span>
            <div className="w-8 h-8 rounded-lg bg-paper-muted dark:bg-darkpaper-muted flex items-center justify-center text-ink-secondary dark:text-darkink-secondary">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>

          <div className="mb-2">
            <span className="font-serif font-bold text-3xl text-ink-primary dark:text-darkink-primary">
              {currentMonthExpenses.length}
            </span>
            <span className="text-xs text-ink-muted dark:text-darkink-muted ml-2">entries</span>
          </div>

          <p className="text-xs text-ink-muted dark:text-darkink-muted">
            Avg {formatCurrency(currentMonthExpenses.length > 0 ? currentTotalInCents / currentMonthExpenses.length : 0, currencyCode)} per transaction
          </p>
        </div>

        {/* Daily Spending Average */}
        <div className="ledger-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-darkink-muted">
              Daily Average
            </span>
            <div className="w-8 h-8 rounded-lg bg-paper-muted dark:bg-darkpaper-muted flex items-center justify-center text-ink-secondary dark:text-darkink-secondary">
              <Calendar className="w-4 h-4" />
            </div>
          </div>

          <div className="mb-2">
            <AnimatedAmount
              amountInCents={
                sortedDates.length > 0 ? Math.round(currentTotalInCents / Math.max(1, sortedDates.length)) : 0
              }
              currencyCode={currencyCode}
              size="xl"
            />
          </div>

          <p className="text-xs text-ink-muted dark:text-darkink-muted">
            Across {sortedDates.length} active spending days
          </p>
        </div>
      </div>

      {/* 2. Visual Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 ledger-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-serif font-bold text-base text-ink-primary dark:text-darkink-primary">
              Category Breakdown
            </h3>
            <span className="text-xs font-medium text-ink-muted dark:text-darkink-muted">
              {categoryBreakdown.length} active categories
            </span>
          </div>
          <CategoryDonutChart
            data={categoryBreakdown}
            totalInCents={currentTotalInCents}
            currencyCode={currencyCode}
            onSelectCategory={(catId) => onViewTransactions(catId)}
          />
        </div>

        <div className="lg:col-span-7 ledger-card p-5 sm:p-6">
          <DailySpendingChart
            data={dailySpendPoints}
            currencyCode={currencyCode}
          />
        </div>
      </div>

      {/* 3. Bottom Row: Top Categories + Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 ledger-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-base text-ink-primary dark:text-darkink-primary">
                Top Categories
              </h3>
              <p className="text-xs text-ink-muted dark:text-darkink-muted">
                Largest share of expenditures
              </p>
            </div>
            <button
              onClick={() => onViewTransactions()}
              className="text-xs font-medium text-forest dark:text-forest-light hover:underline flex items-center space-x-1"
            >
              <span>View all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <TopCategoriesBarList
            data={categoryBreakdown}
            currencyCode={currencyCode}
            onViewCategory={(catId) => onViewTransactions(catId)}
          />
        </div>

        <div className="lg:col-span-7 ledger-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-serif font-bold text-base text-ink-primary dark:text-darkink-primary">
                Recent Ledger Entries
              </h3>
              <p className="text-xs text-ink-muted dark:text-darkink-muted">
                Latest transactions this month
              </p>
            </div>
            <button
              onClick={() => onViewTransactions()}
              className="text-xs font-medium text-forest dark:text-forest-light hover:underline flex items-center space-x-1"
            >
              <span>Full Journal</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {currentMonthExpenses.length === 0 ? (
            <div className="py-8 text-center text-sm text-ink-muted dark:text-darkink-muted">
              No entries logged for this month yet.
            </div>
          ) : (
            <div className="divide-y divide-paper-borderSubtle dark:divide-darkpaper-borderSubtle">
              {currentMonthExpenses.slice(0, 6).map((item) => {
                const cat = categoryMap.get(item.categoryId);
                return (
                  <div
                    key={item.id}
                    className="py-2.5 flex items-center justify-between hover:bg-paper-muted/50 dark:hover:bg-darkpaper-cardHover/50 px-2 -mx-2 rounded-lg transition-colors group cursor-pointer"
                    onClick={() => onViewTransactions(item.categoryId)}
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: (cat?.color || '#6E6A66') + '20',
                          color: cat?.color || '#6E6A66',
                        }}
                      >
                        <Receipt className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <p className="text-sm font-medium text-ink-primary dark:text-darkink-primary truncate">
                          {item.description}
                        </p>
                        <div className="flex items-center space-x-2 text-[11px] text-ink-muted dark:text-darkink-muted">
                          <span>{cat?.name || 'Other'}</span>
                          <span>•</span>
                          <span className="uppercase">{item.paymentMethod}</span>
                          <span>•</span>
                          <span>{item.date}</span>
                        </div>
                      </div>
                    </div>

                    <div className="font-serif font-semibold text-sm text-ink-primary dark:text-darkink-primary ml-3 flex-shrink-0">
                      {formatCurrency(item.amountInCents, currencyCode)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
