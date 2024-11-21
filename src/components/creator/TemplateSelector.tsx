import React from 'react';
import { Layout, Maximize2, Columns, Grid3X3 } from 'lucide-react';
import { Template } from '../../types';

const templates: Template[] = [
  {
    id: 'classic',
    name: 'Classic Strip',
    description: '3x1 grid, perfect for traditional comic strips',
    icon: 'Columns',
    layout: {
      rows: 1,
      cols: 3,
      areas: [
        { size: 'medium', position: { row: 0, col: 0 } },
        { size: 'medium', position: { row: 0, col: 1 } },
        { size: 'medium', position: { row: 0, col: 2 } },
      ],
    },
  },
  {
    id: 'grid',
    name: 'Grid Layout',
    description: '3x3 grid for dynamic storytelling',
    icon: 'Grid3X3',
    layout: {
      rows: 3,
      cols: 3,
      areas: Array.from({ length: 9 }, (_, i) => ({
        size: 'small',
        position: { row: Math.floor(i / 3), col: i % 3 },
      })),
    },
  },
  {
    id: 'featured',
    name: 'Featured Panel',
    description: 'Highlight one panel with supporting content',
    icon: 'Maximize2',
    layout: {
      rows: 2,
      cols: 2,
      areas: [
        { size: 'large', position: { row: 0, col: 0, rowSpan: 2, colSpan: 1 } },
        { size: 'small', position: { row: 0, col: 1 } },
        { size: 'small', position: { row: 1, col: 1 } },
      ],
    },
  },
];

interface TemplateSelectorProps {
  onSelect: (template: Template) => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onSelect }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Columns':
        return <Columns className="w-6 h-6" />;
      case 'Grid3X3':
        return <Grid3X3 className="w-6 h-6" />;
      case 'Maximize2':
        return <Maximize2 className="w-6 h-6" />;
      default:
        return <Layout className="w-6 h-6" />;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {templates.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template)}
          className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
        >
          <div className="flex items-center space-x-3 mb-2">
            {getIcon(template.icon)}
            <h3 className="text-lg font-semibold text-gray-800">{template.name}</h3>
          </div>
          <p className="text-sm text-gray-600">{template.description}</p>
        </button>
      ))}
    </div>
  );
};