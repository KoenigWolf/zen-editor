'use client';

import { useMemo, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from 'next-themes';
import { useFileStore } from '@/lib/store/file-store';
import { useSplitViewStore, useIsSplit } from '@/lib/store/split-view-store';
import { useSearchStore } from '@/lib/store/search-store';
import { useKeyboardShortcuts } from '@/hooks/editor/use-keyboard-shortcuts';
import { useEditorActions } from '@/hooks/editor/use-editor-actions';
import type { CommandItem } from '@/components/editor/command-palette';
import {
  Plus,
  Download,
  FolderOpen,
  Search,
  Settings,
  RotateCcw,
  RotateCw,
  Columns2,
  Rows2,
  X,
  Moon,
  Sun,
  Hash,
} from 'lucide-react';

const getNextTheme = (currentTheme: string | undefined): string =>
  currentTheme === 'dark' ? 'light' : 'dark';

const getThemeIcon = (currentTheme: string | undefined) => (currentTheme === 'dark' ? Sun : Moon);

interface UseEditorCommandsOptions {
  onOpenSettings: () => void;
  onOpenCommandPalette: () => void;
}

export const useEditorCommands = ({
  onOpenSettings,
  onOpenCommandPalette,
}: UseEditorCommandsOptions) => {
  const { t } = useTranslation();
  const { resolvedTheme, setTheme } = useTheme();
  const activeFile = useFileStore((state) => state.files.find((f) => f.id === state.activeFileId));
  const addFile = useFileStore((state) => state.addFile);
  const { splitActive, reset } = useSplitViewStore();
  const isSplit = useIsSplit();
  const { setIsOpen: setSearchOpen } = useSearchStore();

  const { handleNewFile, handleSave, handleOpen, handleGoToLine } = useKeyboardShortcuts({
    onOpenSettings,
    onOpenCommandPalette,
  });
  const { handleUndo, handleRedo } = useEditorActions();

  const resolvedThemeRef = useRef(resolvedTheme);
  resolvedThemeRef.current = resolvedTheme;

  const toggleTheme = useCallback(
    () => setTheme(getNextTheme(resolvedThemeRef.current)),
    [setTheme]
  );

  const openSearch = useCallback(() => setSearchOpen(true), [setSearchOpen]);

  const splitWithCopy = useCallback(
    (direction: 'vertical' | 'horizontal') => {
      if (!activeFile) return;
      const newFileId = addFile({
        name: `${activeFile.name} (copy)`,
        content: activeFile.content,
        path: '',
        lastModified: Date.now(),
      });
      splitActive(direction, newFileId);
    },
    [activeFile, addFile, splitActive]
  );

  const splitVertical = useCallback(() => splitWithCopy('vertical'), [splitWithCopy]);
  const splitHorizontal = useCallback(() => splitWithCopy('horizontal'), [splitWithCopy]);

  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: 'new-file',
        label: t('commandPalette.actions.newFile'),
        shortcut: '⌘+N',
        icon: Plus,
        action: handleNewFile,
        category: 'file',
      },
      {
        id: 'open-file',
        label: t('commandPalette.actions.openFile'),
        shortcut: '⌘+O',
        icon: FolderOpen,
        action: handleOpen,
        category: 'file',
      },
      {
        id: 'save-file',
        label: t('commandPalette.actions.saveFile'),
        shortcut: '⌘+S',
        icon: Download,
        action: handleSave,
        category: 'file',
      },
      {
        id: 'undo',
        label: t('commandPalette.actions.undo'),
        shortcut: '⌘+Z',
        icon: RotateCcw,
        action: handleUndo,
        category: 'edit',
      },
      {
        id: 'redo',
        label: t('commandPalette.actions.redo'),
        shortcut: '⌘+Y',
        icon: RotateCw,
        action: handleRedo,
        category: 'edit',
      },
      {
        id: 'find',
        label: t('commandPalette.actions.find'),
        shortcut: '⌘+F',
        icon: Search,
        action: openSearch,
        category: 'search',
      },
      {
        id: 'go-to-line',
        label: t('commandPalette.actions.goToLine'),
        shortcut: '⌘+G',
        icon: Hash,
        action: handleGoToLine,
        category: 'search',
      },
      {
        id: 'split-vertical',
        label: t('commandPalette.actions.splitVertical'),
        shortcut: '⌘+\\',
        icon: Columns2,
        action: splitVertical,
        category: 'view',
      },
      {
        id: 'split-horizontal',
        label: t('commandPalette.actions.splitHorizontal'),
        shortcut: '⌘+\\',
        icon: Rows2,
        action: splitHorizontal,
        category: 'view',
      },
      ...(isSplit
        ? [
            {
              id: 'close-split',
              label: t('commandPalette.actions.closeSplit'),
              shortcut: '⇧⌘+\\',
              icon: X,
              action: reset,
              category: 'view' as const,
            },
          ]
        : []),
      {
        id: 'toggle-theme',
        label: t('commandPalette.actions.toggleTheme'),
        icon: getThemeIcon(resolvedTheme),
        action: toggleTheme,
        category: 'view',
      },
      {
        id: 'open-settings',
        label: t('commandPalette.actions.openSettings'),
        shortcut: '⌘+,',
        icon: Settings,
        action: onOpenSettings,
        category: 'settings',
      },
    ],
    [
      t,
      handleNewFile,
      handleOpen,
      handleSave,
      handleUndo,
      handleRedo,
      handleGoToLine,
      openSearch,
      onOpenSettings,
      splitVertical,
      splitHorizontal,
      reset,
      isSplit,
      resolvedTheme,
      toggleTheme,
    ]
  );

  return {
    commands,
    toggleTheme,
    openSearch,
    handleNewFile,
    handleSave,
    handleOpen,
    handleUndo,
    resolvedTheme,
  };
};
