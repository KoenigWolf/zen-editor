import { clamp } from '../data/math';
import { isBrowser } from './ssr';

export interface Size {
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface ConstrainOptions {
  margin?: number;
}

export const constrainToViewport = (
  position: Position,
  elementSize: Size,
  options: ConstrainOptions = {}
): Position => {
  if (!isBrowser) return position;

  const { margin = 0 } = options;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const maxX = Math.max(margin, viewportWidth - elementSize.width - margin);
  const maxY = Math.max(margin, viewportHeight - elementSize.height - margin);

  return {
    x: clamp(position.x, margin, maxX),
    y: clamp(position.y, margin, maxY),
  };
};
