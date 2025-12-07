import { WeeklyRecipePreferences, Recipe } from '../types';
import Preferences from './Preferences';

interface WeeklyPreferencesProps {
  weeklyPreferences: WeeklyRecipePreferences;
  onSave: (weeklyPreferences: WeeklyRecipePreferences) => void;
  recipes: Recipe[];
  onCancel: () => void;
}

export default function WeeklyPreferences({
  weeklyPreferences,
  onSave,
  recipes,
  onCancel,
}: WeeklyPreferencesProps) {
  const handlePreferencesSave = (newPreferences: WeeklyRecipePreferences['preferences']) => {
    onSave({
      ...weeklyPreferences,
      preferences: newPreferences,
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

        <div className="bg-white rounded-lg border border-gray-200">
          <Preferences
            preferences={weeklyPreferences.preferences}
            onSave={handlePreferencesSave}
            recipes={recipes}
            onCancel={onCancel}
          />
        </div>
      </div>
    </div>
  );
}

