import React, { useState, useRef } from 'react';
import { Panel } from '../../types';
import { X, MessageSquare, Move, Type, AlignLeft, AlignCenter, AlignRight, Plus, Minus } from 'lucide-react';

interface PanelEditorProps {
  panel: Panel;
  onUpdate: (panel: Panel) => void;
  onRemove: (panelId: string) => void;
}

export const PanelEditor: React.FC<PanelEditorProps> = ({
  panel,
  onUpdate,
  onRemove,
}) => {
  const [isDraggingCaption, setIsDraggingCaption] = useState(false);
  const [isEditingCaption, setIsEditingCaption] = useState(false);
  const [caption, setCaption] = useState(panel.caption || '');
  const [captionStyle, setCaptionStyle] = useState({
    fontSize: panel.captionStyle?.fontSize || 16,
    fontFamily: panel.captionStyle?.fontFamily || 'Arial',
    backgroundColor: panel.captionStyle?.backgroundColor || 'black',
    opacity: panel.captionStyle?.opacity ?? 0.75,
    textAlign: panel.captionPosition?.align || 'left',
  });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleCaptionDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingCaption(true);
  };

  const handleCaptionDrag = (e: React.MouseEvent) => {
    if (!isDraggingCaption || !containerRef.current) return;

    const container = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - container.left) / container.width) * 100;
    const y = ((e.clientY - container.top) / container.height) * 100;

    onUpdate({
      ...panel,
      captionPosition: {
        ...panel.captionPosition || { vertical: 'bottom', align: captionStyle.textAlign },
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      },
    });
  };

  const handleCaptionDragEnd = () => {
    setIsDraggingCaption(false);
  };

  const handleSaveCaption = () => {
    onUpdate({
      ...panel,
      caption,
      captionPosition: {
        ...panel.captionPosition || { x: 50, y: 90, vertical: 'bottom' },
        align: captionStyle.textAlign,
      },
      captionStyle: {
        fontSize: captionStyle.fontSize,
        fontFamily: captionStyle.fontFamily,
        backgroundColor: captionStyle.backgroundColor,
        opacity: captionStyle.opacity,
      },
    });
    setIsEditingCaption(false);
  };

  const handleFontSizeChange = (delta: number) => {
    setCaptionStyle(prev => ({
      ...prev,
      fontSize: Math.max(12, Math.min(32, prev.fontSize + delta)),
    }));
  };

  const handleOpacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCaptionStyle(prev => ({
      ...prev,
      opacity: parseFloat(e.target.value),
    }));
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full group"
      onMouseMove={handleCaptionDrag}
      onMouseUp={handleCaptionDragEnd}
      onMouseLeave={handleCaptionDragEnd}
    >
      {panel.type === 'video' || panel.type === 'gif' ? (
        <video
          src={panel.url}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        />
      ) : (
        <img
          src={panel.url}
          alt=""
          className="w-full h-full object-cover"
        />
      )}

      {/* Panel controls */}
      <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setIsEditingCaption(true)}
          className="p-1.5 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <MessageSquare size={16} className="text-gray-600" />
        </button>
        <button
          onClick={() => onRemove(panel.id)}
          className="p-1.5 bg-white/90 rounded-full shadow-lg hover:bg-white transition-colors"
        >
          <X size={16} className="text-gray-600" />
        </button>
      </div>

      {/* Caption */}
      {panel.caption && panel.captionPosition && (
        <div
          className={`absolute max-w-[90%] p-2 rounded shadow-lg cursor-move
            ${isDraggingCaption ? 'ring-2 ring-blue-500' : ''}`}
          style={{
            left: `${panel.captionPosition.x}%`,
            top: `${panel.captionPosition.y}%`,
            transform: 'translate(-50%, -50%)',
            backgroundColor: `${panel.captionStyle?.backgroundColor === 'black' ? 
              `rgba(0,0,0,${panel.captionStyle?.opacity ?? 0.75})` : 
              `rgba(255,255,255,${panel.captionStyle?.opacity ?? 0.75})`}`,
            color: panel.captionStyle?.backgroundColor === 'black' ? 'white' : 'black',
            fontSize: `${panel.captionStyle?.fontSize || 16}px`,
            fontFamily: panel.captionStyle?.fontFamily || 'Arial',
            textAlign: panel.captionPosition.align,
          }}
          onMouseDown={handleCaptionDragStart}
        >
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-white/75">
            <Move size={16} />
          </div>
          {panel.caption}
        </div>
      )}

      {/* Caption editor modal */}
      {isEditingCaption && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
            <div className="mb-4">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Add caption..."
                style={{
                  fontFamily: captionStyle.fontFamily,
                  fontSize: `${captionStyle.fontSize}px`,
                }}
              />
            </div>

            {/* Font controls */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Font Style</label>
                <select
                  value={captionStyle.fontFamily}
                  onChange={(e) => setCaptionStyle(prev => ({ ...prev, fontFamily: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times New Roman</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                  <option value="Impact">Impact</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Background</label>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCaptionStyle(prev => ({ ...prev, backgroundColor: 'black' }))}
                    className={`flex-1 px-3 py-2 rounded-md border ${
                      captionStyle.backgroundColor === 'black' ? 'bg-gray-900 text-white' : 'bg-white'
                    }`}
                  >
                    Black
                  </button>
                  <button
                    onClick={() => setCaptionStyle(prev => ({ ...prev, backgroundColor: 'white' }))}
                    className={`flex-1 px-3 py-2 rounded-md border ${
                      captionStyle.backgroundColor === 'white' ? 'bg-white text-black border-gray-900' : 'bg-gray-100'
                    }`}
                  >
                    White
                  </button>
                </div>
              </div>
            </div>

            {/* Size and opacity controls */}
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
                  <span className="text-sm font-medium">{captionStyle.fontSize}px</span>
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
                  Background Opacity: {Math.round(captionStyle.opacity * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={captionStyle.opacity}
                  onChange={handleOpacityChange}
                  className="w-full"
                />
              </div>
            </div>

            {/* Text alignment */}
            <div className="flex space-x-4 mb-4">
              <button
                onClick={() => setCaptionStyle(prev => ({ ...prev, textAlign: 'left' }))}
                className={`p-2 rounded ${captionStyle.textAlign === 'left' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              >
                <AlignLeft size={16} />
              </button>
              <button
                onClick={() => setCaptionStyle(prev => ({ ...prev, textAlign: 'center' }))}
                className={`p-2 rounded ${captionStyle.textAlign === 'center' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              >
                <AlignCenter size={16} />
              </button>
              <button
                onClick={() => setCaptionStyle(prev => ({ ...prev, textAlign: 'right' }))}
                className={`p-2 rounded ${captionStyle.textAlign === 'right' ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
              >
                <AlignRight size={16} />
              </button>
            </div>

            {/* Preview */}
            <div className="mb-4 p-4 bg-gray-100 rounded-lg">
              <div
                className="p-2 rounded"
                style={{
                  backgroundColor: captionStyle.backgroundColor === 'black' ? 
                    `rgba(0,0,0,${captionStyle.opacity})` : 
                    `rgba(255,255,255,${captionStyle.opacity})`,
                  color: captionStyle.backgroundColor === 'black' ? 'white' : 'black',
                  fontFamily: captionStyle.fontFamily,
                  fontSize: `${captionStyle.fontSize}px`,
                  textAlign: captionStyle.textAlign as any,
                }}
              >
                {caption || 'Preview text'}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setIsEditingCaption(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCaption}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Save Caption
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};