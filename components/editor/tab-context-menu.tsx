'use client';

import { memo, useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Copy, Pencil, XCircle, ChevronsLeft, ChevronsRight, Trash2 } from 'lucide-react';
import { useGlobalKeydown } from '@/hooks/core/use-global-keydown';
import { constrainToViewport, browserDocument } from '@/lib/utils';

interface TabContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  fileId: string;
  fileName: string;
  onClose: () => void;
  onCloseTab: () => void;
  onCloseLeftTabs: () => void;
  onCloseRightTabs: () => void;
  onCloseOtherTabs: () => void;
  onCloseAllTabs: () => void;
  onDuplicate: () => void;
  onRename: () => void;
  canCloseLeftTabs: boolean;
  canCloseRightTabs: boolean;
  canCloseOtherTabs: boolean;
  canCloseAllTabs: boolean;
  closeLeftCount: number;
  closeRightCount: number;
  closeOtherCount: number;
  closeAllCount: number;
}

export const TabContextMenu = memo(function TabContextMenu({
  isOpen,
  position,
  fileName,
  onClose,
  onCloseTab,
  onCloseLeftTabs,
  onCloseRightTabs,
  onCloseOtherTabs,
  onCloseAllTabs,
  onDuplicate,
  onRename,
  canCloseLeftTabs,
  canCloseRightTabs,
  canCloseOtherTabs,
  canCloseAllTabs,
  closeLeftCount,
  closeRightCount,
  closeOtherCount,
  closeAllCount,
}: TabContextMenuProps) {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const [menuPosition, setMenuPosition] = useState(position);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    // 少し遅延させてからリスナーを追加（長押し完了直後のtouchendを無視するため）
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useGlobalKeydown({ enabled: isOpen, target: browserDocument, handler: handleEscape });

  const menuItems = useMemo(
    () => [
      {
        icon: X,
        label: t('tabMenu.close'),
        action: onCloseTab,
        shortcut: 'Cmd+W',
        kind: 'destructive' as const,
      },
      {
        icon: ChevronsLeft,
        label: t('tabMenu.closeLeftWithCount', { count: closeLeftCount }),
        action: onCloseLeftTabs,
        disabled: !canCloseLeftTabs,
        kind: 'destructive' as const,
      },
      {
        icon: ChevronsRight,
        label: t('tabMenu.closeRightWithCount', { count: closeRightCount }),
        action: onCloseRightTabs,
        disabled: !canCloseRightTabs,
        kind: 'destructive' as const,
      },
      {
        icon: XCircle,
        label: t('tabMenu.closeOthersWithCount', { count: closeOtherCount }),
        action: onCloseOtherTabs,
        disabled: !canCloseOtherTabs,
        kind: 'destructive' as const,
      },
      {
        icon: Trash2,
        label: t('tabMenu.closeAllWithCount', { count: closeAllCount }),
        action: onCloseAllTabs,
        disabled: !canCloseAllTabs,
        kind: 'destructive' as const,
      },
      { type: 'divider' as const },
      { icon: Copy, label: t('tabMenu.duplicate'), action: onDuplicate, shortcut: 'Alt+Drag' },
      { icon: Pencil, label: t('tabMenu.rename'), action: onRename, shortcut: 'F2' },
    ],
    [
      t,
      onCloseTab,
      closeLeftCount,
      onCloseLeftTabs,
      canCloseLeftTabs,
      closeRightCount,
      onCloseRightTabs,
      canCloseRightTabs,
      closeOtherCount,
      onCloseOtherTabs,
      canCloseOtherTabs,
      closeAllCount,
      onCloseAllTabs,
      canCloseAllTabs,
      onDuplicate,
      onRename,
    ]
  );

  const enabledItemIndexes = useMemo(
    () =>
      menuItems.map((item, index) => (!item.disabled ? index : -1)).filter((index) => index >= 0),
    [menuItems]
  );

  const focusItemByIndex = useCallback((index: number) => {
    const target = itemRefs.current[index];
    if (target) target.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const firstEnabledIndex = enabledItemIndexes[0];
    if (firstEnabledIndex !== undefined) {
      focusItemByIndex(firstEnabledIndex);
    }
  }, [isOpen, enabledItemIndexes, focusItemByIndex]);

  useEffect(() => {
    if (!isOpen) return;

    const adjustPosition = () => {
      const menuEl = menuRef.current;
      if (!menuEl || typeof window === 'undefined') return;

      const menuRect = menuEl.getBoundingClientRect();
      setMenuPosition(
        constrainToViewport(
          position,
          { width: menuRect.width, height: menuRect.height },
          { margin: 8 }
        )
      );
    };

    const rafId = requestAnimationFrame(adjustPosition);
    window.addEventListener('resize', adjustPosition);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', adjustPosition);
    };
  }, [isOpen, position]);

  const handleMenuKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (enabledItemIndexes.length === 0) return;

      const activeElement = browserDocument?.activeElement;
      const currentIndex = itemRefs.current.findIndex((item) => item === activeElement);

      if (event.key === 'ArrowDown') {
        event.preventDefault();
        const enabledPosition = enabledItemIndexes.findIndex((index) => index === currentIndex);
        const nextPosition =
          enabledPosition < 0 || enabledPosition === enabledItemIndexes.length - 1
            ? 0
            : enabledPosition + 1;
        focusItemByIndex(enabledItemIndexes[nextPosition]);
      }

      if (event.key === 'ArrowUp') {
        event.preventDefault();
        const enabledPosition = enabledItemIndexes.findIndex((index) => index === currentIndex);
        const prevPosition =
          enabledPosition <= 0 ? enabledItemIndexes.length - 1 : enabledPosition - 1;
        focusItemByIndex(enabledItemIndexes[prevPosition]);
      }

      if (event.key === 'Home') {
        event.preventDefault();
        focusItemByIndex(enabledItemIndexes[0]);
      }

      if (event.key === 'End') {
        event.preventDefault();
        focusItemByIndex(enabledItemIndexes[enabledItemIndexes.length - 1]);
      }
    },
    [enabledItemIndexes, focusItemByIndex]
  );

  if (!isOpen) return null;

  return (
    <>
      {/* バックドロップ */}
      <div className="fixed inset-0 z-[70]" aria-hidden="true" />

      {/* メニュー */}
      <div
        ref={menuRef}
        className="mochi-context-menu"
        style={{
          left: menuPosition.x,
          top: menuPosition.y,
        }}
        role="menu"
        onKeyDown={handleMenuKeyDown}
        aria-label={t('tabMenu.close')}
      >
        <div className="px-3 py-2 border-b border-border/60">
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            {t('tabMenu.target')}
          </div>
          <div className="text-xs font-medium text-foreground truncate" title={fileName}>
            {fileName}
          </div>
        </div>
        {menuItems.map((item, index) => {
          if ('type' in item && item.type === 'divider') {
            return (
              <div
                key={`divider-${index}`}
                className="h-px bg-border/50 my-1 mx-2"
                role="separator"
              />
            );
          }

          const Icon = item.icon;
          const isDestructive = item.kind === 'destructive';
          return (
            <button
              key={item.label}
              ref={(el) => {
                itemRefs.current[index] = el;
              }}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              tabIndex={item.disabled ? -1 : 0}
              aria-disabled={item.disabled}
              className={`mochi-mobile-menu-item w-full text-left disabled:opacity-40 disabled:pointer-events-none ${isDestructive ? 'text-red-600 dark:text-red-400' : ''}`}
              onClick={() => {
                item.action();
                onClose();
              }}
            >
              {Icon && (
                <Icon
                  className={`h-icon-md w-icon-md ${isDestructive ? 'text-red-500 dark:text-red-400' : 'text-muted-foreground'}`}
                />
              )}
              <span className="text-sm flex-1">{item.label}</span>
              {'shortcut' in item && item.shortcut && (
                <span className="text-xs text-muted-foreground ml-2">{item.shortcut}</span>
              )}
            </button>
          );
        })}
      </div>
    </>
  );
});
