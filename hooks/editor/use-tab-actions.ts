'use client';

import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileStore } from '@/lib/store/file-store';
import { getEventCoordinates } from '@/lib/utils';

interface ContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  fileId: string;
  fileName: string;
}

export const useTabActions = () => {
  const { t } = useTranslation();
  const files = useFileStore((state) => state.files);
  const activeFileId = useFileStore((state) => state.activeFileId);

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    fileId: '',
    fileName: '',
  });

  const handleTabLongPress = useCallback(
    (fileId: string, fileName: string, event: React.TouchEvent | React.MouseEvent) => {
      const { x, y } = getEventCoordinates(event);
      setContextMenu({ isOpen: true, position: { x, y }, fileId, fileName });
    },
    []
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleCloseTab = useCallback(() => {
    if (contextMenu.fileId) {
      useFileStore.getState().removeFile(contextMenu.fileId);
    }
  }, [contextMenu.fileId]);

  const handleCloseLeftTabs = useCallback(() => {
    const store = useFileStore.getState();
    const targetIndex = store.files.findIndex((file) => file.id === contextMenu.fileId);
    if (targetIndex <= 0) return;

    store.files.slice(0, targetIndex).forEach((file) => {
      store.removeFile(file.id);
    });
  }, [contextMenu.fileId]);

  const handleCloseRightTabs = useCallback(() => {
    const store = useFileStore.getState();
    const targetIndex = store.files.findIndex((file) => file.id === contextMenu.fileId);
    if (targetIndex < 0 || targetIndex >= store.files.length - 1) return;

    store.files.slice(targetIndex + 1).forEach((file) => {
      store.removeFile(file.id);
    });
  }, [contextMenu.fileId]);

  const handleCloseOtherTabs = useCallback(() => {
    const store = useFileStore.getState();
    store.files.forEach((file) => {
      if (file.id !== contextMenu.fileId) {
        store.removeFile(file.id);
      }
    });
  }, [contextMenu.fileId]);

  const handleCloseAllTabs = useCallback(() => {
    const store = useFileStore.getState();
    store.files.forEach((file) => {
      store.removeFile(file.id);
    });
  }, []);

  const handleDuplicateTab = useCallback(() => {
    if (contextMenu.fileId) {
      const store = useFileStore.getState();
      const file = store.files.find((f) => f.id === contextMenu.fileId);
      if (file) {
        store.addFile({
          name: `${file.name} ${t('common.copySuffix')}`,
          content: file.content,
          path: '',
          lastModified: Date.now(),
        });
      }
    }
  }, [contextMenu.fileId, t]);

  const handleRenameTab = useCallback(() => {
    if (contextMenu.fileId) {
      const newName = prompt(t('tabMenu.rename'), contextMenu.fileName);
      if (newName && newName.trim()) {
        useFileStore.getState().renameFile(contextMenu.fileId, newName.trim());
      }
    }
  }, [contextMenu.fileId, contextMenu.fileName, t]);

  const switchToNextFile = useCallback(() => {
    const currentIndex = files.findIndex((f) => f.id === activeFileId);
    if (currentIndex < files.length - 1) {
      useFileStore.getState().setActiveFileId(files[currentIndex + 1].id);
    }
  }, [files, activeFileId]);

  const switchToPrevFile = useCallback(() => {
    const currentIndex = files.findIndex((f) => f.id === activeFileId);
    if (currentIndex > 0) {
      useFileStore.getState().setActiveFileId(files[currentIndex - 1].id);
    }
  }, [files, activeFileId]);

  const tabCapabilities = useMemo(() => {
    const targetIndex = files.findIndex((file) => file.id === contextMenu.fileId);
    const canLeft = targetIndex > 0;
    const canRight = targetIndex >= 0 && targetIndex < files.length - 1;
    const canOther = files.length > 1 && targetIndex >= 0;
    const canAll = files.length > 0;

    return {
      canCloseLeftTabs: canLeft,
      canCloseRightTabs: canRight,
      canCloseOtherTabs: canOther,
      canCloseAllTabs: canAll,
      closeLeftCount: canLeft ? targetIndex : 0,
      closeRightCount: canRight && targetIndex >= 0 ? files.length - targetIndex - 1 : 0,
      closeOtherCount: canOther ? files.length - 1 : 0,
      closeAllCount: files.length,
    };
  }, [files, contextMenu.fileId]);

  return {
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
  };
};
