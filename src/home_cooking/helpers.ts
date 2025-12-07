/**
 * Helper function to calculate next Monday from a given date.
 * @note If the given date is a Monday, the function will return next week's Monday.
 * @param fromDate Given date, the function will return the next Monday from the given date.
 * @returns Next Monday from the given date.
 */
export const calculateNextMonday = (fromDate: Date): Date => {
    const dayOfWeek = fromDate.getDay(); 
    const daysToAdd = dayOfWeek === 1 ? 7 : (7 - dayOfWeek); 
    const nextMonday = new Date(fromDate);
    nextMonday.setDate(fromDate.getDate() + daysToAdd);
    nextMonday.setHours(0, 0, 0, 0); 
    return nextMonday;
  };