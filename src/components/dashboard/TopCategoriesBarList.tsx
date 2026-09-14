import React from 'react';
import type { CategoryBreakdownItem } from '../../types/expense';
import { formatCurrency } from '../../utils/formatters';
import { CategoryIcon } from '../common/CategoryIcon';
import { ArrowUpRight } from 'lucide-react';

interface TopCategoriesBarListProps {
  data: CategoryBreakdownItem[];
  currencyCode: string;
  onViewCategory?: (categoryId: string) => void;
}

export const TopCategoriesBarList: React.FC<TopCategoriesBarListProps> = ({
  data,
  currencyCode,
  onViewCategory,
}) => {
  const top5 = data.slice(0, 5);
  const maxSpend = top5.length > 0 ? Math.max(...top5.map((d) => d.totalInCents)) : 1;

  if (top5.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-ink-muted dark:text-darkink-muted">
        No category activity to display.
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {top5.map((item, index) => {
        const barWidth = Math.max(8, Math.round((item.totalInCents / maxSpend) * 100));

        return (
          <div
            key={item.categoryId}
            onClick={() => onViewCategory && onViewCategory(item.categoryId)}
            className="group p-2 -mx-2 rounded-xl hover:bg-paper-muted/70 dark:hover:bg-darkpaper-cardHover transition-colors cursor-pointer"
          >
            {/* Top row with name, badge, and amount */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-2.5 truncate">
                <span className="text-xs font-mono font-medium text-ink-light dark:text-darkink-muted w-4">
                  0{index + 1}
                </span>
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: item.color + '22', color: item.color }}
                >
                  <CategoryIcon name={item.icon} className="w-3.5 h-3.5" />
                </div>
                <span className="text-sm font-medium text-ink-primary dark:text-darkink-primary truncate">
                  {item.categoryName}
                </span>
              </div>

              <div className="flex items-center space-x-2 flex-shrink-0">
                <span className="text-xs text-ink-muted dark:text-darkink-muted">
                  {item.percentage.toFixed(0)}%
                </span>
                <span className="font-serif font-semibold text-sm text-ink-primary dark:text-darkink-primary">
                  {formatCurrency(item.totalInCents, currencyCode)}
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 text-ink-light opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>

            {/* Horizontal Bar Track */}
            <div className="h-2 w-full bg-paper-muted dark:bg-darkpaper-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 ease-out"
                style={{
                  width: `${barWidth}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
