import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image, Film, X, Move, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useComicStore } from '../../store/useComicStore';

interface CoverPosition {
  x: number;
  y: number;
  scale: number;
}

export const CoverUploader: React.FC = () => {
  const { currentComic, updateComicCover } = useComicStore();
  const [previewUrl, setPreviewUrl] = useState<string>(currentComic?.coverImage || '');
  const [mediaType, setMediaType] = useState<'image' | 'video' | 'gif'>(currentComic?.coverType || 'image');
  const [position, setPosition] = useState<CoverPosition>({ x: 50, y: 50, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const type = file.type.includes('video') ? 'video' :
                file.type.includes('gif') ? 'gif' : 'image';
    
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setMediaType(type);
    setPosition({ x: 50, y: 50, scale: 1 });
    
    updateComicCover({
      url,
      type,
    });
  }, [previewUrl, updateComicCover]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': [],
      'video/*': [],
      'image/gif': [],
    },
    multiple: false,
    maxSize: 10485760, // 10MB
    noClick: true,
  });

  const handleRemoveCover = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setPosition({ x: 50, y: 50, scale: 1 });
    updateComicCover({
      url: '',
      type: 'image',
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!previewUrl || !containerRef.current || e.button !== 0) return;
    
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    
    setIsDragging(true);
    const container = containerRef.current.getBoundingClientRect();
    setStartPos({
      x: e.clientX - container.left,
      y: e.clientY - container.top,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const deltaX = ((e.clientX - container.left) - startPos.x) / container.width * 100;
    const deltaY = ((e.clientY - container.top) - startPos.y) / container.height * 100;

    setPosition(prev => {
      const maxOffset = Math.max(0, (prev.scale - 1) * 50);
      return {
        ...prev,
        x: Math.max(50 - maxOffset, Math.min(50 + maxOffset, prev.x + deltaX)),
        y: Math.max(50 - maxOffset, Math.min(50 + maxOffset, prev.y + deltaY)),
      };
    });

    setStartPos({
      x: e.clientX - container.left,
      y: e.clientY - container.top,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta: number) => {
    setPosition(prev => {
      const newScale = Math.max(1, Math.min(3, prev.scale + delta));
      const maxOffset = Math.max(0, (newScale - 1) * 50);
      return {
        ...prev,
        scale: newScale,
        x: Math.max(50 - maxOffset, Math.min(50 + maxOffset, prev.x)),
        y: Math.max(50 - maxOffset, Math.min(50 + maxOffset, prev.y)),
      };
    });
  };

  const handleReset = () => {
    setPosition({ x: 50, y: 50, scale: 1 });
  };

  return (
    <div className="space-y-4">
      <div 
        ref={containerRef}
        className="relative h-64 rounded-lg overflow-hidden bg-gray-100"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div {...getRootProps({ className: 'h-full' })}>
          <input {...getInputProps()} />
          {previewUrl ? (
            <>
              <div className="absolute inset-0">
                {mediaType === 'video' ? (
                  <video
                    ref={mediaRef as React.RefObject<HTMLVideoElement>}
                    src={previewUrl}
                    className="absolute w-full h-full object-cover"
                    style={{
                      transform: `translate(-50%, -50%) scale(${position.scale})`,
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      transformOrigin: 'center',
                      transition: isDragging ? 'none' : 'transform 0.2s',
                    }}
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                ) : (
                  <img
                    ref={mediaRef as React.RefObject<HTMLImageElement>}
                    src={previewUrl}
                    alt="Cover"
                    className="absolute w-full h-full object-cover"
                    style={{
                      transform: `translate(-50%, -50%) scale(${position.scale})`,
                      left: `${position.x}%`,
                      top: `${position.y}%`,
                      transformOrigin: 'center',
                      transition: isDragging ? 'none' : 'transform 0.2s',
                    }}
                  />
                )}
              </div>

              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity">
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      open();
                    }}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-gray-700" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveCover();
                    }}
                    className="p-2 bg-white rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-700" />
                  </button>
                </div>

                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-white/90 rounded-full px-4 py-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleZoom(-0.1);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleZoom(0.1);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <div className="w-px h-4 bg-gray-300" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleReset();
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>

                {isDragging ? null : (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <Move className="w-8 h-8 text-white/75" />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                open();
              }}
              className={`h-full border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div className="h-full flex flex-col items-center justify-center space-y-4">
                <div className="flex space-x-4">
                  <Image className="h-12 w-12 text-gray-400" />
                  <Film className="h-12 w-12 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">
                    {isDragActive ? (
                      'Drop your cover here...'
                    ) : (
                      <>
                        Drag & drop or click to upload your comic cover
                        <br />
                        <span className="text-xs text-gray-500">
                          Supports images, GIFs, and short videos (max 10MB)
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {previewUrl && (
        <p className="text-sm text-gray-500 text-center">
          Drag to position • Use zoom controls to adjust size • Click reset to start over
        </p>
      )}
    </div>
  );
};