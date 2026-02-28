import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

// Mock the HomeCooking component to avoid complex dependencies
vi.mock('./home_cooking/HomeCooking', () => ({
  default: () => <div data-testid="home-cooking">Home Cooking Component</div>,
}));

describe('App', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('renders the navigation tab as a clickable button', () => {
    render(<App />);
    
    const homeCookingTab = screen.getByRole('button', { name: 'Home Cooking' });
    expect(homeCookingTab).toBeTruthy();
    expect(homeCookingTab.tagName).toBe('BUTTON');
  });

  it('renders the HomeCooking component by default', () => {
    render(<App />);
    
    expect(screen.getByTestId('home-cooking')).toBeTruthy();
  });

  it('renders HomeCooking component when Home Cooking tab is clicked', () => {
    render(<App />);
    
    const homeCookingTab = screen.getByRole('button', { name: 'Home Cooking' });
    
    // Verify component is rendered initially
    expect(screen.getByTestId('home-cooking')).toBeTruthy();
    
    // Click the tab
    fireEvent.click(homeCookingTab);
    
    // HomeCooking component should still be rendered after click
    expect(screen.getByTestId('home-cooking')).toBeTruthy();
  });

  it('allows clicking the Home Cooking tab multiple times without errors', () => {
    render(<App />);
    
    const homeCookingTab = screen.getByRole('button', { name: 'Home Cooking' });
    
    // Click multiple times
    fireEvent.click(homeCookingTab);
    fireEvent.click(homeCookingTab);
    fireEvent.click(homeCookingTab);
    
    // Component should still be rendered
    expect(screen.getByTestId('home-cooking')).toBeTruthy();
  });
});
