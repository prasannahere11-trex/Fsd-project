import React, { useState, useEffect } from 'react';
import { X, Calendar, Check, AlertCircle } from 'lucide-react';
import type { Expense, Category, PaymentMethod } from '../../types/expense';
import { decimalToCents, centsToDecimal } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expenseData: Omit<Expense, 'id' | 'createdAt'>, expenseId?: string) => void;
  categories: Category[];
  editingExpense?: Expense | null;
  currencyCode?: string;
  defaultDate?: string;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  categories,
  editingExpense,
  currencyCode = 'INR',
  defaultDate,
}) => {
  const [amountStr, setAmountStr] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<{ amount?: string; description?: string; category?: string }>({});

  useEffect(() => {
    if (editingExpense) {
      setAmountStr((centsToDecimal(editingExpense.amountInCents)).toString());
      setDescription(editingExpense.description);
      setCategoryId(editingExpense.categoryId);
      setDate(editingExpense.date);
      setPaymentMethod(editingExpense.paymentMethod);
      setNotes(editingExpense.notes || '');
      setErrors({});
    } else {
      setAmountStr('');
      setDescription('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      const today = defaultDate || new Date().toISOString().split('T')[0];
      setDate(today);
      setPaymentMethod('upi');
      setNotes('');
      setErrors({});
    }
  }, [editingExpense, isOpen, categories, defaultDate]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const newErrors: { amount?: string; description?: string; category?: string } = {};

    const cents = decimalToCents(amountStr);
    if (!amountStr || cents <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }

    if (!description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!categoryId) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const amountInCents = decimalToCents(amountStr);
    onSave(
      {
        amountInCents,
        description: description.trim(),
        categoryId,
        date,
        paymentMethod,
        notes: notes.trim() || undefined,
      },
      editingExpense ? editingExpense.id : undefined
    );
    onClose();
  };

  const paymentMethods: Array<{ id: PaymentMethod; label: string }> = [
    { id: 'upi', label: 'UPI / Digital' },
    { id: 'card', label: 'Card' },
    { id: 'cash', label: 'Cash' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-primary/50 dark:bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-lg bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-2xl shadow-modal overflow-hidden animate-slide-up z-10">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-paper-borderSubtle dark:border-darkpaper-borderSubtle">
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-ink-primary dark:text-darkink-primary">
                {editingExpense ? 'Edit Ledger Entry' : 'Record New Expense'}
              </h2>
              <p className="text-xs text-ink-muted dark:text-darkink-muted">
                {editingExpense ? 'Update details of this transaction' : 'Log an expense into your ledger'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-ink-muted hover:text-ink-primary dark:hover:text-darkink-primary rounded-lg hover:bg-paper-muted dark:hover:bg-darkpaper-cardHover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Amount input - Large Serif Ledger style */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-darkink-secondary mb-1.5">
                Amount ({currencyCode}) <span className="text-terracotta">*</span>
              </label>
              <div className="relative flex items-center">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  value={amountStr}
                  onChange={(e) => setAmountStr(e.target.value)}
                  autoFocus
                  className={`w-full bg-paper-muted/50 dark:bg-darkpaper-muted/50 border ${
                    errors.amount
                      ? 'border-terracotta ring-1 ring-terracotta'
                      : 'border-paper-border dark:border-darkpaper-border focus:border-forest dark:focus:border-forest-light focus:ring-1 focus:ring-forest'
                  } rounded-xl px-4 py-3 font-serif font-bold text-2xl sm:text-3xl text-ink-primary dark:text-darkink-primary placeholder:text-ink-light dark:placeholder:text-darkink-muted focus:outline-none transition-all`}
                />
              </div>
              {errors.amount && (
                <p className="text-xs text-terracotta mt-1.5 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.amount}</span>
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-darkink-secondary mb-1.5">
                Description / Payee <span className="text-terracotta">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Swiggy Gourmet, Supermarket, Metro Pass"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className={`w-full bg-paper-muted/40 dark:bg-darkpaper-muted/40 border ${
                  errors.description
                    ? 'border-terracotta ring-1 ring-terracotta'
                    : 'border-paper-border dark:border-darkpaper-border focus:border-forest focus:ring-1 focus:ring-forest'
                } rounded-xl px-3.5 py-2.5 text-sm text-ink-primary dark:text-darkink-primary placeholder:text-ink-light dark:placeholder:text-darkink-muted focus:outline-none transition-all`}
              />
              {errors.description && (
                <p className="text-xs text-terracotta mt-1 flex items-center space-x-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.description}</span>
                </p>
              )}
            </div>

            {/* Category Grid Selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-darkink-secondary mb-1.5">
                Category <span className="text-terracotta">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-1 border border-paper-borderSubtle dark:border-darkpaper-borderSubtle rounded-xl">
                {categories.map((cat) => {
                  const isSelected = categoryId === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => setCategoryId(cat.id)}
                      className={`flex items-center space-x-2 p-2 rounded-lg text-xs font-medium text-left transition-all border ${
                        isSelected
                          ? 'border-forest bg-forest/10 dark:bg-forest/20 text-ink-primary dark:text-darkink-primary font-semibold shadow-subtle'
                          : 'border-transparent hover:bg-paper-muted dark:hover:bg-darkpaper-cardHover text-ink-secondary dark:text-darkink-secondary'
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: cat.color + '22', color: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-3 h-3" />
                      </div>
                      <span className="truncate">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date & Payment Method Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Date */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-darkink-secondary mb-1.5">
                  Date
                </label>
                <div className="relative flex items-center">
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-paper-muted/40 dark:bg-darkpaper-muted/40 border border-paper-border dark:border-darkpaper-border rounded-xl px-3 py-2 text-sm text-ink-primary dark:text-darkink-primary focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest"
                  />
                  <Calendar className="w-4 h-4 text-ink-muted absolute right-3 pointer-events-none" />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-darkink-secondary mb-1.5">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-1 bg-paper-muted/60 dark:bg-darkpaper-muted/60 p-1 rounded-xl border border-paper-border dark:border-darkpaper-border">
                  {paymentMethods.map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setPaymentMethod(m.id)}
                      className={`py-1.5 px-2 text-xs font-medium rounded-lg capitalize transition-all ${
                        paymentMethod === m.id
                          ? 'bg-paper-card dark:bg-darkpaper-card text-ink-primary dark:text-darkink-primary shadow-subtle font-semibold'
                          : 'text-ink-secondary dark:text-darkink-secondary hover:text-ink-primary'
                      }`}
                    >
                      {m.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-darkink-secondary mb-1.5">
                Notes (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Additional details, tax info, or reimbursement note..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-paper-muted/40 dark:bg-darkpaper-muted/40 border border-paper-border dark:border-darkpaper-border rounded-xl px-3.5 py-2 text-xs text-ink-primary dark:text-darkink-primary placeholder:text-ink-light dark:placeholder:text-darkink-muted focus:outline-none focus:border-forest focus:ring-1 focus:ring-forest resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-3 border-t border-paper-borderSubtle dark:border-darkpaper-borderSubtle">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-ink-secondary dark:text-darkink-secondary hover:bg-paper-muted dark:hover:bg-darkpaper-cardHover rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center space-x-1.5 bg-forest hover:bg-forest-dark text-paper-light px-5 py-2.5 rounded-xl font-medium text-sm transition-all shadow-subtle active:scale-[0.98]"
              >
                <Check className="w-4 h-4" />
                <span>{editingExpense ? 'Save Changes' : 'Record Expense'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
