import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from 'recharts';
import type { Expense, MonthComparisonItem } from '../../types/expense';
import { formatCurrency } from '../../utils/formatters';
import { CustomChartTooltip } from '../dashboard/CustomChartTooltip';
import { subMonths, format } from 'date-fns';
import { Calendar } from 'lucide-react';

interface MonthlyComparisonViewProps {
  allExpenses: Expense[];
  currencyCode: string;
  onSelectMonth?: (monthKey: string) => void;
}

export const MonthlyComparisonView: React.FC<MonthlyComparisonViewProps> = ({
  allExpenses,
  currencyCode,
  onSelectMonth,
}) => {
  const currentDate = new Date();

  // Generate last 6 months list
  const comparisonData: MonthComparisonItem[] = [];
  for (let i = 5; i >= 0; i--) {
    const targetMonthDate = subMonths(currentDate, i);
    const monthKey = format(targetMonthDate, 'yyyy-MM');
    const label = format(targetMonthDate, 'MMM yyyy');
    const shortLabel = format(targetMonthDate, 'MMM');

    // Filter expenses in this month
    const monthExpenses = allExpenses.filter((e) => e.date.startsWith(monthKey));
    const totalInCents = monthExpenses.reduce((acc, curr) => acc + curr.amountInCents, 0);

    comparisonData.push({
      monthKey,
      label,
      shortLabel,
      totalInCents,
      count: monthExpenses.length,
      isCurrentMonth: i === 0,
    });
  }

  // Calculate statistics across 6 months
  const total6MoSpend = comparisonData.reduce((acc, d) => acc + d.totalInCents, 0);
  const avgMonthlySpend = Math.round(total6MoSpend / Math.max(1, comparisonData.length));
  const highestMonth = [...comparisonData].sort((a, b) => b.totalInCents - a.totalInCents)[0];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Comparison Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="ledger-card p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-darkink-muted">
            6-Month Aggregate
          </span>
          <div className="font-serif font-bold text-2xl text-ink-primary dark:text-darkink-primary mt-2 mb-1">
            {formatCurrency(total6MoSpend, currencyCode)}
          </div>
          <p className="text-xs text-ink-muted dark:text-darkink-muted">
            Total recorded across the last 6 months
          </p>
        </div>

        <div className="ledger-card p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-darkink-muted">
            Monthly Average
          </span>
          <div className="font-serif font-bold text-2xl text-ink-primary dark:text-darkink-primary mt-2 mb-1">
            {formatCurrency(avgMonthlySpend, currencyCode)}
          </div>
          <p className="text-xs text-ink-muted dark:text-darkink-muted">
            Mean expenditure benchmark
          </p>
        </div>

        <div className="ledger-card p-5">
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted dark:text-darkink-muted">
            Peak Spending Period
          </span>
          <div className="font-serif font-bold text-2xl text-ink-primary dark:text-darkink-primary mt-2 mb-1">
            {highestMonth ? highestMonth.label : 'N/A'}
          </div>
          <p className="text-xs text-ink-muted dark:text-darkink-muted">
            {highestMonth ? formatCurrency(highestMonth.totalInCents, currencyCode) : ''}
          </p>
        </div>
      </div>

      {/* 2. Main 6-Month Comparison Bar Chart */}
      <div className="ledger-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-serif font-bold text-lg text-ink-primary dark:text-darkink-primary">
              6-Month Spending Trajectory
            </h3>
            <p className="text-xs text-ink-muted dark:text-darkink-muted">
              Monthly comparative totals (click on any bar to jump to that period)
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs text-ink-muted">
            <span className="w-3 h-3 rounded bg-forest inline-block" />
            <span>Monthly Spend</span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="currentColor"
                className="text-paper-border dark:text-darkpaper-border opacity-60"
              />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: 'currentColor' }}
                className="text-ink-muted dark:text-darkink-muted"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: 'currentColor' }}
                className="text-ink-muted dark:text-darkink-muted"
                tickFormatter={(val) => formatCurrency(val, currencyCode, true)}
              />
              <Tooltip
                content={<CustomChartTooltip currencyCode={currencyCode} type="comparison" />}
              />
              <Bar
                dataKey="totalInCents"
                radius={[6, 6, 0, 0]}
                onClick={(entry: any) => onSelectMonth && onSelectMonth(entry.monthKey)}
                className="cursor-pointer"
              >
                {comparisonData.map((entry) => (
                  <Cell
                    key={entry.monthKey}
                    fill={entry.isCurrentMonth ? '#2D5A4A' : '#4B6B94'}
                    opacity={entry.isCurrentMonth ? 1 : 0.8}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Monthly Breakdown Table */}
      <div className="ledger-card overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-paper-borderSubtle dark:border-darkpaper-borderSubtle">
          <h4 className="font-serif font-bold text-base text-ink-primary dark:text-darkink-primary">
            Historical Ledger Breakdown
          </h4>
          <p className="text-xs text-ink-muted dark:text-darkink-muted">
            Month-by-month details with delta vs 6-month average
          </p>
        </div>

        <div className="divide-y divide-paper-borderSubtle dark:divide-darkpaper-borderSubtle">
          {comparisonData.map((m) => {
            const deltaVsAvg = avgMonthlySpend > 0 ? ((m.totalInCents - avgMonthlySpend) / avgMonthlySpend) * 100 : 0;
            const isAboveAvg = deltaVsAvg > 0;

            return (
              <div
                key={m.monthKey}
                onClick={() => onSelectMonth && onSelectMonth(m.monthKey)}
                className="p-4 flex items-center justify-between hover:bg-paper-muted/50 dark:hover:bg-darkpaper-cardHover/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-paper-muted dark:bg-darkpaper-muted flex items-center justify-center text-ink-secondary dark:text-darkink-secondary">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm text-ink-primary dark:text-darkink-primary">
                        {m.label}
                      </span>
                      {m.isCurrentMonth && (
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-forest/10 text-forest border border-forest/20">
                          Active Month
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-ink-muted dark:text-darkink-muted">
                      {m.count} transactions logged
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-serif font-bold text-base text-ink-primary dark:text-darkink-primary">
                    {formatCurrency(m.totalInCents, currencyCode)}
                  </div>
                  <div className="text-[11px] flex items-center justify-end space-x-1 mt-0.5">
                    <span className={isAboveAvg ? 'text-terracotta' : 'text-forest dark:text-forest-light'}>
                      {isAboveAvg ? `+${deltaVsAvg.toFixed(1)}%` : `${deltaVsAvg.toFixed(1)}%`} vs avg
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
