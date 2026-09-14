import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { DailySpendPoint } from '../../types/expense';
import { formatCurrency } from '../../utils/formatters';
import { CustomChartTooltip } from './CustomChartTooltip';

interface DailySpendingChartProps {
  data: DailySpendPoint[];
  currencyCode: string;
}

export const DailySpendingChart: React.FC<DailySpendingChartProps> = ({
  data,
  currencyCode,
}) => {
  const [viewMode, setViewMode] = useState<'daily' | 'cumulative'>('daily');

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6">
        <p className="text-sm font-medium text-ink-secondary dark:text-darkink-secondary">
          No trend data available for this period
        </p>
      </div>
    );
  }

  const dataKey = viewMode === 'daily' ? 'amountInCents' : 'cumulativeInCents';

  return (
    <div>
      {/* Header with Mode Toggle */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-serif font-bold text-base text-ink-primary dark:text-darkink-primary">
            Spending Velocity
          </h3>
          <p className="text-xs text-ink-muted dark:text-darkink-muted">
            {viewMode === 'daily' ? 'Daily individual outlay' : 'Month-to-date accumulated spend'}
          </p>
        </div>

        <div className="flex items-center bg-paper-muted dark:bg-darkpaper-muted p-0.5 rounded-lg border border-paper-border dark:border-darkpaper-border">
          <button
            onClick={() => setViewMode('daily')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              viewMode === 'daily'
                ? 'bg-paper-card dark:bg-darkpaper-card text-ink-primary dark:text-darkink-primary shadow-subtle'
                : 'text-ink-secondary dark:text-darkink-secondary hover:text-ink-primary'
            }`}
          >
            Daily
          </button>
          <button
            onClick={() => setViewMode('cumulative')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
              viewMode === 'cumulative'
                ? 'bg-paper-card dark:bg-darkpaper-card text-ink-primary dark:text-darkink-primary shadow-subtle'
                : 'text-ink-secondary dark:text-darkink-secondary hover:text-ink-primary'
            }`}
          >
            Cumulative
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2D5A4A" stopOpacity={0.28} />
                <stop offset="95%" stopColor="#2D5A4A" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="currentColor"
              className="text-paper-border dark:text-darkpaper-border opacity-60"
            />
            <XAxis
              dataKey="displayDate"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-ink-muted dark:text-darkink-muted"
              interval="preserveStartEnd"
              minTickGap={24}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              className="text-ink-muted dark:text-darkink-muted"
              tickFormatter={(val) => formatCurrency(val, currencyCode, true)}
            />
            <Tooltip
              content={<CustomChartTooltip currencyCode={currencyCode} type="daily" />}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke="#2D5A4A"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#spendGradient)"
              activeDot={{
                r: 5,
                fill: '#2D5A4A',
                stroke: '#FAF8F5',
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
