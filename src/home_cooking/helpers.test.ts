import { describe, it, expect } from 'vitest';
import { calculateNextMonday } from './helpers';

describe('calculateNextMonday', () => {
  it('should return next Monday when given a Monday', () => {
    // Monday, January 1, 2024
    const monday = new Date(2024, 0, 1);
    monday.setHours(0, 0, 0, 0);
    const result = calculateNextMonday(monday);
    
    // Should be Monday, January 8, 2024 (next week's Monday)
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(8);
    expect(result.getMonth()).toBe(0); // January
    expect(result.getFullYear()).toBe(2024);
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });

  it('should return next Monday when given a Tuesday', () => {
    // Tuesday, January 2, 2024
    const tuesday = new Date(2024, 0, 2);
    tuesday.setHours(0, 0, 0, 0);
    const result = calculateNextMonday(tuesday);
    
    // Should be Monday, January 8, 2024
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(8);
    expect(result.getMonth()).toBe(0);
    expect(result.getFullYear()).toBe(2024);
  });

  it('should return next Monday when given a Wednesday', () => {
    // Wednesday, January 3, 2024
    const wednesday = new Date(2024, 0, 3);
    wednesday.setHours(0, 0, 0, 0);
    const result = calculateNextMonday(wednesday);
    
    // Should be Monday, January 8, 2024
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(8);
  });

  it('should return next Monday when given a Thursday', () => {
    // Thursday, January 4, 2024
    const thursday = new Date(2024, 0, 4);
    thursday.setHours(0, 0, 0, 0);
    const result = calculateNextMonday(thursday);
    
    // Should be Monday, January 8, 2024
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(8);
  });

  it('should return next Monday when given a Friday', () => {
    // Friday, January 5, 2024
    const friday = new Date(2024, 0, 5);
    friday.setHours(0, 0, 0, 0);
    const result = calculateNextMonday(friday);
    
    // Should be Monday, January 8, 2024
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(8);
  });

  it('should return next Monday when given a Saturday', () => {
    // Saturday, January 6, 2024
    const saturday = new Date(2024, 0, 6);
    saturday.setHours(0, 0, 0, 0);
    const result = calculateNextMonday(saturday);
    
    // Should be Monday, January 8, 2024
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(8);
  });

  it('should return next Monday when given a Sunday', () => {
    // Sunday, January 7, 2024
    const sunday = new Date(2024, 0, 7);
    sunday.setHours(0, 0, 0, 0);
    const result = calculateNextMonday(sunday);
    
    // Should be Monday, January 15, 2024 (next week's Monday, since Sunday + 8 = next week's Monday)
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(15); // Next week's Monday
  });

  it('should normalize time to midnight (00:00:00)', () => {
    // Monday with specific time
    const mondayWithTime = new Date(2024, 0, 1, 14, 30, 45);
    const result = calculateNextMonday(mondayWithTime);
    
    expect(result.getHours()).toBe(0);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
    expect(result.getMilliseconds()).toBe(0);
  });

  it('should handle month boundaries correctly', () => {
    // Friday, January 26, 2024 (near end of month)
    const friday = new Date(2024, 0, 26);
    friday.setHours(0, 0, 0, 0);
    const result = calculateNextMonday(friday);
    
    // Should be Monday, January 29, 2024 (Friday + 3 days = Monday)
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(29);
    expect(result.getMonth()).toBe(0); // Still January
  });

  it('should handle month transitions correctly', () => {
    // Friday, January 26, 2024 (last Friday of January)
    const friday = new Date(2024, 0, 26);
    friday.setHours(0, 0, 0, 0);
    const result = calculateNextMonday(friday);
    
    // Should be Monday, January 29, 2024 (Friday + 3 days = Monday, same month)
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(29);
    expect(result.getMonth()).toBe(0); // Still January
    expect(result.getFullYear()).toBe(2024);
  });

  it('should handle month transitions when crossing month boundary', () => {
    // Wednesday, January 31, 2024 (last day of January)
    const wednesday = new Date(2024, 0, 31);
    wednesday.setHours(0, 0, 0, 0);
    const result = calculateNextMonday(wednesday);
    
    // Should be Monday, February 5, 2024 (Wednesday + 5 days = Monday, next month)
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(5);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getFullYear()).toBe(2024);
  });

  it('should handle year boundaries correctly', () => {
    // Friday, December 27, 2024 (near end of year)
    const friday = new Date(2024, 11, 27);
    friday.setHours(0, 0, 0, 0);
    const result = calculateNextMonday(friday);
    
    // Should be Monday, December 30, 2024 (Friday + 3 days = Monday)
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(30);
    expect(result.getMonth()).toBe(11); // December
    expect(result.getFullYear()).toBe(2024);
  });

  it('should handle leap year February correctly', () => {
    // Friday, February 23, 2024 (leap year)
    const friday = new Date(2024, 1, 23);
    friday.setHours(0, 0, 0, 0);
    const result = calculateNextMonday(friday);
    
    // Should be Monday, February 26, 2024 (Friday + 3 days = Monday)
    expect(result.getDay()).toBe(1); // Monday
    expect(result.getDate()).toBe(26);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getFullYear()).toBe(2024);
  });

  it('should return a new Date object and not modify the input', () => {
    const inputDate = new Date(2024, 0, 1, 14, 30, 45);
    const originalTime = inputDate.getTime();
    
    const result = calculateNextMonday(inputDate);
    
    // Input should not be modified
    expect(inputDate.getTime()).toBe(originalTime);
    expect(inputDate.getHours()).toBe(14);
    expect(inputDate.getMinutes()).toBe(30);
    
    // Result should be a different object
    expect(result).not.toBe(inputDate);
  });
});

