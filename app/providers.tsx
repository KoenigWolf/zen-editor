'use client';

import '@/lib/i18n';
import { RootProvider } from '@/components/providers';

export function Providers({ children }: { children: React.ReactNode }) {
  return <RootProvider>{children}</RootProvider>;
}
