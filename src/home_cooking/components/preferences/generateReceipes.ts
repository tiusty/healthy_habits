import { Recipe, WeeklyRecipePreferences } from '../../types';

export interface GenerateRecipesOverrides {
  /** Override min servings (e.g. mid-week: servings left for the week). */
  minServings?: number;
  /** Override number of recipes to plan (e.g. mid-week: recipes left). */
  numberOfRecipes?: number;
}

/**
 * Filters recipes based on the criteria specified in weekly preferences
 * @param weeklyPreferences The weekly preferences containing filter criteria
 * @param availableRecipes The list of all available recipes to filter from
 * @param overrides Optional overrides for mid-week: minServings and/or numberOfRecipes
 * @returns An array of recipes that match the criteria
 */
export function generateRecipes(
  weeklyPreferences: WeeklyRecipePreferences,
  availableRecipes: Recipe[],
  overrides?: GenerateRecipesOverrides
): Recipe[] {
  const { preferences } = weeklyPreferences;

  // Step 1: Filter recipes based on all criteria
  const filteredRecipes = availableRecipes.filter((recipe) => {
    // Check meal type - recipe must have all matching meal types
    const hasMatchingMealType =
      preferences.mealType.length === 0 || !recipe.mealTypes ||
      recipe.mealTypes.every((mealType) => preferences.mealType.includes(mealType));

    // Check protein type - recipe must have all matching protein types
    const hasMatchingProteinType =
      preferences.proteinType.length === 0 || !recipe.proteinTypes ||
      recipe.proteinTypes.every((proteinType) => preferences.proteinType.includes(proteinType));

    // Check cooking method - recipe must have all matching cooking methods
    const hasMatchingCookingMethod =
      preferences.cookingMethod.length === 0 || !recipe.cookingMethods ||
      recipe.cookingMethods.every((method) => preferences.cookingMethod.includes(method));

    // Check prep time - must be within limit if specified
    const meetsPrepTimeRequirement =
      preferences.maxPrepTime === null || recipe.prepTimeMinutes <= preferences.maxPrepTime;

    // Check cook time - must be within limit if specified
    const meetsCookTimeRequirement =
      preferences.maxCookTime === null || recipe.cookTimeMinutes <= preferences.maxCookTime;

    // Check difficulty level - must be in the allowed list
    const meetsDifficultyRequirement = preferences.difficultyLevels.includes(recipe.difficulty);

    // Check dietary tags - recipe must have at least one matching dietary tag (if dietary tags are specified)
    const meetsDietaryTagsRequirement =
      preferences.dietaryTags.length === 0 ||
      recipe.dietaryTags.some((tag) => preferences.dietaryTags.includes(tag));

    return (
      hasMatchingMealType &&
      hasMatchingProteinType &&
      hasMatchingCookingMethod &&
      meetsPrepTimeRequirement &&
      meetsCookTimeRequirement &&
      meetsDifficultyRequirement &&
      meetsDietaryTagsRequirement
    );
  });

  // Step 2: Select exactly targetRecipeCount recipes where total servings >= minServings
  // Use overrides when provided (e.g. mid-week: servings/recipes left for the week)
  const targetRecipeCount = overrides?.numberOfRecipes ?? preferences.numberOfReceipesPerWeek;
  const minServings = overrides?.minServings ?? preferences.numOfServingsPerWeek.min;

  // If no recipes match the criteria, return empty array
  if (filteredRecipes.length === 0) {
    return [];
  }

  // Find the best combination of exactly targetRecipeCount recipes
  return findRecipeCombination(filteredRecipes, targetRecipeCount, minServings);
}

/**
 * Finds a combination of exactly targetCount recipes where total servings >= minServings
 * Uses a greedy approach: tries to find combinations that meet the minimum serving requirement
 */
function findRecipeCombination(
  recipes: Recipe[],
  targetCount: number,
  minServings: number
): Recipe[] {
  // If we need exactly the number of recipes available, check if they meet serving requirements
  if (recipes.length === targetCount) {
      return recipes;
  }

  // Try to find a combination using a simple approach:
  // Sort recipes by servings and try different combinations
  const sortedRecipes = [...recipes].sort((a, b) => a.numOfServings - b.numOfServings);

  // Try combinations starting from different positions
  for (let start = 0; start <= sortedRecipes.length - targetCount; start++) {
    const combination = sortedRecipes.slice(start, start + targetCount);
    const totalServings = combination.reduce((sum, recipe) => sum + recipe.numOfServings, 0);

    if (totalServings >= minServings) {
      return combination;
    }
  }

  // If no combination found with simple approach, try all possible combinations (for small sets)
  if (sortedRecipes.length <= 20) {
    const bestCombination = findBestCombination(sortedRecipes, targetCount, minServings);
    if (bestCombination.length > 0) {
      return bestCombination;
    }
  }

  // If we can't find a combination that meets minimum servings, return empty array
  return [];
}

/**
 * Finds the best combination of recipes using brute force (for small sets)
 * Returns the combination with total servings closest to minServings (but still >= minServings)
 */
function findBestCombination(
  recipes: Recipe[],
  targetCount: number,
  minServings: number
): Recipe[] {
  // Generate all combinations of targetCount recipes
  const combinations: Recipe[][] = [];

  function generateCombinations(current: Recipe[], remaining: Recipe[], count: number) {
    if (count === 0) {
      combinations.push([...current]);
      return;
    }

    for (let i = 0; i <= remaining.length - count; i++) {
      generateCombinations([...current, remaining[i]], remaining.slice(i + 1), count - 1);
    }
  }

  generateCombinations([], recipes, targetCount);

  // Find the combination with total servings closest to minServings (but still >= minServings)
  let bestCombination: Recipe[] = [];
  let bestDifference = Infinity;

  for (const combination of combinations) {
    const totalServings = combination.reduce((sum, recipe) => sum + recipe.numOfServings, 0);
    if (totalServings >= minServings) {
      // Prefer combinations closer to minServings (minimize excess)
      const difference = totalServings - minServings;
      if (difference < bestDifference) {
        bestDifference = difference;
        bestCombination = combination;
      }
    }
  }

  return bestCombination;
}

