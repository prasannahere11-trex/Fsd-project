import { format, isToday, isYesterday, parseISO } from 'date-fns';

export interface CurrencyConfig {
  code: string;
  symbol: string;
  locale: string;
}

export const CURRENCIES: Record<string, CurrencyConfig> = {
  INR: { code: 'INR', symbol: '₹', locale: 'en-IN' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB' },
};

export const DEFAULT_CURRENCY_CODE = 'INR';

/**
 * Converts integer paise/cents into standard formatted currency string.
 * Example: 154050 -> "₹1,540.50"
 */
export function formatCurrency(
  amountInCents: number,
  currencyCode: string = DEFAULT_CURRENCY_CODE,
  compact: boolean = false
): string {
  const config = CURRENCIES[currencyCode] || CURRENCIES.INR;
  const standardAmount = (amountInCents || 0) / 100;

  if (compact && Math.abs(standardAmount) >= 1000) {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(standardAmount);
  }

  return new Intl.NumberFormat(config.locale, {
    style: 'currency',
    currency: config.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(standardAmount);
}

/**
 * Format raw number with commas and 2 decimal points (without currency symbol for custom serif rendering)
 */
export function formatAmountNumber(
  amountInCents: number,
  currencyCode: string = DEFAULT_CURRENCY_CODE
): { symbol: string; integerPart: string; decimalPart: string } {
  const config = CURRENCIES[currencyCode] || CURRENCIES.INR;
  const standardAmount = Math.abs((amountInCents || 0) / 100);

  const parts = standardAmount.toFixed(2).split('.');
  const intVal = parseInt(parts[0], 10);
  const formattedInt = new Intl.NumberFormat(config.locale).format(intVal);

  return {
    symbol: config.symbol,
    integerPart: (amountInCents < 0 ? '-' : '') + formattedInt,
    decimalPart: '.' + parts[1],
  };
}

/**
 * Converts decimal input from form (e.g. "120.50" or 120.5) to safe integer cents (12050)
 */
export function decimalToCents(amount: number | string): number {
  if (typeof amount === 'string') {
    amount = parseFloat(amount.replace(/[^0-9.-]+/g, ''));
  }
  if (isNaN(amount) || amount === 0) return 0;
  return Math.round(amount * 100);
}

/**
 * Converts integer cents (12050) to decimal number (120.50)
 */
export function centsToDecimal(amountInCents: number): number {
  return (amountInCents || 0) / 100;
}

/**
 * Human-friendly grouped date header
 */
export function formatGroupDate(dateStr: string): string {
  try {
    const parsed = parseISO(dateStr);
    if (isToday(parsed)) {
      return 'Today';
    }
    if (isYesterday(parsed)) {
      return 'Yesterday';
    }
    return format(parsed, 'EEEE, d MMMM yyyy');
  } catch {
    return dateStr;
  }
}

export function formatShortDate(dateStr: string): string {
  try {
    const parsed = parseISO(dateStr);
    return format(parsed, 'd MMM yyyy');
  } catch {
    return dateStr;
  }
}
