'use client';

import { ThemeProvider } from './theme-provider';
import { PWAProvider } from './pwa-provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { LanguageSync, LiveAnnouncer, WebVitalsReporter, SkipLink } from '@/components/layout';

interface RootProviderProps {
  children: React.ReactNode;
}

/**
 * アプリケーション全体のプロバイダーを統合
 * テーマ、PWA、ツールチップ、トースト、アクセシビリティ機能を提供
 */
export const RootProvider = ({ children }: RootProviderProps) => {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <TooltipProvider>
        <SkipLink />
        <LanguageSync />
        <PWAProvider>{children}</PWAProvider>
        <Toaster />
        <LiveAnnouncer />
        <WebVitalsReporter />
      </TooltipProvider>
    </ThemeProvider>
  );
};
