export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  numOfServings: number;
  difficulty: DifficultyLevel;
  proteinTypes: ProteinType[];
  mealTypes: MealType[];
  cookingMethods: CookingMethod[];
  dietaryTags: string[];
  imageUrl?: string;
  tags: string[];
}

export interface ReceipeMadeEvent {
  recipeId: string;
  dateEaten: Date;
}

export interface Ingredient {
  name: string;
  amount: string;
  unit: string;
}

export interface RecipePreferences {
  // Number of recipes is the number of distinct recipes that the user wants to make in a week
  numberOfReceipesPerWeek: number;
  // Number of servings is the number of servings that the user needs. Each reciepe has a different amount of services,
  // so the sum of the services from the recipes should be between the min and max.
  numOfServingsPerWeek: {
    min: number;
    max: number;
  };
  mealType: MealType[];
  proteinType: ProteinType[];
  cookingMethod: CookingMethod[];
  maxPrepTime: number | null; // in minutes, null means no limit
  maxCookTime: number | null; // in minutes, null means no limit
  difficultyLevels: DifficultyLevel[];
  dietaryTags: string[]; // e.g., 'vegetarian', 'healthy', etc.
}

export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export const availableDifficultyLevels: DifficultyLevel[] = ['Easy', 'Medium', 'Hard'];
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'dessert';
export const availableMealTypes: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack', 'dessert'];
export type CookingMethod = 'oven' | 'stove' | 'slow cooker' | 'instant pot' | 'no bake';
export const availableCookingMethods: CookingMethod[] = ['oven', 'stove', 'slow cooker', 'instant pot', 'no bake'];
export type ProteinType = 'chicken' | 'beef' | 'pork' | 'fish' | 'tofu' | 'other';
export const availableProteinTypes: ProteinType[] = ['chicken', 'beef', 'pork', 'fish', 'tofu', 'other'];