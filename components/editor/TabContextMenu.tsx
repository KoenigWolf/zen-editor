'use client';

import { memo, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Copy, Pencil, XCircle, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useGlobalKeydown } from '@/hooks/use-global-keydown';

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
}

const browserDocument = typeof document === 'undefined' ? undefined : document;

export const TabContextMenu = memo(function TabContextMenu({
  isOpen,
  position,
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
}: TabContextMenuProps) {
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  // 外側クリックで閉じる
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

  // ESCキーで閉じる
  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  useGlobalKeydown({ enabled: isOpen, target: browserDocument, handler: handleEscape });

  const menuItems = [
    { icon: X, label: t('tabMenu.close'), action: onCloseTab },
    {
      icon: ChevronsLeft,
      label: t('tabMenu.closeLeft'),
      action: onCloseLeftTabs,
      disabled: !canCloseLeftTabs,
    },
    {
      icon: ChevronsRight,
      label: t('tabMenu.closeRight'),
      action: onCloseRightTabs,
      disabled: !canCloseRightTabs,
    },
    {
      icon: XCircle,
      label: t('tabMenu.closeOthers'),
      action: onCloseOtherTabs,
      disabled: !canCloseOtherTabs,
    },
    {
      icon: XCircle,
      label: t('tabMenu.closeAll'),
      action: onCloseAllTabs,
      disabled: !canCloseAllTabs,
    },
    { type: 'divider' as const },
    { icon: Copy, label: t('tabMenu.duplicate'), action: onDuplicate },
    { icon: Pencil, label: t('tabMenu.rename'), action: onRename },
  ];

  const enabledItemIndexes = menuItems
    .map((item, index) => (!item.disabled ? index : -1))
    .filter((index) => index >= 0);

  const focusItemByIndex = useCallback(
    (index: number) => {
      const target = itemRefs.current[index];
      if (target) target.focus();
    },
    [itemRefs]
  );

  useEffect(() => {
    if (!isOpen) return;
    const firstEnabledIndex = enabledItemIndexes[0];
    if (firstEnabledIndex !== undefined) {
      focusItemByIndex(firstEnabledIndex);
    }
  }, [isOpen, enabledItemIndexes, focusItemByIndex]);

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

  const adjustedPosition = {
    x: Math.min(position.x, window.innerWidth - 200),
    y: Math.min(position.y, window.innerHeight - 250),
  };

  return (
    <>
      {/* バックドロップ */}
      <div className="fixed inset-0 z-[70]" aria-hidden="true" />

      {/* メニュー */}
      <div
        ref={menuRef}
        className="mochi-context-menu"
        style={{
          left: adjustedPosition.x,
          top: adjustedPosition.y,
        }}
        role="menu"
        onKeyDown={handleMenuKeyDown}
        aria-label={t('tabMenu.close')}
      >
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
              className="mochi-mobile-menu-item w-full text-left disabled:opacity-40 disabled:pointer-events-none"
              onClick={() => {
                if (item.disabled) return;
                item.action();
                onClose();
              }}
            >
              {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
              <span className="text-sm">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
});
