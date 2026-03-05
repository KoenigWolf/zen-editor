'use client';

import { useCallback } from 'react';
import { useFileStore } from '@/lib/store/file-store';
import { useEditorInstanceStore } from '@/lib/store/editor-instance-store';
import { useSplitViewStore } from '@/lib/store/split-view-store';
import { useFileOperations } from '@/hooks/editor/use-file-operations';
import { useGlobalKeydown } from '@/hooks/core/use-global-keydown';
import { getNextIndex, getPrevIndex } from '@/lib/utils';

interface UseKeyboardShortcutsOptions {
  onOpenSettings?: () => void;
  onOpenCommandPalette?: () => void;
}

export function useKeyboardShortcuts(options: UseKeyboardShortcutsOptions = {}) {
  const { removeFile, files, activeFileId, setActiveFileId } = useFileStore();
  const { getEditorInstance } = useEditorInstanceStore();
  const { splitActive, reset, isSplit } = useSplitViewStore();
  const { handleNewFile, handleSave, handleOpen } = useFileOperations();

  const handleCloseTab = useCallback(() => {
    if (!activeFileId) return;
    if (files.length <= 1) return;

    removeFile(activeFileId);
  }, [activeFileId, files.length, removeFile]);

  const handleNextTab = useCallback(() => {
    if (files.length <= 1) return;

    const currentIndex = files.findIndex((f) => f.id === activeFileId);
    const nextIndex = getNextIndex(currentIndex, files.length);
    setActiveFileId(files[nextIndex].id);
  }, [files, activeFileId, setActiveFileId]);

  const handlePrevTab = useCallback(() => {
    if (files.length <= 1) return;

    const currentIndex = files.findIndex((f) => f.id === activeFileId);
    const prevIndex = getPrevIndex(currentIndex, files.length);
    setActiveFileId(files[prevIndex].id);
  }, [files, activeFileId, setActiveFileId]);

  const handleGoToLine = useCallback(() => {
    const editor = getEditorInstance();
    if (!editor) return;

    editor.trigger('keyboard', 'editor.action.gotoLine', null);
  }, [getEditorInstance]);

  const handleToggleSplit = useCallback(() => {
    if (isSplit()) {
      reset();
    } else {
      splitActive('vertical');
    }
  }, [isSplit, reset, splitActive]);

  const handleCloseSplit = useCallback(() => {
    reset();
  }, [reset]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;

      if (isMod && e.key === 'n') {
        e.preventDefault();
        handleNewFile();
        return;
      }

      if (isMod && e.key === 's') {
        e.preventDefault();
        handleSave();
        return;
      }

      if (isMod && e.key === 'o') {
        e.preventDefault();
        handleOpen();
        return;
      }

      if (isMod && e.key === 'w') {
        e.preventDefault();
        handleCloseTab();
        return;
      }

      if (isMod && e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault();
        handleNextTab();
        return;
      }

      if (isMod && e.key === 'Tab' && e.shiftKey) {
        e.preventDefault();
        handlePrevTab();
        return;
      }

      if (isMod && e.key === 'g') {
        e.preventDefault();
        handleGoToLine();
        return;
      }

      if (isMod && e.key === 'p') {
        e.preventDefault();
        options.onOpenCommandPalette?.();
        return;
      }

      if (isMod && e.key === ',') {
        e.preventDefault();
        options.onOpenSettings?.();
        return;
      }

      if (e.key === 'F1') {
        e.preventDefault();
        options.onOpenCommandPalette?.();
        return;
      }

      if (isMod && e.key === '\\') {
        e.preventDefault();
        handleToggleSplit();
        return;
      }

      if (isMod && e.shiftKey && e.key === '|') {
        e.preventDefault();
        handleCloseSplit();
        return;
      }
    },
    [
      handleNewFile,
      handleSave,
      handleOpen,
      handleCloseTab,
      handleNextTab,
      handlePrevTab,
      handleGoToLine,
      handleToggleSplit,
      handleCloseSplit,
      options,
    ]
  );

  useGlobalKeydown({ handler: handleKeyDown });

  return {
    handleNewFile,
    handleSave,
    handleOpen,
    handleCloseTab,
    handleNextTab,
    handlePrevTab,
    handleGoToLine,
    handleToggleSplit,
    handleCloseSplit,
  };
}
