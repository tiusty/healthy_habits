import { RecipePreferences } from './types';

export const defaultPreferences: RecipePreferences = {
  numberOfReceipesPerWeek: 2,
  mealType: ['breakfast', 'lunch', 'dinner'],
  proteinType: ['chicken', 'beef', 'pork', 'fish', 'tofu'],
  cookingMethod: ['oven', 'stove', 'no bake'],
  maxPrepTime: null,
  maxCookTime: null,
  difficultyLevels: ['Easy', 'Medium', 'Hard'],
  dietaryTags: [],
  numOfServingsPerWeek: {
    min: 5,
    max: 8,
  },
};

