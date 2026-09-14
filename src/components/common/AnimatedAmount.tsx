import React, { useEffect, useState } from 'react';
import { formatAmountNumber } from '../../utils/formatters';

interface AnimatedAmountProps {
  amountInCents: number;
  currencyCode?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showDecimals?: boolean;
}

export const AnimatedAmount: React.FC<AnimatedAmountProps> = ({
  amountInCents,
  currencyCode = 'INR',
  className = '',
  size = 'lg',
  showDecimals = true,
}) => {
  const [displayCents, setDisplayCents] = useState(amountInCents);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = displayCents;
    const endValue = amountInCents;
    const duration = 650; // ms

    if (startValue === endValue) return;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startValue + (endValue - startValue) * easeProgress);
      setDisplayCents(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    const animId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animId);
  }, [amountInCents]);

  const { symbol, integerPart, decimalPart } = formatAmountNumber(displayCents, currencyCode);

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base font-medium',
    lg: 'text-xl font-semibold',
    xl: 'text-3xl font-bold tracking-tight',
    hero: 'text-4xl sm:text-5xl font-bold tracking-tight',
  }[size];

  const symbolSizeClasses = {
    sm: 'text-xs mr-0.5',
    md: 'text-sm mr-1',
    lg: 'text-base mr-1 opacity-80',
    xl: 'text-xl mr-1.5 opacity-80',
    hero: 'text-2xl sm:text-3xl mr-2 opacity-75 font-serif',
  }[size];

  const decimalSizeClasses = {
    sm: 'text-xs',
    md: 'text-xs opacity-75',
    lg: 'text-sm opacity-75',
    xl: 'text-base opacity-70 font-normal',
    hero: 'text-lg sm:text-xl opacity-70 font-normal',
  }[size];

  return (
    <span className={`inline-flex items-baseline font-serif font-number text-ink-primary dark:text-darkink-primary tabular-nums ${sizeClasses} ${className}`}>
      <span className={`font-serif font-normal select-none ${symbolSizeClasses}`}>{symbol}</span>
      <span>{integerPart}</span>
      {showDecimals && (
        <span className={`font-serif tracking-normal ${decimalSizeClasses}`}>{decimalPart}</span>
      )}
    </span>
  );
};
