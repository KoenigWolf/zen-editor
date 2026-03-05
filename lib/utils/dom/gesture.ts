import type { Point } from './event';

export interface Delta {
  x: number;
  y: number;
}

/**
 * 2点間のデルタ（移動量）を計算
 */
export const getDelta = (current: Point, start: Point): Delta => ({
  x: current.x - start.x,
  y: current.y - start.y,
});

/**
 * 垂直方向の移動が水平方向より大きいかを判定
 */
export const isVerticalDominant = (delta: Delta): boolean => Math.abs(delta.y) > Math.abs(delta.x);

/**
 * デルタが閾値を超えているかを判定（いずれかの軸）
 */
export const exceedsThreshold = (delta: Delta, threshold: number): boolean =>
  Math.abs(delta.x) > threshold || Math.abs(delta.y) > threshold;
