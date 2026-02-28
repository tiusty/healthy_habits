/**
 * Returns the Monday of the week that contains the given date (week = Mon–Sun, 7 days).
 * So "this week" always starts on Monday regardless of when the entry was created.
 */
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon, ...
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  d.setDate(d.getDate() - daysToMonday);
  return d;
}

/** True if the given date is a Monday (getDay() === 1). */
export function isMonday(date: Date): boolean {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getDay() === 1;
}

/**
 * Returns the Sunday of the week that contains the given date (same week as startOfWeek).
 */
export function endOfWeek(date: Date): Date {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end;
}

/**
 * Helper function to calculate next Monday from a given date.
 * @note If the given date is a Monday, the function will return next week's Monday.
 * @param fromDate Given date, the function will return the next Monday from the given date.
 * @returns Next Monday from the given date.
 */
export const calculateNextMonday = (fromDate: Date): Date => {
    console.log('fromDate', fromDate);
    const dayOfWeek = fromDate.getDay(); 
    // Calculate days to add to reach next Monday
    // If Sunday (0): add 1 day to get next week's Monday
    // If Monday (1): add 7 days to get next week's Monday
    // If Tuesday (2): add 6 days to get next Monday
    // If Wednesday (3): add 5 days to get next Monday
    // If Thursday (4): add 4 days to get next Monday
    // If Friday (5): add 3 days to get next Monday
    // If Saturday (6): add 2 days to get next Monday
    const daysToAdd = dayOfWeek === 0 ? 1 : (8 - dayOfWeek);
    const nextMonday = new Date(fromDate);
    nextMonday.setDate(fromDate.getDate() + daysToAdd);
    nextMonday.setHours(0, 0, 0, 0); 
    return nextMonday;
  };

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Number of whole days between two dates (inclusive of both). Assumes dates are at midnight. */
export function daysBetween(start: Date, end: Date): number {
  const a = new Date(start);
  const b = new Date(end);
  a.setHours(0, 0, 0, 0);
  b.setHours(0, 0, 0, 0);
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY) + 1;
}

/**
 * For the current week (startDate..endDate), returns how many days are left including today.
 * So if today is Wednesday and endDate is Sunday, returns 5 (Wed–Sun).
 */
export function daysLeftInWeek(today: Date, endDate: Date): number {
  const t = new Date(today);
  const e = new Date(endDate);
  t.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);
  if (e.getTime() < t.getTime()) return 0;
  return Math.round((e.getTime() - t.getTime()) / MS_PER_DAY) + 1;
}

/**
 * Servings left for the week based on days left: ceil((daysLeft / totalDays) * minServingsForWeek).
 * Used when generating recipes mid-week so we don't over-plan.
 */
export function servingsLeftForWeek(
  daysLeft: number,
  totalDays: number,
  minServingsForWeek: number
): number {
  if (totalDays <= 0) return minServingsForWeek;
  return Math.ceil((daysLeft / totalDays) * minServingsForWeek);
}

/**
 * Number of recipes to plan for the remainder of the week: ceil((daysLeft / totalDays) * numberOfRecipesPerWeek).
 */
export function recipesLeftForWeek(
  daysLeft: number,
  totalDays: number,
  numberOfRecipesPerWeek: number
): number {
  if (totalDays <= 0) return numberOfRecipesPerWeek;
  return Math.ceil((daysLeft / totalDays) * numberOfRecipesPerWeek);
}