import React, { useState } from 'react';
import { X, Plus, Trash2, Edit2, Check, AlertCircle } from 'lucide-react';
import type { Category } from '../../types/expense';
import { PALETTE_COLORS, AVAILABLE_ICONS } from '../../constants/categories';
import { CategoryIcon } from '../common/CategoryIcon';
import { decimalToCents, centsToDecimal, formatCurrency } from '../../utils/formatters';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (category: Omit<Category, 'id'>) => void;
  onUpdateCategory: (id: string, updates: Partial<Omit<Category, 'id'>>) => void;
  onDeleteCategory: (id: string) => void;
  currencyCode?: string;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  currencyCode = 'INR',
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Tag');
  const [selectedColor, setSelectedColor] = useState(PALETTE_COLORS[0].hex);
  const [selectedBgColor, setSelectedBgColor] = useState(PALETTE_COLORS[0].bg);
  const [budgetStr, setBudgetStr] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setName('');
    setSelectedIcon('Tag');
    setSelectedColor(PALETTE_COLORS[0].hex);
    setSelectedBgColor(PALETTE_COLORS[0].bg);
    setBudgetStr('');
    setError('');
    setIsCreating(false);
    setEditingCatId(null);
  };

  const handleStartCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleStartEdit = (cat: Category) => {
    setName(cat.name);
    setSelectedIcon(cat.icon);
    setSelectedColor(cat.color);
    setSelectedBgColor(cat.bgColor);
    setBudgetStr(cat.budgetInCents > 0 ? centsToDecimal(cat.budgetInCents).toString() : '');
    setError('');
    setIsCreating(false);
    setEditingCatId(cat.id);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }

    const budgetInCents = decimalToCents(budgetStr);

    if (editingCatId) {
      onUpdateCategory(editingCatId, {
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        bgColor: selectedBgColor,
        budgetInCents,
      });
    } else {
      onAddCategory({
        name: name.trim(),
        icon: selectedIcon,
        color: selectedColor,
        bgColor: selectedBgColor,
        budgetInCents,
      });
    }

    resetForm();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-primary/50 dark:bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="min-h-full flex items-center justify-center p-4 sm:p-6">
        <div className="relative w-full max-w-xl bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-2xl shadow-modal overflow-hidden animate-slide-up z-10">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-paper-borderSubtle dark:border-darkpaper-borderSubtle">
            <div>
              <h2 className="font-serif font-bold text-lg sm:text-xl text-ink-primary dark:text-darkink-primary">
                Manage Categories
              </h2>
              <p className="text-xs text-ink-muted dark:text-darkink-muted">
                Personalize categories, icons, colors, and default budgets
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-ink-muted hover:text-ink-primary dark:hover:text-darkink-primary rounded-lg hover:bg-paper-muted dark:hover:bg-darkpaper-cardHover transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* If creating or editing, show form */}
            {(isCreating || editingCatId) ? (
              <form onSubmit={handleSave} className="bg-paper-muted/50 dark:bg-darkpaper-muted/50 p-4 rounded-xl border border-paper-border dark:border-darkpaper-border space-y-4 animate-slide-down">
                <div className="flex items-center justify-between">
                  <h4 className="font-serif font-bold text-sm text-ink-primary dark:text-darkink-primary">
                    {editingCatId ? 'Edit Category' : 'Create Custom Category'}
                  </h4>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs text-ink-muted hover:text-ink-primary"
                  >
                    Cancel
                  </button>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-darkink-secondary mb-1">
                    Category Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Subscriptions, Pet Care, Coffee"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                    className="w-full bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-lg px-3 py-2 text-sm text-ink-primary dark:text-darkink-primary focus:outline-none focus:border-forest"
                  />
                  {error && (
                    <p className="text-xs text-terracotta mt-1 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{error}</span>
                    </p>
                  )}
                </div>

                {/* Color Palette Swatches */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-darkink-secondary mb-1.5">
                    Color Swatch
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {PALETTE_COLORS.map((c) => {
                      const isSelected = selectedColor === c.hex;
                      return (
                        <button
                          type="button"
                          key={c.hex}
                          onClick={() => {
                            setSelectedColor(c.hex);
                            setSelectedBgColor(c.bg);
                          }}
                          className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                            isSelected ? 'ring-2 ring-offset-2 ring-forest scale-110' : 'hover:scale-105'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 text-paper-light" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Icon Grid */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-darkink-secondary mb-1.5">
                    Icon
                  </label>
                  <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-1">
                    {AVAILABLE_ICONS.map((iconName) => {
                      const isSelected = selectedIcon === iconName;
                      return (
                        <button
                          type="button"
                          key={iconName}
                          onClick={() => setSelectedIcon(iconName)}
                          className={`p-2 rounded-lg border transition-all ${
                            isSelected
                              ? 'border-forest bg-forest/15 text-forest dark:text-forest-light'
                              : 'border-paper-border dark:border-darkpaper-border bg-paper-card dark:bg-darkpaper-card text-ink-secondary hover:text-ink-primary'
                          }`}
                        >
                          <CategoryIcon name={iconName} className="w-4 h-4" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Optional Monthly Budget */}
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-darkink-secondary mb-1">
                    Monthly Budget Target ({currencyCode})
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="0"
                    placeholder="e.g. 5000"
                    value={budgetStr}
                    onChange={(e) => setBudgetStr(e.target.value)}
                    className="w-full bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-lg px-3 py-2 text-sm text-ink-primary dark:text-darkink-primary focus:outline-none focus:border-forest"
                  />
                </div>

                {/* Submit button */}
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-3 py-1.5 text-xs font-medium text-ink-secondary hover:bg-paper-card rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-forest hover:bg-forest-dark text-paper-light px-4 py-1.5 rounded-lg text-xs font-medium shadow-subtle flex items-center space-x-1"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{editingCatId ? 'Update Category' : 'Save Category'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={handleStartCreate}
                className="w-full py-2.5 border-2 border-dashed border-paper-border dark:border-darkpaper-border rounded-xl text-xs font-medium text-forest dark:text-forest-light hover:bg-forest/5 flex items-center justify-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom Category</span>
              </button>
            )}

            {/* Existing Categories List */}
            <div className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-darkink-muted">
                Active Categories ({categories.length})
              </h4>

              <div className="divide-y divide-paper-borderSubtle dark:divide-darkpaper-borderSubtle border border-paper-border dark:border-darkpaper-border rounded-xl overflow-hidden">
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className="p-3 bg-paper-card dark:bg-darkpaper-card flex items-center justify-between hover:bg-paper-muted/40 dark:hover:bg-darkpaper-cardHover transition-colors"
                  >
                    <div className="flex items-center space-x-3 truncate">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: cat.color + '22', color: cat.color }}
                      >
                        <CategoryIcon name={cat.icon} className="w-4 h-4" />
                      </div>
                      <div className="truncate">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-ink-primary dark:text-darkink-primary truncate">
                            {cat.name}
                          </span>
                          {cat.isDefault && (
                            <span className="text-[10px] text-ink-muted bg-paper-muted dark:bg-darkpaper-muted px-1.5 py-0.5 rounded">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-ink-muted dark:text-darkink-muted">
                          {cat.budgetInCents > 0
                            ? `Budget: ${formatCurrency(cat.budgetInCents, currencyCode)}`
                            : 'No budget limit'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <button
                        onClick={() => handleStartEdit(cat)}
                        className="p-1.5 rounded-lg text-ink-secondary hover:text-forest hover:bg-paper-muted transition-colors"
                        title="Edit category"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {!cat.isDefault && (
                        <button
                          onClick={() => onDeleteCategory(cat.id)}
                          className="p-1.5 rounded-lg text-ink-secondary hover:text-terracotta hover:bg-terracotta-surface dark:hover:bg-terracotta/20 transition-colors"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
