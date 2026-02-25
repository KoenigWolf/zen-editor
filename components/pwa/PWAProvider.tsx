'use client';

import { ReactNode } from 'react';
import { usePWAManager, PWAContext } from '@/hooks/usePWA';
import { PWAInstallPrompt, OfflineIndicator, UpdateNotification } from './PWAInstallPrompt';

export function PWAProvider({ children }: { children: ReactNode }) {
  const pwa = usePWAManager();

  return (
    <PWAContext.Provider value={pwa}>
      {children}
      <OfflineIndicator />
      <UpdateNotification />
      <PWAInstallPrompt />
    </PWAContext.Provider>
  );
}
