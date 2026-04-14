import { useEffect, useMemo, useState } from 'react';
import { Recipe, RecipePreferences, ReceipeMadeEvent, WeeklyRecipePreferences } from './types';
import { defaultPreferences } from './components/preferences/defaultPreferences';
import RecipeCard from './components/RecipeCard';
import RecipeDetail from './components/RecipeDetail';
import AddRecipe from './components/AddRecipe';
import WeeklyPreferences from './components/preferences/WeeklyPreferences';
import { calculateNextMonday, startOfWeek, endOfWeek, isMonday, daysBetween, daysLeftInWeek, servingsLeftForWeek, recipesLeftForWeek } from './helpers';
import Preferences from './components/preferences/PreferencesEditor';
import { generateRecipes } from './components/preferences/generateReceipes';
import { getDefaultRecipes } from './defaultRecipes';
type View = 'home' | 'add' | 'detail' | 'history' | 'preferences' | 'upcoming' | 'current';

export default function HomeCooking() {
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('recipes');
    if (saved) return JSON.parse(saved);
    return getDefaultRecipes();
  });
  useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  }, [recipes]);
  const [preferences, setPreferences] = useState<RecipePreferences>(() => {
    const savedPreferences = localStorage.getItem('preferences') || JSON.stringify(defaultPreferences);
    return JSON.parse(savedPreferences);
  });
  useEffect(() => {
    localStorage.setItem('preferences', JSON.stringify(preferences));
  }, [preferences]);

  // Helper function to parse dates from localStorage (dates are stored as ISO strings)
  const parseWeeklyPreferences = (saved: string): WeeklyRecipePreferences[] => {
    const parsed = JSON.parse(saved);
    return parsed.map((wp: any) => ({
      ...wp,
      startDate: new Date(wp.startDate),
      endDate: new Date(wp.endDate),
      isActive: wp.isActive !== false,
    }));
  };

  const [weeklyRecipePreferences, setWeeklyRecipePreferences] = useState<WeeklyRecipePreferences[]>(() => {
    const saved = localStorage.getItem('weeklyRecipePreferences');
    if (saved) {
      try {
        return parseWeeklyPreferences(saved);
      } catch {
        // Fallback if parsing fails
      }
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);
    return [{ preferences: defaultPreferences, startDate: weekStart, endDate: weekEnd, generatedRecipes: [], isActive: true }];
  });

  useEffect(() => {
    localStorage.setItem('weeklyRecipePreferences', JSON.stringify(weeklyRecipePreferences));
  }, [weeklyRecipePreferences]);

  // Current week: only the active entry for the date range that contains today
  const currentWeeklyRecipePreferences = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return weeklyRecipePreferences.find(wp => {
      if (wp.isActive === false) return false;
      const start = new Date(wp.startDate);
      const end = new Date(wp.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      return start.getTime() <= today.getTime() && end.getTime() >= today.getTime();
    });
  }, [weeklyRecipePreferences]);

  // Ensure we always have a current-week entry (e.g. after load from storage that only had next week)
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekStart = startOfWeek(today);
    const weekEnd = endOfWeek(today);

    if (!currentWeeklyRecipePreferences) {
      const newEntry: WeeklyRecipePreferences = {
        preferences: defaultPreferences,
        startDate: weekStart,
        endDate: weekEnd,
        generatedRecipes: [],
        isActive: true,
      };
      setWeeklyRecipePreferences(prev => [newEntry, ...prev]);
      return;
    }

    // Migrate when: week is too short (e.g. old today→nextMonday) OR start is not Monday (should always be start of week)
    const currentStart = new Date(currentWeeklyRecipePreferences.startDate);
    const currentEnd = new Date(currentWeeklyRecipePreferences.endDate);
    currentStart.setHours(0, 0, 0, 0);
    currentEnd.setHours(0, 0, 0, 0);
    const currentTotalDays = daysBetween(currentStart, currentEnd);
    const startsOnMonday = isMonday(currentStart);
    if (currentTotalDays >= 7 && startsOnMonday) return;

    const newEntry: WeeklyRecipePreferences = {
      ...currentWeeklyRecipePreferences,
      startDate: weekStart,
      endDate: weekEnd,
      generatedRecipes: [],
      isActive: true,
    };
    const currentStartTime = currentStart.getTime();
    const currentEndTime = currentEnd.getTime();
    setWeeklyRecipePreferences(prev => [
      newEntry,
      ...prev.map(wp => {
        const wpStart = new Date(wp.startDate).getTime();
        const wpEnd = new Date(wp.endDate).getTime();
        if (wpStart === currentStartTime && wpEnd === currentEndTime && wp.isActive !== false) {
          return { ...wp, isActive: false };
        }
        return wp;
      }),
    ]);
  }, [currentWeeklyRecipePreferences]);

  // Upcoming week: active entry for next Monday's week (create if missing)
  const upcomingRecipePreferences = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextMonday = calculateNextMonday(today);
    
    const existing = weeklyRecipePreferences.find(wp => {
      if (wp.isActive === false) return false;
      const start = new Date(wp.startDate);
      start.setHours(0, 0, 0, 0);
      return start.getTime() === nextMonday.getTime();
    });

    if (existing) {
      return existing;
    }

    const nextMondayEnd = new Date(nextMonday);
    nextMondayEnd.setDate(nextMondayEnd.getDate() + 7);
    const newUpcomingPreferences: WeeklyRecipePreferences = {
      preferences: defaultPreferences,
      startDate: nextMonday,
      endDate: nextMondayEnd,
      generatedRecipes: [],
      isActive: true,
    };

    setWeeklyRecipePreferences([...weeklyRecipePreferences, newUpcomingPreferences]);
    return newUpcomingPreferences;
  }, [weeklyRecipePreferences]);

  // Generate recipes for current week when none yet. Mid-week: use servings/recipes left based on days left.
  useEffect(() => {
    if (!currentWeeklyRecipePreferences || currentWeeklyRecipePreferences.generatedRecipes.length > 0) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(currentWeeklyRecipePreferences.startDate);
    const end = new Date(currentWeeklyRecipePreferences.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const totalDays = daysBetween(start, end);
    const daysLeft = daysLeftInWeek(today, end);
    const prefs = currentWeeklyRecipePreferences.preferences;
    const overrides =
      daysLeft < totalDays && totalDays > 0
        ? {
            minServings: servingsLeftForWeek(daysLeft, totalDays, prefs.numOfServingsPerWeek.min),
            numberOfRecipes: recipesLeftForWeek(daysLeft, totalDays, prefs.numberOfReceipesPerWeek),
          }
        : undefined;
    const generatedRecipes = generateRecipes(currentWeeklyRecipePreferences, recipes, overrides);
    const currentStart = new Date(currentWeeklyRecipePreferences.startDate).getTime();
    const currentEnd = new Date(currentWeeklyRecipePreferences.endDate).getTime();
    const updated = weeklyRecipePreferences.map(wp => {
      const wpStart = new Date(wp.startDate).getTime();
      const wpEnd = new Date(wp.endDate).getTime();
      if (wpStart === currentStart && wpEnd === currentEnd && wp.isActive !== false) {
        return { ...wp, generatedRecipes };
      }
      return wp;
    });
    setWeeklyRecipePreferences(updated);
  }, [currentWeeklyRecipePreferences, recipes]);

  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [receipeEatenEvents, setReceipeEatenEvents] = useState<ReceipeMadeEvent[]>(() => {
    const savedReceipeEatenEvents = localStorage.getItem('receipeEatenEvents') || '[]';
    const parsed = JSON.parse(savedReceipeEatenEvents);
    // Convert date strings back to Date objects
    return parsed.map((event: any) => ({
      ...event,
      dateEaten: new Date(event.dateEaten),
    }));
  });
  useEffect(() => {
    localStorage.setItem('receipeEatenEvents', JSON.stringify(receipeEatenEvents));
  }, [receipeEatenEvents]);
  
  const handleDeleteRecipe = (recipeId: string) => {
    setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
    setCurrentView('home');
  };



  const eatenRecipes = recipes.filter(r => receipeEatenEvents.some(event => event.recipeId === r.id));

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentView('detail');
  };

  const handleMarkAsEaten = (recipeId: string) => {
    console.log('handleMarkAsEaten', recipeId);
    setReceipeEatenEvents([...receipeEatenEvents, { recipeId, dateEaten: new Date() }]);
    setCurrentView('home');
    setSelectedRecipe(null);
  };

  const handleAddRecipe = (recipe: Recipe) => {
    setRecipes([recipe, ...recipes]);
    setCurrentView('home');
  };

  /** Load 10 sample recipes for testing/iterating. Each click adds 10 more with unique IDs. */
  const handleLoadSampleRecipes = () => {
    const sampleRecipes = getDefaultRecipes();
    setRecipes([...sampleRecipes, ...recipes]);
  };

  if (currentView === 'preferences') {
    return (
      <Preferences
        title="Recipe Preferences"
        description="This is your default weekly preferences. Your upcoming week preferences can be changed."
        preferences={preferences}
        onSave={(newPreferences: RecipePreferences) => {
          setPreferences(newPreferences);
          setCurrentView('home');
        }}
        recipes={recipes}
        onCancel={() => setCurrentView('home')}
      />
    );
  }

  // Save weekly preferences by creating a new active entry and deactivating the previous one (keep history)
  const saveCurrentWeek = (updated: WeeklyRecipePreferences) => {
    // This week always starts Monday and ends Sunday (normalize in case of stale data)
    const weekStart = startOfWeek(updated.startDate);
    const weekEnd = endOfWeek(updated.startDate);
    const newEntry: WeeklyRecipePreferences = {
      ...updated,
      startDate: weekStart,
      endDate: weekEnd,
      isActive: true,
    };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();
    const updatedList = weeklyRecipePreferences.map(wp => {
      if (wp.isActive === false) return wp;
      const start = new Date(wp.startDate);
      const end = new Date(wp.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(0, 0, 0, 0);
      const inRange = start.getTime() <= todayTime && end.getTime() >= todayTime;
      if (inRange) return { ...wp, isActive: false };
      return wp;
    });
    setWeeklyRecipePreferences([newEntry, ...updatedList]);
    setCurrentView('home');
  };

  const saveUpcomingWeek = (updated: WeeklyRecipePreferences) => {
    const newEntry: WeeklyRecipePreferences = { ...updated, isActive: true };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const nextMonday = calculateNextMonday(today);
    const updatedList = weeklyRecipePreferences.map(wp => {
      const wpStart = new Date(wp.startDate);
      wpStart.setHours(0, 0, 0, 0);
      if (wpStart.getTime() === nextMonday.getTime() && wp.isActive !== false) {
        return { ...wp, isActive: false };
      }
      return wp;
    });
    setWeeklyRecipePreferences([newEntry, ...updatedList]);
    setCurrentView('home');
  };

  if (currentView === 'current') {
    if (!currentWeeklyRecipePreferences) {
      return (
        <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
          <p className="text-gray-600">Setting up this week…</p>
        </div>
      );
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(currentWeeklyRecipePreferences.endDate);
    end.setHours(0, 0, 0, 0);
    const totalDays = daysBetween(currentWeeklyRecipePreferences.startDate, currentWeeklyRecipePreferences.endDate);
    const daysLeft = daysLeftInWeek(today, end);
    return (
      <WeeklyPreferences
        weeklyPreferences={currentWeeklyRecipePreferences}
        onSave={saveCurrentWeek}
        recipes={recipes}
        onCancel={() => setCurrentView('home')}
        isCurrentWeek
        weekContext={{ daysLeft, totalDays }}
        onRegenerate={() => {
          const overrides =
            daysLeft < totalDays && totalDays > 0
              ? {
                  minServings: servingsLeftForWeek(daysLeft, totalDays, currentWeeklyRecipePreferences.preferences.numOfServingsPerWeek.min),
                  numberOfRecipes: recipesLeftForWeek(daysLeft, totalDays, currentWeeklyRecipePreferences.preferences.numberOfReceipesPerWeek),
                }
              : undefined;
          const generatedRecipes = generateRecipes(currentWeeklyRecipePreferences, recipes, overrides);
          const currentStart = new Date(currentWeeklyRecipePreferences.startDate).getTime();
          const currentEnd = new Date(currentWeeklyRecipePreferences.endDate).getTime();
          const updated = weeklyRecipePreferences.map(wp => {
            const wpStart = new Date(wp.startDate).getTime();
            const wpEnd = new Date(wp.endDate).getTime();
            if (wpStart === currentStart && wpEnd === currentEnd && wp.isActive !== false) {
              return { ...wp, generatedRecipes };
            }
            return wp;
          });
          setWeeklyRecipePreferences(updated);
        }}
      />
    );
  }

  if (currentView === 'upcoming') {
    return (
      <WeeklyPreferences
        weeklyPreferences={upcomingRecipePreferences}
        onSave={saveUpcomingWeek}
        recipes={recipes}
        onCancel={() => setCurrentView('home')}
      />
    );
  }

  if (currentView === 'add') {
    return (
      <AddRecipe
        onAdd={handleAddRecipe}
        onCancel={() => setCurrentView('home')}
      />
    );
  }

  if (currentView === 'detail' && selectedRecipe) {
    return (
      <RecipeDetail
        recipe={selectedRecipe}
        receipeEatenEvents={receipeEatenEvents}
        onClose={() => {
          setCurrentView('home');
          setSelectedRecipe(null);
        }}
        onMarkAsEaten={() => handleMarkAsEaten(selectedRecipe.id)}
        onDelete={() => handleDeleteRecipe(selectedRecipe.id)}
      />
    );
  }

  if (currentView === 'history') {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Recipe History</h1>
              <p className="text-gray-600">Recipes you've enjoyed cooking</p>
            </div>
            <button
              onClick={() => setCurrentView('home')}
              className="px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 rounded-lg border border-gray-300"
            >
              ← Back to Home
            </button>
          </div>

          {eatenRecipes.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="text-5xl mb-4">📖</div>
              <p className="text-gray-600 text-lg mb-2">No recipes eaten yet.</p>
              <p className="text-gray-400">Mark recipes as eaten to see them here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eatenRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  receipeEatenEvents={receipeEatenEvents}
                  onClick={() => handleRecipeClick(recipe)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Home Cooking</h1>
            <p className="text-gray-600">Discover, cook, and track your favorite recipes</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentView('current')}
              className="px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg border border-gray-300 text-sm font-medium"
              title="This week's preferences"
            >
              This Week Preferences
            </button>
            <button
              onClick={() => setCurrentView('upcoming')}
              className="px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg border border-gray-300 text-sm font-medium"
              title="Upcoming Preferences"
            >
              Next Week Preferences
            </button>
            <button
              onClick={() => setCurrentView('preferences')}
              className="p-3 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg border border-gray-300"
              title="Preferences"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex gap-3 mb-8">
          <button
            onClick={() => setCurrentView('add')}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
          >
            + Add New Recipe
          </button>
          <button
            onClick={() => setCurrentView('history')}
            className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-semibold rounded-lg border border-gray-300"
          >
            Recipe History
          </button>
          <button
            onClick={handleLoadSampleRecipes}
            className="px-6 py-3 bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold rounded-lg border border-amber-300"
            title="Load 10 sample recipes for testing"
          >
            Load 10 sample recipes
          </button>
        </div>

        {currentWeeklyRecipePreferences && currentWeeklyRecipePreferences.generatedRecipes.length > 0 ? (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Recipes for the Week</h2>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                {currentWeeklyRecipePreferences.generatedRecipes.length} {currentWeeklyRecipePreferences.generatedRecipes.length === 1 ? 'Recipe' : 'Recipes'}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentWeeklyRecipePreferences.generatedRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  receipeEatenEvents={receipeEatenEvents}
                  onClick={() => handleRecipeClick(recipe)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="mb-12 bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-6xl mb-4">👨‍🍳</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No recipes yet</h2>
            <p className="text-gray-600 mb-6">Get started by adding your first recipe!</p>
            <button
              onClick={() => setCurrentView('add')}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
            >
              + Add Your First Recipe
            </button>
          </div>
        )}

        {recipes.length > 1 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">All Recipes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recipes.slice(1).map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  receipeEatenEvents={receipeEatenEvents}
                  onClick={() => handleRecipeClick(recipe)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
