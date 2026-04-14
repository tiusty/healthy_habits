import { useState } from 'react';
import './App.css';
import HomeCooking from './home_cooking/HomeCooking';

type Tab = 'home-cooking'; // Add more tabs here as needed

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('home-cooking');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Tabs */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('home-cooking')}
              className={`px-2 border-b-2 font-medium text-sm ${
                activeTab === 'home-cooking'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Home Cooking
            </button>
            {/* Add more top-level tabs here in the future */}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {activeTab === 'home-cooking' && <HomeCooking />}
        {/* Add more tab content here as needed */}
      </main>
    </div>
  );
}

export default App;
