import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Layout, Save, Send } from 'lucide-react';
import { useComicStore } from '../store/useComicStore';
import { TemplateSelector } from './creator/TemplateSelector';
import { PanelGrid } from './creator/PanelGrid';
import { TitleEditor } from './creator/TitleEditor';
import { PageManager } from './creator/PageManager';
import { CoverUploader } from './creator/CoverUploader';
import { Template } from '../types';

export const Creator: React.FC = () => {
  const { 
    currentComic, 
    currentPageIndex,
    addPanel, 
    updatePanel, 
    removePanel, 
    reorderPanels, 
    publishComic,
    isEditing,
    setCurrentComic,
  } = useComicStore();
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (isEditing) return;

    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const media = file.type.includes('video') || file.type.includes('gif')
          ? document.createElement('video')
          : document.createElement('img');

        media.onload = media.onloadedmetadata = () => {
          const aspectRatio = media instanceof HTMLVideoElement 
            ? media.videoWidth / media.videoHeight
            : media.width / media.height;

          const panel = {
            id: Math.random().toString(36).substr(2, 9),
            type: file.type.includes('video') ? 'video' : 
                  file.type.includes('gif') ? 'gif' : 'image',
            url: URL.createObjectURL(file),
            caption: '',
            size: 'medium',
            aspectRatio,
            position: { row: 0, col: 0 }
          };
          
          addPanel(panel, currentPageIndex);
        };

        if (media instanceof HTMLVideoElement) {
          media.src = URL.createObjectURL(file);
        } else {
          media.src = URL.createObjectURL(file);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }, [addPanel, currentPageIndex, isEditing]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': [],
      'image/gif': [],
    },
    multiple: true,
    disabled: isEditing
  });

  const handlePublish = async () => {
    setIsSaving(true);
    try {
      if (currentComic && currentComic.pages[0]?.length > 0) {
        publishComic();
        setCurrentComic(null); // Redirect to home after publishing
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleViewMode = () => {
    setCurrentComic(null); // Return to grid view
  };

  const currentPagePanels = currentComic?.pages[currentPageIndex] || [];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <TitleEditor />
          <div className="flex gap-4">
            <button
              onClick={handleViewMode}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              View Comics
            </button>
            <button
              onClick={handlePublish}
              disabled={!currentComic?.pages.some(page => page.length > 0) || isSaving}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 mr-2" />
              {isEditing ? 'Save Changes' : 'Publish Comic'}
            </button>
          </div>
        </div>

        {/* Cover Uploader */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Comic Cover</h2>
          <CoverUploader />
        </div>

        {!isEditing && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Layout className="w-5 h-5 mr-2" />
                Choose a Layout Template
              </h2>
              <TemplateSelector onSelect={setSelectedTemplate} />
            </div>

            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              } ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <input {...getInputProps()} />
              <Upload className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                {isEditing ? (
                  'Content editing is disabled in edit mode'
                ) : (
                  'Drag \'n\' drop images, videos, or GIFs here, or click to select files'
                )}
              </p>
              {!isEditing && (
                <p className="mt-1 text-xs text-gray-500">
                  Supported formats: JPG, PNG, GIF, MP4, WebM
                </p>
              )}
            </div>
          </div>
        )}

        {selectedTemplate && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Page {currentPageIndex + 1} Layout</h2>
            <PanelGrid
              template={selectedTemplate}
              panels={currentPagePanels}
              onUpdatePanel={(panel) => updatePanel(panel, currentPageIndex)}
              onRemovePanel={(panelId) => removePanel(panelId, currentPageIndex)}
              onReorderPanels={(start, end) => reorderPanels(start, end, currentPageIndex)}
              isEditing={isEditing}
            />
          </div>
        )}
      </div>

      <PageManager />
    </div>
  );
};