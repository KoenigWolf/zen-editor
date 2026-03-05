/**
 * インデントルーラーの型定義と定数
 */

export const CM_TO_PX = 37.795275591;
export const RULER_HEIGHT = 18;
export const HANDLE_SIZE = 8;

export type DragType = 'firstLine' | 'hanging' | 'leftMargin' | 'rightMargin' | 'tabStop';

export type HandleVariant = 'firstLine' | 'hanging' | 'leftMargin' | 'rightMargin' | 'tabStop';

export interface IndentHandleProps {
  variant: HandleVariant;
  position: number;
  onDragStart: (e: React.MouseEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  label: string;
  value: number;
  onRemove?: () => void;
}

export interface IndentRulerProps {
  className?: string;
}
