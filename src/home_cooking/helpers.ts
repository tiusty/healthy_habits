export const calculateNextMonday = (fromDate: Date): Date => {
    const dayOfWeek = fromDate.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysToAdd = dayOfWeek === 1 ? 7 : (7 - dayOfWeek); // If Sunday, add 7; otherwise add days to reach next Sunday
    const nextMonday = new Date(fromDate);
    nextMonday.setDate(fromDate.getDate() + daysToAdd);
    nextMonday.setHours(0, 0, 0, 0); // Set to start of day
    return nextMonday;
  };