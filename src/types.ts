export interface CaptionPosition {
  x: number;
  y: number;
  align: 'left' | 'center' | 'right';
  vertical: 'top' | 'middle' | 'bottom';
}

export interface CaptionStyle {
  fontSize: number;
  fontFamily: string;
  backgroundColor: 'black' | 'white';
  opacity: number;
}

export interface CoverPosition {
  x: number;
  y: number;
  scale: number;
}

export interface Panel {
  id: string;
  type: 'image' | 'video' | 'gif';
  url: string;
  caption?: string;
  captionPosition?: CaptionPosition;
  captionStyle?: CaptionStyle;
  transition?: 'fade' | 'slide';
  size?: 'small' | 'medium' | 'large' | 'full';
  position?: {
    row: number;
    col: number;
    rowSpan?: number;
    colSpan?: number;
  };
  aspectRatio?: number;
  focalPoint?: { x: number; y: number };
}

export interface Template {
  id: string;
  name: string;
  description: string;
  icon: string;
  layout: {
    rows: number;
    cols: number;
    areas: {
      size: Panel['size'];
      position: Panel['position'];
    }[];
  };
}

export interface Comic {
  id: string;
  title: string;
  creator: string;
  coverImage: string;
  coverType: 'image' | 'video' | 'gif';
  coverPosition?: CoverPosition;
  template?: Template;
  panels: Panel[];
  createdAt: Date;
  pages: Panel[][];
  isReading?: boolean;
}