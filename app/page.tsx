'use client';

import { useEffect } from 'react';
import { EditorContainer } from '@/components/editor/editor-container';
import { useFileStore } from '@/lib/store/file-store';
import { SeoContent } from '@/components/seo/seo-content';
import { useMounted } from '@/hooks/core/use-mounted';

export default function Home() {
  const mounted = useMounted();
  const files = useFileStore((state) => state.files);
  const addFile = useFileStore((state) => state.addFile);
  const _hasHydrated = useFileStore((state) => state._hasHydrated);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (files.length > 0) return;

    addFile({
      name: 'untitled.txt',
      content: '',
      path: '',
      lastModified: Date.now(),
    });
  }, [_hasHydrated, files.length, addFile]);

  if (!mounted) return null;

  return (
    <main id="main-content" className="h-full w-full max-w-full flex flex-col overflow-hidden">
      <EditorContainer />
      <SeoContent />
    </main>
  );
}
