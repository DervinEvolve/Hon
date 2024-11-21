import React, { useState, useRef, useEffect } from 'react';
import { Panel, CaptionPosition } from '../../types';
import { AlignLeft, AlignCenter, AlignRight, Move, Type, Plus, Minus } from 'lucide-react';

interface CaptionEditorProps {
  panel: Panel;
  onUpdate: (panel: Panel) => void;
  onClose: () => void;
}

interface CaptionStyle {
  fontSize: number;
  fontFamily: string;
  backgroundColor: 'black' | 'white';
  opacity: number;
}

const fontFamilies = [
  'Arial',
  'Helvetica',
  'Times New Roman',
  'Georgia',
  'Comic Sans MS',
  'Impact',
];

export const CaptionEditor: React.FC<CaptionEditorProps> = ({
  panel,
  onUpdate,
  onClose,
}) => {
  const [caption, setCaption] = useState(panel.caption || '');
  const [position, setPosition] = useState<CaptionPosition>(
    panel.captionPosition || {
      x: 50,
      y: 10,
      align: 'left',
      vertical: 'top',
    }
  );
  const [style, setStyle] = useState<CaptionStyle>({
    fontSize: panel.captionStyle?.fontSize || 16,
    fontFamily: panel.captionStyle?.fontFamily || 'Arial',
    backgroundColor: panel.captionStyle?.backgroundColor || 'black',
    opacity: panel.captionStyle?.opacity || 0.75,
  });
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current || !captionRef.current) return;

      const container = containerRef.current.getBoundingClientRect();
      const caption = captionRef.current.getBoundingClientRect();

      const x = ((e.clientX - container.left) / container.width) * 100;
      const y = ((e.clientY - container.top) / container.height) * 100;

      const xPos = Math.max(0, Math.min(100, x));
      const yPos = Math.max(0, Math.min(100, y));

      setPosition(prev => ({
        ...prev,
        x: xPos,
        y: yPos,
      }));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const handleStartDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleFontSizeChange = (delta: number) => {
    setStyle(prev => ({
      ...prev,
      fontSize: Math.max(12, Math.min(32, prev.fontSize + delta)),
    }));
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStyle(prev => ({
      ...prev,
      opacity: parseFloat(e.target.value),
    }));
  };

  const handleSave = () => {
    onUpdate({
      ...panel,
      caption,
      captionPosition: position,
      captionStyle: style,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-4xl">
        <div className="mb-4">
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Enter caption text..."
            style={{
              fontFamily: style.fontFamily,
              fontSize: `${style.fontSize}px`,
            }}
          />
        </div>

        {/* Text Controls */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Font Style</label>
            <select
              value={style.fontFamily}
              onChange={(e) => setStyle(prev => ({ ...prev, fontFamily: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {fontFamilies.map(font => (
                <option key={font} value={font} style={{ fontFamily: font }}>
                  {font}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Background</label>
            <div className="flex space-x-2">
              <button
                onClick={() => setStyle(prev => ({ ...prev, backgroundColor: 'black' }))}
                className={`flex-1 px-3 py-2 rounded-md border ${
                  style.backgroundColor === 'black'
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-900 border-gray-300'
                }`}
              >
                Black
              </button>
              <button
                onClick={() => setStyle(prev => ({ ...prev, backgroundColor: 'white' }))}
                className={`flex-1 px-3 py-2 rounded-md border ${
                  style.backgroundColor === 'white'
                    ? 'bg-white text-gray-900 border-gray-900'
                    : 'bg-gray-100 text-gray-900 border-gray-300'
                }`}
              >
                White
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Font Size</label>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleFontSizeChange(-1)}
                className="p-2 rounded-md border hover:bg-gray-50"
              >
                <Minus size={16} />
              </button>
              <span className="text-sm font-medium">{style.fontSize}px</span>
              <button
                onClick={() => handleFontSizeChange(1)}
                className="p-2 rounded-md border hover:bg-gray-50"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Background Opacity: {Math.round(style.opacity * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={style.opacity}
              onChange={handleOpacityChange}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex space-x-4 mb-4">
          <button
            onClick={() => setPosition(prev => ({ ...prev, align: 'left' }))}
            className={`p-2 rounded ${position.align === 'left' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            <AlignLeft size={16} />
          </button>
          <button
            onClick={() => setPosition(prev => ({ ...prev, align: 'center' }))}
            className={`p-2 rounded ${position.align === 'center' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            <AlignCenter size={16} />
          </button>
          <button
            onClick={() => setPosition(prev => ({ ...prev, align: 'right' }))}
            className={`p-2 rounded ${position.align === 'right' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            <AlignRight size={16} />
          </button>
        </div>

        <div 
          ref={containerRef}
          className="relative w-full h-96 bg-gray-100 rounded-lg mb-4 overflow-hidden"
        >
          {panel.type === 'video' || panel.type === 'gif' ? (
            <video
              src={panel.url}
              className="w-full h-full object-contain"
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={panel.url}
              alt=""
              className="w-full h-full object-contain"
            />
          )}

          {caption && (
            <div
              ref={captionRef}
              style={{
                left: `${position.x}%`,
                top: `${position.y}%`,
                transform: 'translate(-50%, -50%)',
                fontFamily: style.fontFamily,
                fontSize: `${style.fontSize}px`,
                backgroundColor: style.backgroundColor === 'black' ? `rgba(0,0,0,${style.opacity})` : `rgba(255,255,255,${style.opacity})`,
                color: style.backgroundColor === 'black' ? 'white' : 'black',
              }}
              className={`absolute max-w-[80%] p-2 rounded shadow-lg cursor-move
                ${isDragging ? 'ring-2 ring-blue-500' : ''}`}
              onMouseDown={handleStartDrag}
            >
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-white/75">
                <Move size={16} />
              </div>
              <p style={{ textAlign: position.align }}>{caption}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Save Caption
          </button>
        </div>
      </div>
    </div>
  );
};