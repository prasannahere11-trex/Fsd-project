import React, { useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { CategoryBreakdownItem } from '../../types/expense';
import { formatCurrency, formatAmountNumber } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { CustomChartTooltip } from './CustomChartTooltip';

interface CategoryDonutChartProps {
  data: CategoryBreakdownItem[];
  totalInCents: number;
  currencyCode: string;
  onSelectCategory?: (categoryId: string) => void;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({
  data,
  totalInCents,
  currencyCode,
  onSelectCategory,
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (!data || data.length === 0 || totalInCents === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-center p-6">
        <div className="w-12 h-12 rounded-full bg-paper-muted dark:bg-darkpaper-muted flex items-center justify-center text-ink-muted dark:text-darkink-muted mb-2">
          <CategoryIcon name="Tag" className="w-5 h-5 opacity-50" />
        </div>
        <p className="text-sm font-medium text-ink-secondary dark:text-darkink-secondary">
          No expenses recorded for this month
        </p>
        <p className="text-xs text-ink-muted dark:text-darkink-muted mt-1">
          Add transactions to see category distribution.
        </p>
      </div>
    );
  }

  const activeItem = activeIndex !== null ? data[activeIndex] : null;
  const displayedTotal = activeItem ? activeItem.totalInCents : totalInCents;
  const { symbol, integerPart, decimalPart } = formatAmountNumber(displayedTotal, currencyCode);

  return (
    <div className="flex flex-col">
      {/* Donut Container with Centered Metric */}
      <div className="relative h-64 w-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              content={<CustomChartTooltip currencyCode={currencyCode} type="category" />}
            />
            <Pie
              data={data}
              dataKey="totalInCents"
              nameKey="categoryName"
              cx="50%"
              cy="50%"
              innerRadius={72}
              outerRadius={96}
              paddingAngle={3}
              stroke="none"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={(entry: any) => onSelectCategory && onSelectCategory(entry.categoryId)}
              className="cursor-pointer outline-none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.categoryId}-${index}`}
                  fill={entry.color}
                  opacity={activeIndex === null || activeIndex === index ? 1 : 0.45}
                  style={{
                    filter: activeIndex === index ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Centered Total in Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-4">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-ink-muted dark:text-darkink-muted truncate max-w-[120px]">
            {activeItem ? activeItem.categoryName : 'Total Spent'}
          </span>
          <div className="font-serif font-bold text-ink-primary dark:text-darkink-primary text-xl sm:text-2xl tracking-tight leading-tight mt-0.5">
            <span className="text-sm font-normal mr-0.5">{symbol}</span>
            <span>{integerPart}</span>
            <span className="text-xs opacity-70">{decimalPart}</span>
          </div>
          {activeItem && (
            <span className="text-[11px] font-medium text-ink-secondary dark:text-darkink-secondary mt-0.5">
              {activeItem.percentage.toFixed(1)}% of total
            </span>
          )}
        </div>
      </div>

      {/* Custom Category List / Legend below */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-paper-borderSubtle dark:border-darkpaper-borderSubtle">
        {data.slice(0, 6).map((item) => (
          <div
            key={item.categoryId}
            onClick={() => onSelectCategory && onSelectCategory(item.categoryId)}
            className="flex items-center justify-between p-1.5 rounded-lg hover:bg-paper-muted dark:hover:bg-darkpaper-cardHover cursor-pointer transition-colors text-xs"
          >
            <div className="flex items-center space-x-2 truncate">
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-ink-secondary dark:text-darkink-secondary truncate font-medium">
                {item.categoryName}
              </span>
            </div>
            <span className="font-serif font-semibold text-ink-primary dark:text-darkink-primary ml-2 flex-shrink-0">
              {formatCurrency(item.totalInCents, currencyCode, true)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
