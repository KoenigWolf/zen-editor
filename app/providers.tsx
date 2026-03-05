'use client';

import '@/lib/i18n';
import { ThemeProvider, PWAProvider } from '@/components/providers';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { LanguageSync } from '@/components/layout/language-sync';
import { LiveAnnouncer } from '@/components/layout/live-announcer';
import { WebVitalsReporter } from '@/components/layout/web-vitals-reporter';
import { SkipLink } from '@/components/layout/skip-link';

export function Providers({ children }: { children: React.ReactNode }) {
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
}
