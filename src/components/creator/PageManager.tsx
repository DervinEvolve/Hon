import React from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useComicStore } from '../../store/useComicStore';

export const PageManager: React.FC = () => {
  const { 
    currentComic, 
    currentPageIndex,
    setCurrentPageIndex,
    addPage, 
    removePage 
  } = useComicStore();

  if (!currentComic) return null;

  const totalPages = currentComic.pages.length;
  const canAddPage = totalPages < 20; // Maximum 20 pages

  const handlePrevPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPageIndex < totalPages - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handleAddPage = () => {
    if (canAddPage) {
      addPage();
    }
  };

  const handleRemovePage = () => {
    if (totalPages > 1) {
      removePage(currentPageIndex);
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-6 py-3 border border-gray-200 z-50">
      <button
        onClick={handlePrevPage}
        disabled={currentPageIndex === 0}
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Previous page"
      >
        <ChevronLeft className="w-5 h-5 text-gray-700" />
      </button>
      
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">
          Page {currentPageIndex + 1} of {totalPages}
        </span>
      </div>
      
      <button
        onClick={handleNextPage}
        disabled={currentPageIndex === totalPages - 1}
        className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        title="Next page"
      >
        <ChevronRight className="w-5 h-5 text-gray-700" />
      </button>

      <div className="w-px h-6 bg-gray-200" />

      <button
        onClick={handleAddPage}
        disabled={!canAddPage}
        className={`p-2 rounded-full transition-colors ${
          canAddPage 
            ? 'hover:bg-blue-50 text-blue-500 hover:text-blue-600' 
            : 'opacity-50 cursor-not-allowed text-gray-400'
        }`}
        title={canAddPage ? 'Add new page' : 'Maximum pages reached (20)'}
      >
        <Plus className="w-5 h-5" />
      </button>

      <button
        onClick={handleRemovePage}
        disabled={totalPages <= 1}
        className={`p-2 rounded-full transition-colors ${
          totalPages > 1
            ? 'hover:bg-red-50 text-red-500 hover:text-red-600'
            : 'opacity-50 cursor-not-allowed text-gray-400'
        }`}
        title={totalPages > 1 ? 'Remove current page' : 'Cannot remove last page'}
      >
        <Trash2 className="w-5 h-5" />
      </button>
    </div>
  );
};