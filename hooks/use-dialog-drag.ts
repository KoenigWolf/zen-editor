'use client';

import { useCallback } from 'react';
import { useMouseDrag } from '@/hooks/use-mouse-drag';

type Position = { x: number; y: number };

interface UseDialogDragOptions {
  enabled?: boolean;
  position: Position;
  onPositionChange: (next: Position) => void;
  clamp?: (next: Position) => Position;
}

export const useDialogDrag = ({
  enabled = true,
  position,
  onPositionChange,
  clamp,
}: UseDialogDragOptions) => {
  const { isDragging, startDrag: startMouseDrag } = useMouseDrag<Position>({
    enabled,
    onMove: (event, offset) => {
      let next = {
        x: event.clientX - offset.x,
        y: event.clientY - offset.y,
      };
      if (clamp) {
        next = clamp(next);
      }
      onPositionChange(next);
    },
  });

  const startDrag = useCallback(
    (event: React.MouseEvent) => {
      const offset = {
        x: event.clientX - position.x,
        y: event.clientY - position.y,
      };
      startMouseDrag(event, offset);
    },
    [position, startMouseDrag]
  );

  return { isDragging, startDrag };
};
