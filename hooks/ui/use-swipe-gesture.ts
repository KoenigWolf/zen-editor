'use client';

import { useCallback, useRef } from 'react';
import { getDelta, isVerticalDominant } from '@/lib/utils';

interface SwipeGestureOptions {
  /** スワイプと判定する最小距離（ピクセル） */
  threshold?: number;
  /** 垂直方向の移動が水平移動を上回った場合にキャンセルする */
  preventVertical?: boolean;
  /** 左スワイプ時のコールバック */
  onSwipeLeft?: () => void;
  /** 右スワイプ時のコールバック */
  onSwipeRight?: () => void;
}

interface SwipeGestureHandlers {
  onTouchStart: (event: React.TouchEvent) => void;
  onTouchMove: (event: React.TouchEvent) => void;
  onTouchEnd: (event: React.TouchEvent) => void;
}

/**
 * 水平スワイプジェスチャーを検出するカスタムフック
 */
export const useSwipeGesture = ({
  threshold = 50,
  preventVertical = true,
  onSwipeLeft,
  onSwipeRight,
}: SwipeGestureOptions): SwipeGestureHandlers => {
  const startPosRef = useRef<{ x: number; y: number } | null>(null);
  const isCancelledRef = useRef(false);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    startPosRef.current = { x: touch.clientX, y: touch.clientY };
    isCancelledRef.current = false;
  }, []);

  const handleTouchMove = useCallback(
    (event: React.TouchEvent) => {
      if (!startPosRef.current || isCancelledRef.current) return;

      const touch = event.touches[0];
      const delta = getDelta({ x: touch.clientX, y: touch.clientY }, startPosRef.current);

      if (preventVertical && isVerticalDominant(delta)) {
        isCancelledRef.current = true;
      }
    },
    [preventVertical]
  );

  const handleTouchEnd = useCallback(
    (event: React.TouchEvent) => {
      if (!startPosRef.current || isCancelledRef.current) {
        startPosRef.current = null;
        return;
      }

      const touch = event.changedTouches[0];
      const delta = getDelta({ x: touch.clientX, y: touch.clientY }, startPosRef.current);

      if (preventVertical && isVerticalDominant(delta)) {
        startPosRef.current = null;
        return;
      }

      if (delta.x > threshold) {
        onSwipeRight?.();
      } else if (delta.x < -threshold) {
        onSwipeLeft?.();
      }

      startPosRef.current = null;
    },
    [threshold, preventVertical, onSwipeLeft, onSwipeRight]
  );

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
};
