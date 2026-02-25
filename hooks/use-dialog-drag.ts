'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

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
  const [isDragging, setIsDragging] = useState(false);
  const dragOffset = useRef<Position>({ x: 0, y: 0 });

  const startDrag = useCallback(
    (event: React.MouseEvent) => {
      if (!enabled) return;
      setIsDragging(true);
      dragOffset.current = {
        x: event.clientX - position.x,
        y: event.clientY - position.y,
      };
    },
    [enabled, position]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (event: MouseEvent) => {
      let next = {
        x: event.clientX - dragOffset.current.x,
        y: event.clientY - dragOffset.current.y,
      };
      if (clamp) {
        next = clamp(next);
      }
      onPositionChange(next);
    };

    const handleUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, clamp, onPositionChange]);

  return { isDragging, startDrag };
};
