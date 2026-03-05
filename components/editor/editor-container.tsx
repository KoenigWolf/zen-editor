'use client';

import { memo, useCallback, useRef, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { EditorToolbar } from '@/components/editor/editor-toolbar';
import { IndentRuler } from '@/components/editor/indent';
import { SplitPane } from '@/components/editor/split-pane';
import { EditorStatusBar } from '@/components/editor/editor-status-bar';
import {
  MobileTopBar,
  MobileTabsBar,
  MobileQuickActions,
  MobileStatusBar,
  MobileFocusModeIndicator,
  MobileFocusExitButton,
} from '@/components/editor/mobile-editor-ui';
import { useFileStore } from '@/lib/store/file-store';
import { useEditorInstanceStore } from '@/lib/store/editor-instance-store';
import { useSplitViewStore } from '@/lib/store/split-view-store';
import { useSearchStore } from '@/lib/store/search-store';
import { useIndentStore } from '@/lib/store/indent-store';
import { FileTabs } from '@/components/editor/file-tabs';
import { useTranslation } from 'react-i18next';
import { useMobileDetection } from '@/hooks/platform/use-mobile-detection';
import { useSwipeGesture } from '@/hooks/ui/use-swipe-gesture';
import { useVirtualKeyboard } from '@/hooks/platform/use-virtual-keyboard';
import { TabContextMenu } from '@/components/editor/tab-context-menu';
import { useTabActions } from '@/hooks/editor/use-tab-actions';
import { useEditorCommands } from '@/hooks/editor/use-editor-commands';

const CommandPalette = dynamic(
  () =>
    import('@/components/editor/command-palette').then((mod) => ({ default: mod.CommandPalette })),
  { ssr: false }
);

const SettingsDialog = dynamic(
  () =>
    import('@/components/settings/settings-dialog').then((mod) => ({
      default: mod.SettingsDialog,
    })),
  { ssr: false }
);

export const EditorContainer = memo(function EditorContainer() {
  const activeFile = useFileStore((state) => state.files.find((f) => f.id === state.activeFileId));
  const files = useFileStore((state) => state.files);
  const activeFileId = useFileStore((state) => state.activeFileId);
  const statusInfo = useEditorInstanceStore((state) => state.statusInfo);
  const { root, setRatio, setPaneFile } = useSplitViewStore();
  const { setIsOpen: setSearchOpen } = useSearchStore();
  const rulerVisible = useIndentStore((state) => state.rulerVisible);
  const { t } = useTranslation();

  const [showSettings, setShowSettings] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isMobile, mounted } = useMobileDetection();
  const { isKeyboardVisible } = useVirtualKeyboard();

  const {
    contextMenu,
    handleTabLongPress,
    closeContextMenu,
    handleCloseTab,
    handleCloseLeftTabs,
    handleCloseRightTabs,
    handleCloseOtherTabs,
    handleCloseAllTabs,
    handleDuplicateTab,
    handleRenameTab,
    switchToNextFile,
    switchToPrevFile,
    tabCapabilities,
  } = useTabActions();

  const {
    commands,
    toggleTheme,
    handleNewFile,
    handleSave,
    handleOpen,
    handleUndo,
    resolvedTheme,
  } = useEditorCommands({
    onOpenSettings: () => setShowSettings(true),
    onOpenCommandPalette: () => setShowCommandPalette(true),
  });

  const swipeHandlers = useSwipeGesture({
    threshold: 80,
    preventVertical: true,
    onSwipeLeft: switchToNextFile,
    onSwipeRight: switchToPrevFile,
  });

  useEffect(() => {
    if (root.type === 'leaf' && activeFileId) {
      setPaneFile(root.id, activeFileId);
    }
  }, [root.type, root.id, activeFileId, setPaneFile]);

  const handleEditorAreaClick = useCallback(() => {
    if (!isMobile) return;

    if (focusMode) {
      setFocusMode(false);
      setShowQuickActions(false);
    } else {
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = setTimeout(() => setFocusMode(true), 2000);
    }
  }, [isMobile, focusMode]);

  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) clearTimeout(focusTimeoutRef.current);
    };
  }, []);

  const toggleQuickActions = useCallback(() => setShowQuickActions((prev) => !prev), []);

  const showMobileUI = mounted && isMobile;

  return (
    <div
      className={`mochi-editor-container flex flex-col h-full w-full max-w-full overflow-hidden ${showMobileUI && focusMode ? 'mochi-focus-mode' : ''}`}
      role="application"
      aria-label={t('editor.title')}
    >
      <a href="#main-editor" className="skip-link sr-only-focusable">
        {t('accessibility.skipToContent')}
      </a>

      {!showMobileUI && (
        <header role="banner">
          <EditorToolbar onOpenSettings={() => setShowSettings(true)} />
        </header>
      )}

      {showMobileUI && !focusMode && (
        <MobileTopBar
          activeFile={activeFile}
          onOpenSettings={() => setShowSettings(true)}
          onOpenCommandPalette={() => setShowCommandPalette(true)}
          onEnterFocusMode={() => setFocusMode(true)}
        />
      )}

      {showMobileUI && !focusMode && (
        <MobileTabsBar
          files={files}
          activeFileId={activeFile?.id}
          onTabPress={(id) => useFileStore.getState().setActiveFileId(id)}
          onTabLongPress={handleTabLongPress}
        />
      )}

      {!showMobileUI && <FileTabs onTabContextMenu={handleTabLongPress} />}
      {!showMobileUI && rulerVisible && <IndentRuler />}

      <main
        id="main-editor"
        className={`flex-1 overflow-hidden relative min-h-0 min-w-0 ${showMobileUI && focusMode ? 'mochi-editor-fullscreen' : ''}`}
        onClick={handleEditorAreaClick}
        role="region"
        aria-label={t('accessibility.mainEditor')}
        {...(showMobileUI && files.length > 1 ? swipeHandlers : {})}
      >
        <SplitPane node={root} onRatioChange={setRatio} />
      </main>

      {showMobileUI && focusMode && (
        <MobileFocusModeIndicator isDirty={activeFile?.isDirty} statusInfo={statusInfo} />
      )}

      {showMobileUI && !isKeyboardVisible && (
        <MobileQuickActions
          visible={showQuickActions}
          onNewFile={handleNewFile}
          onOpen={handleOpen}
          onSave={handleSave}
          onSearch={() => setSearchOpen(true)}
          onUndo={handleUndo}
        />
      )}

      {showMobileUI && !focusMode && !isKeyboardVisible && (
        <MobileStatusBar
          statusInfo={statusInfo}
          showQuickActions={showQuickActions}
          resolvedTheme={resolvedTheme}
          mounted={mounted}
          onToggleQuickActions={toggleQuickActions}
          onToggleTheme={toggleTheme}
        />
      )}

      {showMobileUI && focusMode && !isKeyboardVisible && (
        <MobileFocusExitButton onExit={() => setFocusMode(false)} />
      )}

      <EditorStatusBar
        activeFile={activeFile}
        statusInfo={statusInfo}
        resolvedTheme={resolvedTheme}
        mounted={mounted}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        onToggleTheme={toggleTheme}
      />

      <CommandPalette
        open={showCommandPalette}
        onOpenChange={setShowCommandPalette}
        commands={commands}
      />
      <SettingsDialog open={showSettings} onOpenChange={setShowSettings} />

      <TabContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        fileId={contextMenu.fileId}
        fileName={contextMenu.fileName}
        onClose={closeContextMenu}
        onCloseTab={handleCloseTab}
        onCloseLeftTabs={handleCloseLeftTabs}
        onCloseRightTabs={handleCloseRightTabs}
        onCloseOtherTabs={handleCloseOtherTabs}
        onCloseAllTabs={handleCloseAllTabs}
        onDuplicate={handleDuplicateTab}
        onRename={handleRenameTab}
        canCloseLeftTabs={tabCapabilities.canCloseLeftTabs}
        canCloseRightTabs={tabCapabilities.canCloseRightTabs}
        canCloseOtherTabs={tabCapabilities.canCloseOtherTabs}
        canCloseAllTabs={tabCapabilities.canCloseAllTabs}
        closeLeftCount={tabCapabilities.closeLeftCount}
        closeRightCount={tabCapabilities.closeRightCount}
        closeOtherCount={tabCapabilities.closeOtherCount}
        closeAllCount={tabCapabilities.closeAllCount}
      />
    </div>
  );
});
