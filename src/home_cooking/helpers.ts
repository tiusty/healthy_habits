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