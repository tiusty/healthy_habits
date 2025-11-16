import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Preferences from './Preferences';
import { RecipePreferences, Recipe } from './types';
import { defaultPreferences } from './defaultPreferences';

// Mock window.confirm
const mockConfirm = vi.fn();
beforeEach(() => {
  window.confirm = mockConfirm;
  mockConfirm.mockClear();
});

describe('Preferences', () => {
  const mockRecipes: Recipe[] = [
    {
      id: '1',
      name: 'Test Recipe',
      description: 'A test recipe',
      ingredients: [],
      instructions: [],
      prepTimeMinutes: 10,
      cookTimeMinutes: 20,
      numOfServings: 4,
      difficulty: 'Easy',
      proteinTypes: ['chicken'],
      mealTypes: ['dinner'],
      cookingMethods: ['oven'],
      dietaryTags: ['healthy'],
      tags: ['healthy', 'quick'],
    },
  ];

  const mockOnSave = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    preferences: defaultPreferences,
    onSave: mockOnSave,
    recipes: mockRecipes,
  };

  beforeEach(() => {
    mockOnSave.mockClear();
    mockOnCancel.mockClear();
  });

  describe('Toggle Functionality', () => {
    it('toggles meal type - adds when not selected, removes when selected', () => {
      render(<Preferences {...defaultProps} onCancel={mockOnCancel} />);

      const snackButton = screen.getByRole('button', { name: 'snack' });
      const breakfastButton = screen.getByRole('button', { name: 'breakfast' });

      // Add snack (not in default preferences)
      fireEvent.click(snackButton);
      expect(snackButton.className).toContain('bg-indigo-600');

      // Remove breakfast (in default preferences)
      fireEvent.click(breakfastButton);
      expect(breakfastButton.className).toContain('bg-gray-100');
    });

    it('toggles protein type - adds when not selected, removes when selected', () => {
      render(<Preferences {...defaultProps} onCancel={mockOnCancel} />);

      const otherButton = screen.getByRole('button', { name: 'other' });
      const chickenButton = screen.getByRole('button', { name: 'chicken' });

      // Add other (not in default preferences)
      fireEvent.click(otherButton);
      expect(otherButton.className).toContain('bg-indigo-600');

      // Remove chicken (in default preferences)
      fireEvent.click(chickenButton);
      expect(chickenButton.className).toContain('bg-gray-100');
    });

    it('toggles difficulty level - adds when not selected, removes when selected', () => {
      const preferences: RecipePreferences = {
        ...defaultPreferences,
        difficultyLevels: ['Easy'],
      };

      render(<Preferences {...defaultProps} preferences={preferences} onCancel={mockOnCancel} />);

      const mediumButton = screen.getByRole('button', { name: 'Medium' });
      const easyButton = screen.getByRole('button', { name: 'Easy' });

      // Add Medium
      fireEvent.click(mediumButton);
      expect(mediumButton.className).toContain('bg-indigo-600');

      // Remove Easy
      fireEvent.click(easyButton);
      expect(easyButton.className).toContain('bg-gray-100');
    });

    it('toggles dietary tags - adds when not selected, removes when selected', () => {
      render(<Preferences {...defaultProps} onCancel={mockOnCancel} />);

      const healthyButton = screen.getByRole('button', { name: 'healthy' });
      const quickButton = screen.getByRole('button', { name: 'quick' });

      // Add healthy
      fireEvent.click(healthyButton);
      expect(healthyButton.className).toContain('bg-indigo-600');

      // Remove healthy
      fireEvent.click(healthyButton);
      expect(healthyButton.className).toContain('bg-gray-100');

      // Add quick
      fireEvent.click(quickButton);
      expect(quickButton.className).toContain('bg-indigo-600');
    });
  });

  describe('Save Functionality', () => {
    it('calls onSave with updated preferences when save is clicked', () => {
      render(<Preferences {...defaultProps} onCancel={mockOnCancel} />);

      // Make a change by toggling a meal type
      const snackButton = screen.getByRole('button', { name: 'snack' });
      fireEvent.click(snackButton);

      const saveButton = screen.getByText('Save Preferences');
      fireEvent.click(saveButton);

      expect(mockOnSave).toHaveBeenCalledTimes(1);
      const savedPreferences = mockOnSave.mock.calls[0][0];
      expect(savedPreferences.mealType).toContain('snack');
    });

    it('save button is disabled when there are no changes', () => {
      render(<Preferences {...defaultProps} onCancel={mockOnCancel} />);

      const saveButton = screen.getByText('Save Preferences');
      expect(saveButton.hasAttribute('disabled')).toBe(true);
    });

    it('save button is enabled when there are changes', () => {
      render(<Preferences {...defaultProps} onCancel={mockOnCancel} />);

      const snackButton = screen.getByRole('button', { name: 'snack' });
      fireEvent.click(snackButton);

      const saveButton = screen.getByText('Save Preferences');
      expect(saveButton.hasAttribute('disabled')).toBe(false);
    });
  });

  describe('Reset Functionality', () => {
    it('resets preferences to original values when reset is clicked', () => {
      render(<Preferences {...defaultProps} onCancel={mockOnCancel} />);

      // Make changes
      const snackButton = screen.getByRole('button', { name: 'snack' });
      const breakfastButton = screen.getByRole('button', { name: 'breakfast' });
      
      fireEvent.click(snackButton);
      fireEvent.click(breakfastButton);

      // Verify changes
      expect(snackButton.className).toContain('bg-indigo-600');
      expect(breakfastButton.className).toContain('bg-gray-100');

      // Reset
      const resetButton = screen.getByText('Reset');
      fireEvent.click(resetButton);

      // Check values are reset
      expect(snackButton.className).toContain('bg-gray-100');
      expect(breakfastButton.className).toContain('bg-indigo-600');
    });

    it('reset button is disabled when there are no changes', () => {
      render(<Preferences {...defaultProps} onCancel={mockOnCancel} />);

      const resetButton = screen.getByText('Reset');
      expect(resetButton.hasAttribute('disabled')).toBe(true);
    });

    it('reset button is enabled when there are changes', () => {
      render(<Preferences {...defaultProps} onCancel={mockOnCancel} />);

      const snackButton = screen.getByRole('button', { name: 'snack' });
      fireEvent.click(snackButton);

      const resetButton = screen.getByText('Reset');
      expect(resetButton.hasAttribute('disabled')).toBe(false);
    });
  });

  describe('Cancel Functionality', () => {
    it('calls onCancel when cancel is clicked with no changes', () => {
      render(<Preferences {...defaultProps} onCancel={mockOnCancel} />);

      const cancelButton = screen.getByText('← Back');
      fireEvent.click(cancelButton);

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
      expect(mockConfirm).not.toHaveBeenCalled();
    });

    it('shows confirmation dialog when cancel is clicked with unsaved changes', () => {
      mockConfirm.mockReturnValue(true);

      render(<Preferences {...defaultProps} onCancel={mockOnCancel} />);

      // Make a change
      const snackButton = screen.getByRole('button', { name: 'snack' });
      fireEvent.click(snackButton);

      const cancelButton = screen.getByText('← Back');
      fireEvent.click(cancelButton);

      expect(mockConfirm).toHaveBeenCalledWith(
        'You have unsaved changes. Are you sure you want to cancel?'
      );
      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('does not call onCancel when user cancels confirmation dialog', () => {
      mockConfirm.mockReturnValue(false);

      render(<Preferences {...defaultProps} onCancel={mockOnCancel} />);

      // Make a change
      const snackButton = screen.getByRole('button', { name: 'snack' });
      fireEvent.click(snackButton);

      const cancelButton = screen.getByText('← Back');
      fireEvent.click(cancelButton);

      expect(mockConfirm).toHaveBeenCalled();
      expect(mockOnCancel).not.toHaveBeenCalled();
    });

    it('resets preferences when cancel is confirmed', () => {
      mockConfirm.mockReturnValue(true);

      render(<Preferences {...defaultProps} onCancel={mockOnCancel} />);

      // Make changes
      const snackButton = screen.getByRole('button', { name: 'snack' });
      fireEvent.click(snackButton);

      const cancelButton = screen.getByText('← Back');
      fireEvent.click(cancelButton);

      // Preferences should be reset
      expect(snackButton.className).toContain('bg-gray-100');
    });
  });

  describe('Input Changes', () => {
    it('updates number of meals per week when input changes', () => {
      render(<Preferences {...defaultProps} onCancel={mockOnCancel} />);

      const mealsInput = screen.getByDisplayValue('2') as HTMLInputElement;
      fireEvent.change(mealsInput, { target: { value: '5' } });

      expect(mealsInput.value).toBe('5');
    });

    it('updates minimum servings when input changes', () => {
      render(<Preferences {...defaultProps} onCancel={mockOnCancel} />);

      const servingsMinInput = screen.getByDisplayValue('5') as HTMLInputElement;
      fireEvent.change(servingsMinInput, { target: { value: '10' } });

      expect(servingsMinInput.value).toBe('10');
    });
  });

  describe('Empty State Messages', () => {
    it('shows warning message when no meal types are selected', () => {
      const preferences: RecipePreferences = {
        ...defaultPreferences,
        mealType: [],
      };

      render(<Preferences {...defaultProps} preferences={preferences} onCancel={mockOnCancel} />);

      expect(screen.getByText('No meal types selected - all meal types will be shown')).toBeTruthy();
    });

    it('shows warning message when no protein types are selected', () => {
      const preferences: RecipePreferences = {
        ...defaultPreferences,
        proteinType: [],
      };

      render(<Preferences {...defaultProps} preferences={preferences} onCancel={mockOnCancel} />);

      expect(screen.getByText('No protein types selected - all protein types will be shown')).toBeTruthy();
    });

    it('shows warning message when no difficulty levels are selected', () => {
      const preferences: RecipePreferences = {
        ...defaultPreferences,
        difficultyLevels: [],
      };

      render(<Preferences {...defaultProps} preferences={preferences} onCancel={mockOnCancel} />);

      expect(screen.getByText('No difficulty levels selected - all levels will be shown')).toBeTruthy();
    });
  });
});
