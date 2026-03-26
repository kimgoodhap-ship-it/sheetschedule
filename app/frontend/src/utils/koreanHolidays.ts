/**
 * Date utilities
 */

/**
 * Format date as 'YYYY-MM-DD' string
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Check if date is a holiday (placeholder - always returns false)
 */
export function isKoreanHoliday(_date: Date): boolean {
  return false;
}

/**
 * Get holiday name (placeholder - always returns null)
 */
export function getHolidayName(_date: Date): string | null {
  return null;
}

/**
 * Check if date is a weekend (Saturday or Sunday)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Check if date is a non-working day (weekend or holiday)
 */
export function isRedDay(date: Date): boolean {
  return isWeekend(date) || isKoreanHoliday(date);
}

/**
 * Get holidays for a specific month (placeholder - returns empty array)
 */
export function getMonthHolidays(_year: number, _month: number): { day: number; name: string }[] {
  return [];
}
