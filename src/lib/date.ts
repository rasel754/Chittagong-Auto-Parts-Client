import { toBengaliDigits } from './number';

const BN_MONTHS_SHORT = [
  'জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'
];

const BN_MONTHS_FULL = [
  'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
  'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'
];

const EN_MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Format a date string or Date object into localized readable format
 * e.g. "০৯ অক্টো, ২০২৬" (bn) or "09 Oct, 2026" (en)
 */
export function formatDate(
  dateInput: string | Date | null | undefined,
  locale: 'bn' | 'en' = 'bn',
  options: { includeTime?: boolean; fullMonth?: boolean } = {}
): string {
  if (!dateInput) return '-';
  
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (isNaN(d.getTime())) return String(dateInput);

  const day = d.getDate();
  const monthIdx = d.getMonth();
  const year = d.getFullYear();

  if (locale === 'bn') {
    const dayStr = toBengaliDigits(day < 10 ? `0${day}` : `${day}`);
    const monthStr = options.fullMonth ? BN_MONTHS_FULL[monthIdx] : BN_MONTHS_SHORT[monthIdx];
    const yearStr = toBengaliDigits(year);
    
    let result = `${dayStr} ${monthStr}, ${yearStr}`;

    if (options.includeTime) {
      let hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'বিকাল' : 'সকাল';
      hours = hours % 12 || 12;
      const hoursStr = toBengaliDigits(hours < 10 ? `0${hours}` : `${hours}`);
      const minsStr = toBengaliDigits(minutes < 10 ? `0${minutes}` : `${minutes}`);
      result += ` (${ampm} ${hoursStr}:${minsStr})`;
    }

    return result;
  } else {
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    const monthStr = options.fullMonth ? d.toLocaleString('en', { month: 'long' }) : EN_MONTHS_SHORT[monthIdx];
    let result = `${dayStr} ${monthStr}, ${year}`;

    if (options.includeTime) {
      let hours = d.getHours();
      const minutes = d.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      const hoursStr = hours < 10 ? `0${hours}` : `${hours}`;
      const minsStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
      result += ` (${hoursStr}:${minsStr} ${ampm})`;
    }

    return result;
  }
}

/**
 * Get current date as YYYY-MM-DD for standard input fields
 */
export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
