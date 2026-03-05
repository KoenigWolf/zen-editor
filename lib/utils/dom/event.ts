/**
 * イベントユーティリティ
 */

export interface Point {
  x: number;
  y: number;
}

/**
 * タッチ/マウスイベントからクライアント座標を取得
 */
export const getEventCoordinates = (event: React.TouchEvent | React.MouseEvent): Point => {
  if ('touches' in event && event.touches.length > 0) {
    const touch = event.touches[0];
    return { x: touch.clientX, y: touch.clientY };
  }
  if ('changedTouches' in event && event.changedTouches.length > 0) {
    const touch = event.changedTouches[0];
    return { x: touch.clientX, y: touch.clientY };
  }
  return { x: (event as React.MouseEvent).clientX, y: (event as React.MouseEvent).clientY };
};
