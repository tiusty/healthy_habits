import { WeeklyRecipePreferences, Recipe } from '../../types';
import Preferences from './PreferencesEditor';

export interface WeekContext {
  daysLeft: number;
  totalDays: number;
}

interface WeeklyPreferencesProps {
  weeklyPreferences: WeeklyRecipePreferences;
  onSave: (weeklyPreferences: WeeklyRecipePreferences) => void;
  recipes: Recipe[];
  onCancel: () => void;
  /** When true, show "Regenerate recipes" and pass weekContext for servings-left display */
  isCurrentWeek?: boolean;
  weekContext?: WeekContext;
  onRegenerate?: () => void;
}

export default function WeeklyPreferences({
  weeklyPreferences,
  onSave,
  recipes,
  onCancel,
  isCurrentWeek,
  weekContext,
  onRegenerate,
}: WeeklyPreferencesProps) {
  const handlePreferencesSave = (newPreferences: WeeklyRecipePreferences['preferences']) => {
    onSave({
      ...weeklyPreferences,
      preferences: newPreferences,
      generatedRecipes: [], // new snapshot will regenerate on next load
    });
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Weekly Preferences Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-sm text-gray-500 mb-1">Start Date</div>
              <div className="text-lg font-semibold text-gray-900">{formatDate(weeklyPreferences.startDate)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-500 mb-1">End Date</div>
              <div className="text-lg font-semibold text-gray-900">{formatDate(weeklyPreferences.endDate)}</div>
            </div>
          </div>
        </div>

        {isCurrentWeek && onRegenerate && (
          <div className="mb-6 bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Recipes for this week</h3>
            <p className="text-sm text-gray-600 mb-4">
              Change preferences above if needed, then regenerate to get a new set of recipes based on days left in the week.
            </p>
            <button
              type="button"
              onClick={onRegenerate}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg"
            >
              Regenerate recipes for this week
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg border border-gray-200">
          <Preferences
            title="Weekly Preferences"
            description={isCurrentWeek ? "Edit preferences for this week. Save to create a new snapshot, then regenerate recipes if needed." : "This is your weekly preferences. You can change the preferences for the upcoming week."}
            preferences={weeklyPreferences.preferences}
            onSave={handlePreferencesSave}
            recipes={recipes}
            onCancel={onCancel}
            weekContext={weekContext}
          />
        </div>
      </div>
    </div>
  );
}

