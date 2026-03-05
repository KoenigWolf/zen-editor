import { clamp } from '../data/math';

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

/**
 * 位置をビューポート内に制限する
 * @param position 制限する位置
 * @param elementSize 要素のサイズ
 * @param options オプション（マージンなど）
 */
export const constrainToViewport = (
  position: Position,
  elementSize: Size,
  options: ConstrainOptions = {}
): Position => {
  const { margin = 0 } = options;

  const maxX = Math.max(margin, window.innerWidth - elementSize.width - margin);
  const maxY = Math.max(margin, window.innerHeight - elementSize.height - margin);

  return {
    x: clamp(position.x, margin, maxX),
    y: clamp(position.y, margin, maxY),
  };
};
