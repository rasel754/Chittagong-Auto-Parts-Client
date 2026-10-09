// Utility functions for converting and parsing Bengali and English digits

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
const EN_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

/**
 * Convert any string containing English digits to Bengali digits
 */
export function toBengaliDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return '';
  const str = String(input);
  return str.replace(/\d/g, (d) => BN_DIGITS[parseInt(d, 10)]);
}

/**
 * Convert Bengali digits to English digits
 */
export function toEnglishDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return '';
  let str = String(input);
  for (let i = 0; i < 10; i++) {
    str = str.replace(new RegExp(BN_DIGITS[i], 'g'), EN_DIGITS[i]);
  }
  return str;
}

/**
 * Cleanly parse user input number which may contain Bengali or English digits, commas, etc.
 */
export function parseLocalizedNumber(input: string | number | null | undefined): number {
  if (input === null || input === undefined) return 0;
  if (typeof input === 'number') return isNaN(input) ? 0 : input;
  const english = toEnglishDigits(input).replace(/[,\s]/g, '');
  const parsed = parseFloat(english);
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format a number with localized comma separators (e.g. 1,50,000 for BD or standard 150,000)
 */
export function formatLocalizedNumber(
  num: number | null | undefined,
  locale: 'bn' | 'en' = 'bn'
): string {
  if (num === null || num === undefined || isNaN(num)) return locale === 'bn' ? '০' : '0';
  
  // Format with standard Indian/Bangladeshi numbering system (e.g. 1,00,000) or standard intl
  const formattedEn = new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
  }).format(num);

  if (locale === 'bn') {
    return toBengaliDigits(formattedEn);
  }
  return formattedEn;
}
