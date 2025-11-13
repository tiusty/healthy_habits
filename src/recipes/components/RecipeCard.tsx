import { ReceipeMadeEvent, Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
  receipeEatenEvents: ReceipeMadeEvent[];
  onClick: () => void;
}

export default function RecipeCard({ recipe, receipeEatenEvents, onClick }: RecipeCardProps) {
  const latestEatenEvent = receipeEatenEvents.find(event => event.recipeId === recipe.id);
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 hover:border-indigo-300 cursor-pointer overflow-hidden"
    >
      {recipe.imageUrl && (
        <img
          src={recipe.imageUrl}
          alt={recipe.name}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{recipe.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{recipe.description}</p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500">{recipe.prepTimeMinutes + recipe.cookTimeMinutes} min</span>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
            {recipe.difficulty}
          </span>
        </div>
        {latestEatenEvent && (
          <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-400">
            Last Eaten: {new Date(latestEatenEvent.dateEaten).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
