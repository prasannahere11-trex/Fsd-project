import React, { useState } from 'react';
import {
  AlertTriangle,
  Edit3,
  Check,
  X,
  ShieldAlert,
} from 'lucide-react';
import type { Expense, Category } from '../../types/expense';
import { formatCurrency, decimalToCents, centsToDecimal } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { AnimatedAmount } from '../common/AnimatedAmount';

interface BudgetViewProps {
  expenses: Expense[];
  categories: Category[];
  currencyCode: string;
  selectedMonthLabel: string;
  onUpdateCategoryBudget: (categoryId: string, budgetInCents: number) => void;
  onOpenCategories: () => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  expenses,
  categories,
  currencyCode,
  selectedMonthLabel,
  onUpdateCategoryBudget,
  onOpenCategories,
}) => {
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [editBudgetStr, setEditBudgetStr] = useState('');

  // Calculate spent per category for current selected month
  const catSpendMap = new Map<string, number>();
  expenses.forEach((e) => {
    catSpendMap.set(e.categoryId, (catSpendMap.get(e.categoryId) || 0) + e.amountInCents);
  });

  // Aggregated totals
  const totalBudgetInCents = categories.reduce((acc, c) => acc + (c.budgetInCents || 0), 0);
  const totalSpendInCents = expenses.reduce((acc, e) => acc + e.amountInCents, 0);
  const totalRemainingInCents = Math.max(0, totalBudgetInCents - totalSpendInCents);
  const overallUsagePct = totalBudgetInCents > 0 ? (totalSpendInCents / totalBudgetInCents) * 100 : 0;

  // Categories exceeding budget
  const overBudgetCategories = categories.filter((c) => {
    const spent = catSpendMap.get(c.id) || 0;
    return c.budgetInCents > 0 && spent > c.budgetInCents;
  });

  const handleStartEdit = (category: Category) => {
    setEditingCatId(category.id);
    setEditBudgetStr(category.budgetInCents > 0 ? centsToDecimal(category.budgetInCents).toString() : '');
  };

  const handleSaveBudget = (categoryId: string) => {
    const cents = decimalToCents(editBudgetStr);
    onUpdateCategoryBudget(categoryId, cents);
    setEditingCatId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Overall Budget Performance KPI Header */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Allocation */}
        <div className="ledger-card p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-darkink-muted">
            Total Monthly Allocation
          </span>
          <div className="mt-2 mb-1">
            <AnimatedAmount
              amountInCents={totalBudgetInCents}
              currencyCode={currencyCode}
              size="xl"
            />
          </div>
          <p className="text-xs text-ink-muted dark:text-darkink-muted">
            Sum of all category targets for {selectedMonthLabel}
          </p>
        </div>

        {/* Total Spent vs Budget */}
        <div className="ledger-card p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-darkink-muted">
            Total Spend
          </span>
          <div className="mt-2 mb-1">
            <AnimatedAmount
              amountInCents={totalSpendInCents}
              currencyCode={currencyCode}
              size="xl"
            />
          </div>
          <div className="flex items-center space-x-2 text-xs font-medium">
            <span
              className={
                overallUsagePct >= 100
                  ? 'text-terracotta font-semibold'
                  : overallUsagePct >= 80
                  ? 'text-ochre font-semibold'
                  : 'text-forest dark:text-forest-light'
              }
            >
              {overallUsagePct.toFixed(1)}% of total budget used
            </span>
          </div>
        </div>

        {/* Headroom / Remaining */}
        <div className="ledger-card p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-darkink-muted">
            Net Remaining Headroom
          </span>
          <div className="mt-2 mb-1">
            <AnimatedAmount
              amountInCents={totalRemainingInCents}
              currencyCode={currencyCode}
              size="xl"
            />
          </div>
          <p className="text-xs text-ink-muted dark:text-darkink-muted">
            {totalSpendInCents > totalBudgetInCents ? (
              <span className="text-terracotta font-medium flex items-center space-x-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Over budget by {formatCurrency(totalSpendInCents - totalBudgetInCents, currencyCode)}</span>
              </span>
            ) : (
              'Available spending envelope for this period'
            )}
          </p>
        </div>
      </div>

      {/* Warning banner if any category is over budget */}
      {overBudgetCategories.length > 0 && (
        <div className="bg-terracotta-surface dark:bg-terracotta/15 border border-terracotta/30 rounded-xl p-4 flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-terracotta flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-semibold text-ink-primary dark:text-darkink-primary">
              Budget Alert: {overBudgetCategories.length} categor{overBudgetCategories.length === 1 ? 'y has' : 'ies have'} exceeded target
            </p>
            <p className="text-ink-secondary dark:text-darkink-secondary mt-0.5">
              Review spending in: {overBudgetCategories.map((c) => c.name).join(', ')}.
            </p>
          </div>
        </div>
      )}

      {/* 2. Category Budget Cards Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-serif font-bold text-lg text-ink-primary dark:text-darkink-primary">
              Category Budget Allocations
            </h3>
            <p className="text-xs text-ink-muted dark:text-darkink-muted">
              Track progress against target limits. Progress changes amber at 80% and red upon exceeding.
            </p>
          </div>

          <button
            onClick={onOpenCategories}
            className="text-xs font-medium text-forest dark:text-forest-light hover:underline"
          >
            Manage Categories
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const spentInCents = catSpendMap.get(cat.id) || 0;
            const budgetInCents = cat.budgetInCents || 0;
            const hasBudget = budgetInCents > 0;
            const usagePercent = hasBudget ? (spentInCents / budgetInCents) * 100 : 0;
            const remainingInCents = Math.max(0, budgetInCents - spentInCents);
            const isOver = hasBudget && spentInCents > budgetInCents;
            const isNear = hasBudget && !isOver && usagePercent >= 80;

            const isEditing = editingCatId === cat.id;

            let barColor = '#2D5A4A';
            if (isOver) {
              barColor = '#C4664B';
            } else if (isNear) {
              barColor = '#C98A2C';
            }

            return (
              <div
                key={cat.id}
                className={`ledger-card p-5 relative transition-all ${
                  isOver ? 'border-terracotta/40' : ''
                }`}
              >
                {/* Top: Category details & Edit budget button */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        backgroundColor: cat.color + '22',
                        color: cat.color,
                      }}
                    >
                      <CategoryIcon name={cat.icon} className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm text-ink-primary dark:text-darkink-primary">
                        {cat.name}
                      </h4>
                      <p className="text-xs text-ink-muted dark:text-darkink-muted">
                        {hasBudget ? (
                          <span>
                            Target: <strong>{formatCurrency(budgetInCents, currencyCode)}</strong>
                          </span>
                        ) : (
                          <span className="italic">No limit assigned</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Inline Edit Budget Control */}
                  {!isEditing ? (
                    <button
                      onClick={() => handleStartEdit(cat)}
                      className="p-1.5 rounded-lg text-ink-muted hover:text-ink-primary hover:bg-paper-muted dark:hover:bg-darkpaper-cardHover transition-colors text-xs flex items-center space-x-1"
                      title="Edit budget limit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Set Limit</span>
                    </button>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <input
                        type="number"
                        placeholder="Limit"
                        value={editBudgetStr}
                        onChange={(e) => setEditBudgetStr(e.target.value)}
                        className="w-24 px-2 py-1 text-xs bg-paper-muted dark:bg-darkpaper-muted border border-forest rounded-lg font-serif font-bold text-ink-primary dark:text-darkink-primary focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveBudget(cat.id)}
                        className="p-1 bg-forest text-paper-light rounded-lg hover:bg-forest-dark"
                        title="Save"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingCatId(null)}
                        className="p-1 text-ink-muted hover:text-ink-primary rounded-lg"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Middle: Amount spent vs remaining numbers */}
                <div className="flex items-baseline justify-between mb-2">
                  <div>
                    <span className="text-[11px] uppercase tracking-wider text-ink-muted dark:text-darkink-muted font-medium">
                      Spent
                    </span>
                    <div className="font-serif font-bold text-lg text-ink-primary dark:text-darkink-primary">
                      {formatCurrency(spentInCents, currencyCode)}
                    </div>
                  </div>

                  {hasBudget && (
                    <div className="text-right">
                      <span className="text-[11px] uppercase tracking-wider text-ink-muted dark:text-darkink-muted font-medium">
                        {isOver ? 'Exceeded By' : 'Remaining'}
                      </span>
                      <div
                        className={`font-serif font-bold text-base ${
                          isOver
                            ? 'text-terracotta'
                            : 'text-ink-secondary dark:text-darkink-secondary'
                        }`}
                      >
                        {isOver
                          ? `+${formatCurrency(spentInCents - budgetInCents, currencyCode)}`
                          : formatCurrency(remainingInCents, currencyCode)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom: Adaptive Progress Bar */}
                {hasBudget ? (
                  <div>
                    <div className="h-2.5 w-full bg-paper-muted dark:bg-darkpaper-muted rounded-full overflow-hidden p-0.5 border border-paper-borderSubtle dark:border-darkpaper-borderSubtle">
                      <div
                        className="h-full rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.min(100, usagePercent)}%`,
                          backgroundColor: barColor,
                        }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-medium mt-1.5">
                      <span
                        className={
                          isOver
                            ? 'text-terracotta'
                            : isNear
                            ? 'text-ochre'
                            : 'text-forest dark:text-forest-light'
                        }
                      >
                        {usagePercent.toFixed(0)}% utilized
                      </span>
                      {isOver && (
                        <span className="text-terracotta font-semibold flex items-center space-x-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Over limit</span>
                        </span>
                      )}
                      {!isOver && usagePercent >= 80 && (
                        <span className="text-ochre font-semibold">Near ceiling</span>
                      )}
                      {!isOver && usagePercent < 80 && (
                        <span className="text-ink-muted dark:text-darkink-muted">Within budget</span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="py-2 text-center bg-paper-muted/50 dark:bg-darkpaper-muted/50 rounded-lg text-xs text-ink-muted">
                    Click "Set Limit" to define a monthly cap.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
