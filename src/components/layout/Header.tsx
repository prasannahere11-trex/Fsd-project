import React, { useState } from 'react';
import {
  Plus,
  Moon,
  Sun,
  Download,
  RotateCcw,
  Tags,
  LayoutDashboard,
  ReceiptText,
  PiggyBank,
  BarChart3,
  ChevronDown,
} from 'lucide-react';
import type { ActiveTab } from '../../types/expense';
import { CURRENCIES } from '../../utils/formatters';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenAddExpense: () => void;
  onOpenCategories: () => void;
  onExportCSV: () => void;
  onResetData: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  currency: string;
  onCurrencyChange: (currency: string) => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  availableMonths: Array<{ value: string; label: string }>;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onOpenAddExpense,
  onOpenCategories,
  onExportCSV,
  onResetData,
  theme,
  onToggleTheme,
  currency,
  onCurrencyChange,
  selectedMonth,
  onMonthChange,
  availableMonths,
}) => {
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);

  const tabs: Array<{ id: ActiveTab; label: string; icon: React.ReactNode }> = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'transactions', label: 'Transactions', icon: <ReceiptText className="w-4 h-4" /> },
    { id: 'budgets', label: 'Budgets', icon: <PiggyBank className="w-4 h-4" /> },
    { id: 'analytics', label: '6-Mo Comparison', icon: <BarChart3 className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-30 bg-paper-light/90 dark:bg-darkpaper-bg/90 backdrop-blur-md border-b border-paper-border dark:border-darkpaper-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main top bar */}
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-forest text-paper-light flex items-center justify-center shadow-subtle font-serif font-bold text-xl">
              L
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-xl sm:text-2xl text-ink-primary dark:text-darkink-primary tracking-tight">
                  Ledger
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-2 py-0.5 rounded-full bg-forest/10 text-forest dark:bg-forest/20 dark:text-forest-light border border-forest/20">
                  Personal
                </span>
              </div>
              <p className="text-xs text-ink-muted dark:text-darkink-muted hidden sm:block">
                Deliberate expense tracking & budgets
              </p>
            </div>
          </div>

          {/* Center Month Selector (Visible on Dashboard & Budgets) */}
          {(activeTab === 'dashboard' || activeTab === 'budgets') && (
            <div className="hidden md:flex items-center bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-lg px-2 py-1 shadow-subtle">
              <span className="text-xs font-medium text-ink-muted dark:text-darkink-muted px-2">Period:</span>
              <div className="relative">
                <select
                  value={selectedMonth}
                  onChange={(e) => onMonthChange(e.target.value)}
                  className="appearance-none bg-transparent pl-2 pr-7 py-1 text-sm font-medium text-ink-primary dark:text-darkink-primary focus:outline-none cursor-pointer"
                >
                  {availableMonths.map((m) => (
                    <option key={m.value} value={m.value} className="bg-paper-card dark:bg-darkpaper-card text-ink-primary dark:text-darkink-primary">
                      {m.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-1.5 top-2 pointer-events-none" />
              </div>
            </div>
          )}

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Currency Selector */}
            <div className="relative hidden sm:block">
              <select
                value={currency}
                onChange={(e) => onCurrencyChange(e.target.value)}
                className="appearance-none bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-lg pl-2.5 pr-7 py-1.5 text-xs font-semibold text-ink-secondary dark:text-darkink-secondary focus:outline-none cursor-pointer"
                title="Change Currency"
              >
                {Object.keys(CURRENCIES).map((c) => (
                  <option key={c} value={c} className="bg-paper-card dark:bg-darkpaper-card text-ink-primary dark:text-darkink-primary">
                    {CURRENCIES[c].symbol} {CURRENCIES[c].code}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-ink-muted absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg border border-paper-border dark:border-darkpaper-border text-ink-secondary dark:text-darkink-secondary hover:bg-paper-muted dark:hover:bg-darkpaper-cardHover transition-colors"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-ochre" />
              ) : (
                <Moon className="w-4 h-4 text-ink-secondary" />
              )}
            </button>

            {/* Quick Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                className="p-2 rounded-lg border border-paper-border dark:border-darkpaper-border text-ink-secondary dark:text-darkink-secondary hover:bg-paper-muted dark:hover:bg-darkpaper-cardHover transition-colors"
                title="Data & Category Options"
                aria-label="Settings options"
              >
                <Tags className="w-4 h-4" />
              </button>

              {showSettingsMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowSettingsMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-xl shadow-popover py-2 z-50 animate-slide-down">
                    <div className="px-3 py-1.5 border-b border-paper-borderSubtle dark:border-darkpaper-borderSubtle mb-1">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted dark:text-darkink-muted">
                        Ledger Tools
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowSettingsMenu(false);
                        onOpenCategories();
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-ink-primary dark:text-darkink-primary hover:bg-paper-muted dark:hover:bg-darkpaper-cardHover flex items-center space-x-2.5 transition-colors"
                    >
                      <Tags className="w-4 h-4 text-forest" />
                      <span>Manage Categories</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowSettingsMenu(false);
                        onExportCSV();
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-ink-primary dark:text-darkink-primary hover:bg-paper-muted dark:hover:bg-darkpaper-cardHover flex items-center space-x-2.5 transition-colors"
                    >
                      <Download className="w-4 h-4 text-forest" />
                      <span>Export Data (CSV)</span>
                    </button>

                    <div className="my-1 border-t border-paper-borderSubtle dark:border-darkpaper-borderSubtle" />

                    <button
                      onClick={() => {
                        setShowSettingsMenu(false);
                        onResetData();
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-terracotta hover:bg-terracotta-surface dark:hover:bg-terracotta/10 flex items-center space-x-2.5 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4 text-terracotta" />
                      <span>Reset to Sample Data</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Primary Add Expense CTA */}
            <button
              onClick={onOpenAddExpense}
              id="header-add-expense-btn"
              className="inline-flex items-center space-x-1.5 bg-forest hover:bg-forest-dark text-paper-light px-3.5 sm:px-4 py-2 rounded-lg font-medium text-sm transition-all shadow-subtle active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Expense</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar pt-1 pb-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-ink-primary text-paper-light dark:bg-darkink-primary dark:text-darkpaper-bg font-semibold shadow-subtle'
                    : 'text-ink-secondary dark:text-darkink-secondary hover:text-ink-primary dark:hover:text-darkink-primary hover:bg-paper-muted/80 dark:hover:bg-darkpaper-cardHover'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}

          {/* Mobile Period Dropdown */}
          {(activeTab === 'dashboard' || activeTab === 'budgets') && (
            <div className="md:hidden ml-auto flex items-center bg-paper-card dark:bg-darkpaper-card border border-paper-border dark:border-darkpaper-border rounded-lg px-2 py-1">
              <select
                value={selectedMonth}
                onChange={(e) => onMonthChange(e.target.value)}
                className="appearance-none bg-transparent text-xs font-medium text-ink-primary dark:text-darkink-primary pr-4 focus:outline-none"
              >
                {availableMonths.map((m) => (
                  <option key={m.value} value={m.value} className="bg-paper-card dark:bg-darkpaper-card">
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
