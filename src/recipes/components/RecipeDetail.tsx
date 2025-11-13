import { ReceipeMadeEvent, Recipe } from '../types';

interface RecipeDetailProps {
  recipe: Recipe;
  receipeEatenEvents: ReceipeMadeEvent[];
  onClose: () => void;
  onDelete: () => void;
  onMarkAsEaten: () => void;
}

export default function RecipeDetail({ recipe, receipeEatenEvents, onClose, onDelete, onMarkAsEaten }: RecipeDetailProps) {
  const latestEatenEvent = receipeEatenEvents.find(event => event.recipeId === recipe.id);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{recipe.name}</h2>
            <p className="text-gray-600">{recipe.description}</p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 p-2 text-gray-400 hover:text-gray-600"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Prep Time</div>
              <div className="text-2xl font-bold text-gray-900">{recipe.prepTimeMinutes} min</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Cook Time</div>
              <div className="text-2xl font-bold text-gray-900">{recipe.cookTimeMinutes} min</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Servings</div>
              <div className="text-2xl font-bold text-gray-900">{recipe.numOfServings}</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="text-sm text-gray-500">Difficulty</div>
              <div className="text-2xl font-bold text-gray-900">{recipe.difficulty}</div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ingredients</h3>
            <ul className="space-y-2">
              {recipe.ingredients.map((ingredient, index) => (
                <li key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                    {index + 1}
                  </span>
                  <span className="text-gray-800">
                    <span className="font-semibold">{ingredient.amount} {ingredient.unit}</span>
                    {' '}{ingredient.name}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Instructions</h3>
            <ol className="space-y-4">
              {recipe.instructions.map((instruction, index) => (
                <li key={index} className="flex">
                  <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mr-4">
                    {index + 1}
                  </span>
                  <span className="flex-1 text-gray-700 pt-1">{instruction}</span>
                </li>
              ))}
            </ol>
          </div>

          {recipe.tags.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {recipe.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {latestEatenEvent && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Last Eaten</h3>
              <div className="text-gray-600">{new Date(latestEatenEvent.dateEaten).toLocaleDateString()}</div>
            </div>
          )}

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onMarkAsEaten}
              className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg"
            >
              Mark as Eaten
            </button>
            <button
              onClick={onDelete}
              className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg"
            >
              Delete
            </button>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
