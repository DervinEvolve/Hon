import React, { useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { Panel, Template } from '../../types';
import { DraggablePanel } from './DraggablePanel';
import { useComicStore } from '../../store/useComicStore';

interface PanelGridProps {
  template: Template;
  panels: Panel[];
  onUpdatePanel: (panel: Panel) => void;
  onRemovePanel: (panelId: string) => void;
  onReorderPanels: (startIndex: number, endIndex: number) => void;
  isEditing?: boolean;
}

export const PanelGrid: React.FC<PanelGridProps> = ({
  template,
  panels,
  onUpdatePanel,
  onRemovePanel,
  onReorderPanels,
  isEditing = false,
}) => {
  const { currentPageIndex, addPanel } = useComicStore();
  const [activeId, setActiveId] = React.useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDrop = useCallback(async (e: React.DragEvent, areaIndex: number) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0]; // Handle one file at a time
    const type = file.type.includes('video') ? 'video' : 
                file.type.includes('gif') ? 'gif' : 'image';

    const url = URL.createObjectURL(file);
    const area = template.layout.areas[areaIndex];

    // Create a temporary media element to get dimensions
    const media = type === 'video' ? document.createElement('video') : document.createElement('img');
    
    media.onload = media.onloadedmetadata = () => {
      const aspectRatio = media instanceof HTMLVideoElement 
        ? media.videoWidth / media.videoHeight
        : media.width / media.height;

      const panel: Panel = {
        id: Math.random().toString(36).substr(2, 9),
        type,
        url,
        aspectRatio,
        size: area.size,
        position: area.position,
        caption: '',
      };

      addPanel(panel, currentPageIndex);
    };

    media.src = url;
    if (type === 'video') {
      (media as HTMLVideoElement).load();
    }
  }, [addPanel, currentPageIndex, template.layout.areas]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('border-blue-500', 'bg-blue-50/10');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50/10');
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => setActiveId(event.active.id as string)}
      onDragEnd={(event) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
          const oldIndex = panels.findIndex((p) => p.id === active.id);
          const newIndex = panels.findIndex((p) => p.id === over.id);
          onReorderPanels(oldIndex, newIndex);
        }
        setActiveId(null);
      }}
    >
      <div 
        className="grid gap-4 p-4 bg-transparent rounded-lg"
        style={{
          gridTemplateColumns: `repeat(${template.layout.cols}, minmax(0, 1fr))`,
          gridAutoRows: 'minmax(200px, auto)',
          minHeight: '600px',
        }}
      >
        <SortableContext items={panels.map((p) => p.id)} strategy={rectSortingStrategy}>
          {template.layout.areas.map((area, index) => {
            const panel = panels[index];
            const gridItemStyle = {
              gridRow: `span ${area.position.rowSpan || 1}`,
              gridColumn: `span ${area.position.colSpan || 1}`,
            };

            if (!panel) {
              return (
                <div
                  key={`empty-${index}`}
                  style={gridItemStyle}
                  className="border-2 border-dashed border-gray-300 rounded-lg bg-transparent flex items-center justify-center transition-all duration-200"
                  onDrop={(e) => handleDrop(e, index)}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                >
                  <p className="text-gray-400 text-sm">Drop content here</p>
                </div>
              );
            }

            return (
              <div 
                key={panel.id}
                style={gridItemStyle}
                className="relative overflow-hidden rounded-lg"
              >
                <DraggablePanel
                  panel={panel}
                  onUpdate={onUpdatePanel}
                  onRemove={onRemovePanel}
                />
              </div>
            );
          })}
        </SortableContext>
      </div>
    </DndContext>
  );
};