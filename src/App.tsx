import React from 'react';
import { PenLine } from 'lucide-react';
import { Reader } from './components/Reader';
import { Creator } from './components/Creator';
import { ComicGrid } from './components/ComicGrid';
import { useComicStore } from './store/useComicStore';

function App() {
  const { isCreatorMode, toggleCreatorMode, currentComic, setCurrentComic } = useComicStore();

  const handleCreateNew = () => {
    const newComic = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Untitled Comic',
      creator: 'Anonymous',
      coverImage: '',
      coverType: 'image',
      panels: [],
      pages: [[]],
      createdAt: new Date(),
    };
    setCurrentComic(newComic);
    toggleCreatorMode();
  };

  const handleLogoClick = () => {
    setCurrentComic(null);
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <nav className="fixed top-0 inset-x-0 z-50 bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={handleLogoClick}
              className="flex items-center space-x-1 hover:opacity-80 transition-opacity"
            >
              <span className="text-white font-bold text-2xl tracking-tight">H</span>
              <div className="relative w-6 h-6 mx-0.5">
                <svg 
                  viewBox="0 0 24 24" 
                  className="w-6 h-6 text-blue-400"
                  style={{ 
                    filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.3))'
                  }}
                >
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 7.5C8 7.5 10 6 12 6c2 0 4 1.5 4 1.5V17c0 0-2-1.5-4-1.5c-2 0-4 1.5-4 1.5V7.5z"
                    fill="currentColor"
                    className="transform -rotate-6"
                  />
                  <path
                    d="M12 6v9.5"
                    stroke="currentColor"
                    strokeWidth="1"
                    className="transform -rotate-6"
                  />
                </svg>
              </div>
              <span className="text-white font-bold text-2xl tracking-tight">n</span>
            </button>

            <div className="flex items-center space-x-4">
              <button
                onClick={handleCreateNew}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <PenLine className="h-4 w-4 mr-2" />
                Create Comic
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-16">
        {isCreatorMode ? (
          <Creator />
        ) : currentComic ? (
          <Reader />
        ) : (
          <ComicGrid />
        )}
      </main>
    </div>
  );
}

export default App;