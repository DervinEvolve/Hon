import React, { useState, useEffect } from 'react';
import { useComicStore } from '../store/useComicStore';
import { Book, Edit2, Trash2 } from 'lucide-react';

export const ComicGrid: React.FC = () => {
  const { publishedComics, setCurrentComic, editComic, toggleCreatorMode, unpublishComic } = useComicStore();
  const [loadedCovers, setLoadedCovers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const preloadCovers = async () => {
      const coverPromises = publishedComics.map(comic => {
        return new Promise((resolve) => {
          if (!comic.coverImage) {
            resolve(true);
            return;
          }

          if (comic.coverType === 'video' || comic.coverType === 'gif') {
            const video = document.createElement('video');
            video.onloadeddata = () => {
              setLoadedCovers(prev => ({ ...prev, [comic.id]: true }));
              resolve(true);
            };
            video.onerror = () => {
              setLoadedCovers(prev => ({ ...prev, [comic.id]: false }));
              resolve(false);
            };
            video.src = comic.coverImage;
            video.load();
          } else {
            const img = new Image();
            img.onload = () => {
              setLoadedCovers(prev => ({ ...prev, [comic.id]: true }));
              resolve(true);
            };
            img.onerror = () => {
              setLoadedCovers(prev => ({ ...prev, [comic.id]: false }));
              resolve(false);
            };
            img.src = comic.coverImage;
          }
        });
      });

      await Promise.all(coverPromises);
    };

    preloadCovers();
  }, [publishedComics]);

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

  const handleEdit = (e: React.MouseEvent, comic: Comic) => {
    e.preventDefault();
    e.stopPropagation();
    editComic(comic);
  };

  const handleDelete = (e: React.MouseEvent, comicId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this comic? This action cannot be undone.')) {
      unpublishComic(comicId);
    }
  };

  const handleComicClick = (comic: Comic) => {
    setCurrentComic({
      ...comic,
      pages: comic.pages.map(page => 
        page.map(panel => ({
          ...panel,
          url: panel.url,
          caption: panel.caption,
          captionPosition: panel.captionPosition,
          captionStyle: panel.captionStyle,
          size: panel.size,
          position: panel.position,
          aspectRatio: panel.aspectRatio,
        }))
      ),
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-white mb-8">Featured Comics</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Create New Comic Card */}
        <div
          onClick={handleCreateNew}
          className="relative h-80 bg-gray-800 rounded-lg border-2 border-dashed border-gray-700 hover:border-blue-500 transition-colors group cursor-pointer"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleCreateNew();
            }
          }}
        >
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-700 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
              <Book className="w-8 h-8 text-gray-400 group-hover:text-white transition-colors" />
            </div>
            <p className="text-lg font-medium text-gray-400 group-hover:text-blue-500 transition-colors">
              Create New Comic
            </p>
          </div>
        </div>

        {/* Published Comics */}
        {publishedComics.map((comic) => (
          <div
            key={comic.id}
            className="relative h-80 bg-gray-800 rounded-lg overflow-hidden group cursor-pointer"
            onClick={() => handleComicClick(comic)}
          >
            {/* Comic Cover */}
            <div className="absolute inset-0">
              {comic.coverImage ? (
                loadedCovers[comic.id] ? (
                  comic.coverType === 'video' || comic.coverType === 'gif' ? (
                    <video
                      src={comic.coverImage}
                      className="w-full h-full object-cover"
                      style={comic.coverPosition ? {
                        objectPosition: `${comic.coverPosition.x}% ${comic.coverPosition.y}%`,
                        transform: `scale(${comic.coverPosition.scale})`,
                      } : undefined}
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={comic.coverImage}
                      alt={comic.title}
                      className="w-full h-full object-cover"
                      style={comic.coverPosition ? {
                        objectPosition: `${comic.coverPosition.x}% ${comic.coverPosition.y}%`,
                        transform: `scale(${comic.coverPosition.scale})`,
                      } : undefined}
                    />
                  )
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="animate-pulse">Loading cover...</div>
                  </div>
                )
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Book className="w-16 h-16 text-gray-600" />
                </div>
              )}
            </div>

            {/* Comic Info Overlay - Always visible */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="text-xl font-bold text-white mb-1">{comic.title}</h2>
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <span>{comic.creator}</span>
                  <span>{comic.pages.length} pages</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleEdit(e, comic)}
                className="p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                title="Edit Comic"
              >
                <Edit2 className="w-4 h-4 text-gray-700" />
              </button>
              <button
                onClick={(e) => handleDelete(e, comic.id)}
                className="p-2 bg-white/90 rounded-full hover:bg-white hover:text-red-500 transition-colors"
                title="Delete Comic"
              >
                <Trash2 className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};