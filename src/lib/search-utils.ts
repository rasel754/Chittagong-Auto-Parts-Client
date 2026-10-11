/**
 * Utility functions for robust search across mixed Bangla and English text,
 * zero-width character stripping, and multi-word token matching.
 */

/**
 * Normalizes text to Unicode NFC and strips invisible zero-width characters
 * commonly created by Bangla IME / keyboards (Avro, Bijoy, mobile keyboards).
 */
export function normalizeSearchText(str: string | undefined | null): string {
  if (!str) return '';
  return str
    .normalize('NFC')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim()
    .toLowerCase();
}

/**
 * Matches a query against one or multiple fields.
 * Supports multi-word tokens in mixed languages (Bangla & English) in any order.
 * E.g. "Toyota ব্রেক" will match if both "toyota" and "ব্রেক" exist in any of the fields.
 */
export function matchesMixedQuery(
  fields: (string | undefined | null)[] | string | undefined | null,
  query: string
): boolean {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) return true;

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return true;

  const targetList = Array.isArray(fields) ? fields : [fields];
  const combinedTarget = targetList
    .map((f) => normalizeSearchText(f))
    .filter(Boolean)
    .join(' ');

  // All tokens must be present in the target string
  return tokens.every((token) => combinedTarget.includes(token));
}
