import React, { useState, useCallback, lazy, Suspense } from 'react';
import { useComicStore } from '../store/useComicStore';
import { ChevronLeft, ChevronRight, Edit2, Home } from 'lucide-react';
import { Panel } from '../types';

const MediaContent = lazy(() => import('./media/MediaContent'));

const LoadingFallback = () => (
  <div className="w-full h-full flex items-center justify-center bg-gray-800">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      <div className="text-sm text-gray-300">Loading content...</div>
    </div>
  </div>
);

export const Reader: React.FC = () => {
  const { currentComic, currentPageIndex, setCurrentPageIndex, editComic, setCurrentComic } = useComicStore();
  const [loadedPanels, setLoadedPanels] = useState<Set<string>>(new Set());

  if (!currentComic) return null;

  const currentPage = currentComic.pages[currentPageIndex] || [];
  const totalPages = currentComic.pages.length;

  const handlePanelLoad = useCallback((panelId: string) => {
    setLoadedPanels(prev => new Set(prev).add(panelId));
  }, []);

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
      setLoadedPanels(new Set());
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
      setLoadedPanels(new Set());
    }
  };

  const handleHome = () => {
    setCurrentComic(null);
  };

  const renderPanel = (panel: Panel) => (
    <Suspense fallback={<LoadingFallback />}>
      <MediaContent
        url={panel.url}
        type={panel.type}
        onLoad={() => handlePanelLoad(panel.id)}
      />
      {panel.caption && panel.captionPosition && (
        <div 
          className="absolute z-10 max-w-[90%] p-2 rounded shadow-lg"
          style={{
            left: `${panel.captionPosition.x}%`,
            top: `${panel.captionPosition.y}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: panel.captionStyle?.backgroundColor === 'black' ? 
              `rgba(0,0,0,${panel.captionStyle?.opacity ?? 0.75})` : 
              `rgba(255,255,255,${panel.captionStyle?.opacity ?? 0.75})`,
            color: panel.captionStyle?.backgroundColor === 'black' ? 'white' : 'black',
            fontSize: `${panel.captionStyle?.fontSize || 16}px`,
            fontFamily: panel.captionStyle?.fontFamily || 'Arial',
            textAlign: panel.captionPosition.align || 'left',
          }}
        >
          {panel.caption}
        </div>
      )}
    </Suspense>
  );

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <header className="mb-8 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleHome}
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            >
              <Home className="w-5 h-5 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{currentComic.title}</h1>
              <p className="text-gray-400">By {currentComic.creator}</p>
            </div>
          </div>
          <button
            onClick={() => editComic(currentComic)}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <Edit2 className="w-5 h-5 text-white" />
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentPage.map((panel, index) => (
            <div
              key={panel.id || index}
              className={`relative bg-gray-800 rounded-lg overflow-hidden ${
                panel.size === 'large' ? 'col-span-2 row-span-2' :
                panel.size === 'medium' ? 'col-span-1 row-span-1' :
                'col-span-1'
              }`}
              style={{
                minHeight: '300px',
                aspectRatio: panel.aspectRatio || '1',
                gridRow: panel.position?.row !== undefined ? `span ${panel.position.rowSpan || 1}` : undefined,
                gridColumn: panel.position?.col !== undefined ? `span ${panel.position.colSpan || 1}` : undefined,
              }}
            >
              {renderPanel(panel)}
            </div>
          ))}
        </div>

        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-6 py-3">
          <button
            onClick={handlePrevPage}
            disabled={currentPageIndex === 0}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          
          <div className="text-sm font-medium text-gray-700">
            Page {currentPageIndex + 1} of {totalPages}
          </div>
          
          <button
            onClick={handleNextPage}
            disabled={currentPageIndex === totalPages - 1}
            className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </div>
      </div>
    </div>
  );
};