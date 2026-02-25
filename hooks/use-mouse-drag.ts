'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface UseMouseDragOptions<T> {
  enabled?: boolean;
  onMove: (event: MouseEvent, context: T) => void;
  onEnd?: (context: T) => void;
}

export const useMouseDrag = <T>({ enabled = true, onMove, onEnd }: UseMouseDragOptions<T>) => {
  const [isDragging, setIsDragging] = useState(false);
  const contextRef = useRef<T | null>(null);

  const startDrag = useCallback(
    (event: React.MouseEvent, context: T) => {
      if (!enabled) return;
      contextRef.current = context;
      setIsDragging(true);
    },
    [enabled]
  );

  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (event: MouseEvent) => {
      if (contextRef.current === null) return;
      onMove(event, contextRef.current);
    };

    const handleUp = () => {
      if (contextRef.current !== null && onEnd) {
        onEnd(contextRef.current);
      }
      contextRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };
  }, [isDragging, onMove, onEnd]);

  return { isDragging, startDrag };
};
