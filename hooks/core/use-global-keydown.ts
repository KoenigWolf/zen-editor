'use client';

import { useEffect } from 'react';

type KeydownTarget = Window | Document | HTMLElement | null | undefined;

interface UseGlobalKeydownOptions {
  enabled?: boolean;
  target?: KeydownTarget;
  handler: (event: KeyboardEvent) => void;
}

export const useGlobalKeydown = ({ enabled = true, target, handler }: UseGlobalKeydownOptions) => {
  useEffect(() => {
    if (!enabled) return;
    const resolvedTarget = target ?? window;
    if (!resolvedTarget) return;

    const listener: EventListener = (event) => handler(event as KeyboardEvent);
    resolvedTarget.addEventListener('keydown', listener);
    return () => resolvedTarget.removeEventListener('keydown', listener);
  }, [enabled, target, handler]);
};
