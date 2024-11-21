import React, { useState } from 'react';
import { Edit3, Save } from 'lucide-react';
import { useComicStore } from '../../store/useComicStore';

export const TitleEditor: React.FC = () => {
  const { currentComic, updateComicTitle } = useComicStore();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(currentComic?.title || 'Untitled Comic');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateComicTitle(title);
    setIsEditing(false);
  };

  return (
    <div className="mb-6">
      {isEditing ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 px-4 py-2 text-2xl font-bold border-b-2 border-blue-500 focus:outline-none bg-transparent"
            placeholder="Enter comic title..."
            autoFocus
          />
          <button
            type="submit"
            className="p-2 text-blue-500 hover:text-blue-600"
          >
            <Save size={20} />
          </button>
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <button
            onClick={() => setIsEditing(true)}
            className="p-2 text-gray-500 hover:text-gray-600"
          >
            <Edit3 size={20} />
          </button>
        </div>
      )}
    </div>
  );
};