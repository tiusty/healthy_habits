import { useEffect, useMemo, useState } from 'react';
import { Recipe, RecipePreferences, ReceipeMadeEvent, WeeklyRecipePreferences } from './types';
import { defaultPreferences } from './defaultPreferences';
import RecipeCard from './components/RecipeCard';
import RecipeDetail from './components/RecipeDetail';
import AddRecipe from './components/AddRecipe';
import Preferences from './Preferences';

type View = 'home' | 'add' | 'detail' | 'history' | 'preferences';

export default function HomeCooking() {
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const savedRecipes = localStorage.getItem('recipes') || '[]';
    return JSON.parse(savedRecipes);
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
  const nextWeekSundayDate = useMemo(() => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const daysToAdd = dayOfWeek === 0 ? 7 : (7 - dayOfWeek); // If Sunday, add 7; otherwise add days to reach next Sunday
    const nextSunday = new Date(today);
    nextSunday.setDate(today.getDate() + daysToAdd);
    nextSunday.setHours(0, 0, 0, 0); // Set to start of day
    return nextSunday;
  }, []);
  const [weeklyRecipePreferences, setWeeklyRecipePreferences] = useState<WeeklyRecipePreferences[]>(() => {
    const savedWeeklyRecipePreferences = localStorage.getItem('weeklyRecipePreferences') || JSON.stringify([{ preferences: defaultPreferences, startDate: new Date(), endDate: new Date(nextWeekSundayDate.getDate()), accepted: false }]);
    return JSON.parse(savedWeeklyRecipePreferences);
  });
  useEffect(() => {
    localStorage.setItem('weeklyRecipePreferences', JSON.stringify(weeklyRecipePreferences));
  }, [weeklyRecipePreferences]);

  const currentWeeklyRecipePreferences = useMemo(() => {
    const currentWeeklyRecipePreferences = weeklyRecipePreferences.find(preferences => preferences.startDate <= new Date() && preferences.endDate >= new Date());
    if (!currentWeeklyRecipePreferences) {
      const newWeeklyRecipePreferences = { preferences: defaultPreferences, startDate: new Date(), endDate: new Date(nextWeekSundayDate.getDate()), accepted: false };
      setWeeklyRecipePreferences([...weeklyRecipePreferences, newWeeklyRecipePreferences]);
      return newWeeklyRecipePreferences;
    }
    return currentWeeklyRecipePreferences;
  }, [weeklyRecipePreferences]);
  const nextWeekRecipePreferences = useMemo(() => {
    const nextWeekRecipePreferences = weeklyRecipePreferences.find(preferences => preferences.startDate > new Date());
    if (!nextWeekRecipePreferences) {
      const newNextWeekRecipePreferences = { preferences: defaultPreferences, startDate: new Date(nextWeekSundayDate.getDate()), endDate: new Date(nextWeekSundayDate.getDate() + 7), accepted: false };
      setWeeklyRecipePreferences([...weeklyRecipePreferences, newNextWeekRecipePreferences]);
      return newNextWeekRecipePreferences;
    }
    return nextWeekRecipePreferences;
  }, [weeklyRecipePreferences]);

  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [receipeEatenEvents, setReceipeEatenEvents] = useState<ReceipeMadeEvent[]>(() => {
    const savedReceipeEatenEvents = localStorage.getItem('receipeEatenEvents') || '[]';
    return JSON.parse(savedReceipeEatenEvents);
  });
  useEffect(() => {
    localStorage.setItem('receipeEatenEvents', JSON.stringify(receipeEatenEvents));
  }, [receipeEatenEvents]);
  
  const handleDeleteRecipe = (recipeId: string) => {
    setRecipes(recipes.filter(recipe => recipe.id !== recipeId));
    setCurrentView('home');
  };

  const recipeOfTheWeek = recipes.length > 0 ? recipes[0] : null;

  const eatenRecipes = recipes.filter(r => receipeEatenEvents.some(event => event.recipeId === r.id));

  const handleRecipeClick = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setCurrentView('detail');
  };

  const handleMarkAsEaten = (recipeId: string) => {
    setReceipeEatenEvents([...receipeEatenEvents, { recipeId, dateEaten: new Date() }]);
    setCurrentView('home');
    setSelectedRecipe(null);
  };

  const handleAddRecipe = (recipe: Recipe) => {
    setRecipes([recipe, ...recipes]);
    setCurrentView('home');
  };

  if (currentView === 'preferences') {
    return (
      <Preferences
        preferences={preferences}
        onSave={(newPreferences) => {
          setPreferences(newPreferences);
          setCurrentView('home');
        }}
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
        </div>

        {recipeOfTheWeek ? (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Recipe of the Week</h2>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                ⭐ Featured
              </span>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2 p-8">
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">{recipeOfTheWeek.name}</h3>
                  <p className="text-gray-600 mb-6">{recipeOfTheWeek.description}</p>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-700">{recipeOfTheWeek.prepTimeMinutes + recipeOfTheWeek.cookTimeMinutes}</div>
                      <div className="text-sm text-indigo-600 mt-1">Minutes</div>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-700">{recipeOfTheWeek.numOfServings}</div>
                      <div className="text-sm text-indigo-600 mt-1">Servings</div>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-700">{recipeOfTheWeek.difficulty}</div>
                      <div className="text-sm text-indigo-600 mt-1">Difficulty</div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRecipeClick(recipeOfTheWeek)}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
                  >
                    View Recipe →
                  </button>
                </div>
                <div className="md:w-1/2 bg-indigo-500 flex items-center justify-center p-8">
                  <div className="text-white text-center">
                    <div className="text-6xl mb-4">🍳</div>
                    <p className="text-xl font-semibold">Ready to Cook!</p>
                  </div>
                </div>
              </div>
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
