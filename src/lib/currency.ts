import { formatLocalizedNumber } from './number';

/**
 * Format currency in Bangladeshi Taka (৳)
 * Displays ৳ symbol with proper spacing and localized digits
 */
export function formatCurrency(
  amount: number | null | undefined,
  locale: 'bn' | 'en' = 'bn',
  options: { showSymbol?: boolean } = { showSymbol: true }
): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    amount = 0;
  }

  const formattedNum = formatLocalizedNumber(amount, locale);
  
  if (!options.showSymbol) {
    return formattedNum;
  }

  // Consistent ৳ prefix notation
  return `৳ ${formattedNum}`;
}

/**
 * Format quantity in pieces (pcs / পিস)
 */
export function formatQuantity(
  quantity: number | null | undefined,
  locale: 'bn' | 'en' = 'bn'
): string {
  const formatted = formatLocalizedNumber(quantity ?? 0, locale);
  const unit = locale === 'bn' ? 'পিস' : 'pcs';
  return `${formatted} ${unit}`;
}
