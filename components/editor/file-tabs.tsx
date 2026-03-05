'use client';

import { memo, useCallback, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useFileStore, type FileData } from '@/lib/store/file-store';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getFileIcon, getFileColor } from '@/lib/utils';

interface FileTabItemProps {
  file: FileData;
  isActive: boolean;
  isDragging: boolean;
  isDragOver: boolean;
  onSelect: (e: React.MouseEvent) => void;
  onAuxClick: (e: React.MouseEvent) => void;
  onContextMenu: (e: React.MouseEvent) => void;
  onClose: (e: React.MouseEvent | React.KeyboardEvent) => void;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  closeLabel: string;
}

const FileTabItem = memo(function FileTabItem({
  file,
  isActive,
  isDragging,
  isDragOver,
  onSelect,
  onAuxClick,
  onContextMenu,
  onClose,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  closeLabel,
}: FileTabItemProps) {
  const FileIcon = useMemo(() => getFileIcon(file.name), [file.name]);
  const fileColor = useMemo(() => getFileColor(file.name), [file.name]);

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isActive}
      draggable
      data-file-id={file.id}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onClick={onSelect}
      onAuxClick={onAuxClick}
      onContextMenu={onContextMenu}
      className={cn(
        'mochi-tab group',
        isActive && 'mochi-tab-active',
        file.isDirty && !isActive && 'mochi-tab-dirty',
        isDragging && 'opacity-50 scale-95',
        isDragOver && 'border-primary border-dashed bg-primary/10'
      )}
    >
      <FileIcon
        className={cn(
          'h-icon-xs w-icon-xs flex-shrink-0',
          isActive ? fileColor : 'text-muted-foreground'
        )}
      />
      <span className="truncate max-w-[150px] text-left text-xs font-medium">{file.name}</span>
      {file.isDirty && isActive && (
        <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
      )}
      <span
        role="button"
        tabIndex={0}
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Enter' && onClose(e)}
        className="mochi-tab-close"
        aria-label={closeLabel}
      >
        <X className="h-icon-xs w-icon-xs" />
      </span>
    </button>
  );
});

interface FileTabsProps {
  onTabContextMenu?: (fileId: string, fileName: string, event: React.MouseEvent) => void;
}

export const FileTabs = memo(function FileTabs({ onTabContextMenu }: FileTabsProps) {
  const { t } = useTranslation();
  const files = useFileStore((state) => state.files);
  const activeFileId = useFileStore((state) => state.activeFileId);
  const setActiveFileId = useFileStore((state) => state.setActiveFileId);
  const removeFile = useFileStore((state) => state.removeFile);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const getFileIdFromEvent = useCallback((e: React.SyntheticEvent): string | null => {
    const target = e.currentTarget as HTMLElement;
    return target.dataset.fileId || null;
  }, []);

  const handleSelect = useCallback(
    (e: React.MouseEvent) => {
      const fileId = getFileIdFromEvent(e);
      if (fileId) setActiveFileId(fileId);
    },
    [setActiveFileId, getFileIdFromEvent]
  );

  const handleClose = useCallback(
    (e: React.MouseEvent | React.KeyboardEvent) => {
      e.stopPropagation();
      const target = (e.target as HTMLElement).closest('[data-file-id]') as HTMLElement | null;
      const fileId = target?.dataset.fileId;
      if (fileId) removeFile(fileId);
    },
    [removeFile]
  );

  const handleAuxClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 1) return;
      e.preventDefault();
      const fileId = getFileIdFromEvent(e);
      if (fileId) {
        removeFile(fileId);
      }
    },
    [getFileIdFromEvent, removeFile]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const fileId = getFileIdFromEvent(e);
      if (!fileId || !onTabContextMenu) return;
      const file = useFileStore.getState().files.find((target) => target.id === fileId);
      if (!file) return;
      onTabContextMenu(fileId, file.name, e);
    },
    [getFileIdFromEvent, onTabContextMenu]
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent) => {
      const fileId = getFileIdFromEvent(e);
      if (fileId) {
        setDraggedId(fileId);
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', fileId);
      }
    },
    [getFileIdFromEvent]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const fileId = getFileIdFromEvent(e);
      if (draggedId && fileId && draggedId !== fileId) {
        setDragOverId(fileId);
      }
    },
    [draggedId, getFileIdFromEvent]
  );

  const handleDragLeave = useCallback(() => {
    setDragOverId(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const targetFileId = getFileIdFromEvent(e);
      setDragOverId(null);
      setDraggedId(null);

      if (!draggedId || !targetFileId || draggedId === targetFileId) return;

      const { files: currentFiles } = useFileStore.getState();
      const draggedIndex = currentFiles.findIndex((f) => f.id === draggedId);
      const targetIndex = currentFiles.findIndex((f) => f.id === targetFileId);

      if (draggedIndex === -1 || targetIndex === -1) return;

      const newFiles = [...currentFiles];
      const [removed] = newFiles.splice(draggedIndex, 1);
      newFiles.splice(targetIndex, 0, removed);

      useFileStore.setState({ files: newFiles });
    },
    [draggedId, getFileIdFromEvent]
  );

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  if (files.length === 0) {
    return null;
  }

  const closeLabel = t('common.close');

  return (
    <div className="mochi-tabs-container w-full max-w-full overflow-hidden mochi-fast-scroll">
      <div
        role="tablist"
        aria-label={t('fileTree.title')}
        className="flex items-end gap-0.5 px-1.5 pt-1 overflow-x-auto scrollbar-thin"
      >
        {files.map((file) => (
          <FileTabItem
            key={file.id}
            file={file}
            isActive={file.id === activeFileId}
            isDragging={draggedId === file.id}
            isDragOver={dragOverId === file.id}
            onSelect={handleSelect}
            onAuxClick={handleAuxClick}
            onContextMenu={handleContextMenu}
            onClose={handleClose}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onDragEnd={handleDragEnd}
            closeLabel={closeLabel}
          />
        ))}
      </div>
    </div>
  );
});
