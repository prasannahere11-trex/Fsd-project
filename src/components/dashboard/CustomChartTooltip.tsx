import React from 'react';
import { formatCurrency } from '../../utils/formatters';

interface TooltipPayloadItem {
  name: string;
  value: number;
  color?: string;
  payload?: any;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  currencyCode?: string;
  type?: 'daily' | 'category' | 'comparison';
}

export const CustomChartTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  currencyCode = 'INR',
  type = 'daily',
}) => {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0];
  const valueInCents = data.value;

  return (
    <div className="bg-paper-card/95 dark:bg-darkpaper-card/95 backdrop-blur-md border border-paper-border dark:border-darkpaper-border rounded-xl shadow-popover p-3 min-w-[160px] animate-fade-in pointer-events-none">
      <p className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted dark:text-darkink-muted mb-1">
        {label || data.name}
      </p>
      <div className="flex items-center justify-between space-x-3">
        <span className="text-xs text-ink-secondary dark:text-darkink-secondary flex items-center space-x-1.5">
          {data.color && (
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: data.color }}
            />
          )}
          <span>{type === 'comparison' ? 'Monthly Spend' : (data.payload?.categoryName || 'Spent')}</span>
        </span>
        <span className="font-serif font-semibold text-sm text-ink-primary dark:text-darkink-primary">
          {formatCurrency(valueInCents, currencyCode)}
        </span>
      </div>

      {data.payload?.count !== undefined && (
        <p className="text-[11px] text-ink-muted dark:text-darkink-muted mt-1">
          {data.payload.count} transaction{data.payload.count === 1 ? '' : 's'}
        </p>
      )}

      {data.payload?.percentage !== undefined && (
        <p className="text-[11px] text-ink-muted dark:text-darkink-muted mt-0.5">
          {data.payload.percentage.toFixed(1)}% of monthly total
        </p>
      )}
    </div>
  );
};
