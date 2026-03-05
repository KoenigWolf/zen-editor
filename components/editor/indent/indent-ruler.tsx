'use client';

import { useCallback, useRef, useState, useEffect, memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useIndentStore } from '@/lib/store/indent-store';
import { useEditorStore } from '@/lib/store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn, clamp } from '@/lib/utils';
import { useMouseDrag } from '@/hooks/ui/use-mouse-drag';
import { IndentHandle } from './indent-handle';
import { CM_TO_PX, RULER_HEIGHT, HANDLE_SIZE, type DragType, type IndentRulerProps } from './types';

export const IndentRuler = memo(({ className }: IndentRulerProps) => {
  const { t } = useTranslation();
  const rulerRef = useRef<HTMLDivElement>(null);
  const [dragOffset, setDragOffset] = useState(0);

  const settings = useIndentStore((state) => state.settings);
  const rulerVisible = useIndentStore((state) => state.rulerVisible);
  const rulerWidth = useIndentStore((state) => state.rulerWidth);
  const updateSettings = useIndentStore((state) => state.updateSettings);
  const setRulerWidth = useIndentStore((state) => state.setRulerWidth);
  const addTabStop = useIndentStore((state) => state.addTabStop);
  const removeTabStop = useIndentStore((state) => state.removeTabStop);
  const clearTabStops = useIndentStore((state) => state.clearTabStops);
  const resetSettings = useIndentStore((state) => state.resetSettings);

  const editorSettings = useEditorStore((state) => state.settings);

  const lineNumberWidth = editorSettings.showLineNumbers ? 50 : 0;

  useEffect(() => {
    const updateWidth = () => {
      if (rulerRef.current) {
        setRulerWidth(rulerRef.current.clientWidth - lineNumberWidth);
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [setRulerWidth, lineNumberWidth]);

  const cmToPixels = useCallback((cm: number) => cm * CM_TO_PX, []);
  const pixelsToCm = useCallback((px: number) => px / CM_TO_PX, []);

  const snapToGrid = useCallback((cm: number, gridSize: number = 0.127) => {
    return Math.round(cm / gridSize) * gridSize;
  }, []);

  const { isDragging, startDrag } = useMouseDrag<{
    type: DragType;
    tabIndex?: number;
  }>({
    onMove: (e, context) => {
      if (!rulerRef.current) return;

      const rulerRect = rulerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rulerRect.left - lineNumberWidth;
      const maxWidth = rulerWidth;

      let newCm = snapToGrid(pixelsToCm(mouseX));
      newCm = clamp(newCm, 0, pixelsToCm(maxWidth));

      switch (context.type) {
        case 'firstLine':
          updateSettings({ firstLineIndent: newCm - settings.leftMargin });
          break;
        case 'hanging':
          updateSettings({ hangingIndent: newCm - settings.leftMargin });
          break;
        case 'leftMargin':
          updateSettings({
            leftMargin: newCm,
            firstLineIndent: settings.firstLineIndent,
            hangingIndent: settings.hangingIndent,
          });
          break;
        case 'rightMargin':
          const rightCm = pixelsToCm(maxWidth) - newCm;
          updateSettings({ rightMargin: Math.max(0, snapToGrid(rightCm)) });
          break;
        case 'tabStop':
          if (context.tabIndex !== undefined && context.tabIndex >= 0) {
            const newTabStops = [...settings.tabStops];
            newTabStops[context.tabIndex] = newCm;
            newTabStops.sort((a, b) => a - b);
            updateSettings({ tabStops: newTabStops });
          }
          break;
      }
    },
    onEnd: () => {
      setDragOffset(0);
    },
  });

  const handleMouseDown = useCallback(
    (type: DragType, e: React.MouseEvent, tabIndex?: number) => {
      e.preventDefault();
      e.stopPropagation();

      const rulerRect = rulerRef.current?.getBoundingClientRect();
      if (rulerRect) {
        const clickX = e.clientX - rulerRect.left - lineNumberWidth;
        setDragOffset(clickX);
      }

      startDrag(e, { type, tabIndex });
    },
    [lineNumberWidth, startDrag]
  );

  const handleRulerClick = useCallback(
    (e: React.MouseEvent) => {
      if (isDragging) return;

      const rulerRect = rulerRef.current?.getBoundingClientRect();
      if (!rulerRect) return;

      const clickX = e.clientX - rulerRect.left - lineNumberWidth;
      const clickY = e.clientY - rulerRect.top;

      if (clickY > RULER_HEIGHT - 10) {
        const cmPosition = snapToGrid(pixelsToCm(clickX));
        if (!settings.tabStops.includes(cmPosition)) {
          addTabStop(cmPosition);
        }
      }
    },
    [isDragging, lineNumberWidth, settings.tabStops, addTabStop, pixelsToCm, snapToGrid]
  );

  const handleRemoveTabStop = useCallback(
    (position: number) => {
      removeTabStop(position);
    },
    [removeTabStop]
  );

  const STEP_SIZE = 0.127;
  const maxCm = pixelsToCm(rulerWidth);

  const handleKeyDown = useCallback(
    (type: DragType, e: React.KeyboardEvent, tabIndex?: number) => {
      const step = e.shiftKey ? STEP_SIZE * 5 : STEP_SIZE;
      let delta = 0;

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          delta = -step;
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          delta = step;
          break;
        case 'Home':
          delta = -Infinity;
          break;
        case 'End':
          delta = Infinity;
          break;
        default:
          return;
      }

      e.preventDefault();

      switch (type) {
        case 'firstLine': {
          const newValue =
            delta === -Infinity
              ? -settings.leftMargin
              : delta === Infinity
                ? maxCm - settings.leftMargin
                : snapToGrid(settings.firstLineIndent + delta);
          updateSettings({
            firstLineIndent: clamp(newValue, -settings.leftMargin, maxCm - settings.leftMargin),
          });
          break;
        }
        case 'hanging': {
          const newValue =
            delta === -Infinity
              ? -settings.leftMargin
              : delta === Infinity
                ? maxCm - settings.leftMargin
                : snapToGrid(settings.hangingIndent + delta);
          updateSettings({
            hangingIndent: clamp(newValue, -settings.leftMargin, maxCm - settings.leftMargin),
          });
          break;
        }
        case 'leftMargin': {
          const newValue =
            delta === -Infinity
              ? 0
              : delta === Infinity
                ? maxCm
                : snapToGrid(settings.leftMargin + delta);
          updateSettings({ leftMargin: clamp(newValue, 0, maxCm) });
          break;
        }
        case 'rightMargin': {
          const newValue =
            delta === -Infinity
              ? 0
              : delta === Infinity
                ? maxCm
                : snapToGrid(settings.rightMargin - delta);
          updateSettings({ rightMargin: clamp(newValue, 0, maxCm) });
          break;
        }
        case 'tabStop': {
          if (tabIndex !== undefined && tabIndex >= 0) {
            const currentValue = settings.tabStops[tabIndex];
            const newValue =
              delta === -Infinity
                ? 0
                : delta === Infinity
                  ? maxCm
                  : snapToGrid(currentValue + delta);
            const newTabStops = [...settings.tabStops];
            newTabStops[tabIndex] = clamp(newValue, 0, maxCm);
            newTabStops.sort((a, b) => a - b);
            updateSettings({ tabStops: newTabStops });
          }
          break;
        }
      }
    },
    [settings, maxCm, updateSettings, snapToGrid]
  );

  const tickData = useMemo(() => {
    const data: Array<{ px: number; type: 'major' | 'half' | 'minor'; label?: number }> = [];
    const maxCm = rulerWidth / CM_TO_PX;
    const TICK_INTERVAL = 0.127;

    for (let cm = 0; cm <= maxCm; cm += TICK_INTERVAL) {
      const px = cm * CM_TO_PX + lineNumberWidth;
      const roundedCm = Math.round(cm);
      const diff = Math.abs(cm - roundedCm);

      if (diff < 0.01) {
        data.push({ px, type: 'major', label: roundedCm });
      } else if (Math.abs(diff - 0.5) < 0.01) {
        data.push({ px, type: 'half' });
      } else if (Math.round(cm / TICK_INTERVAL) % 2 === 0) {
        data.push({ px, type: 'minor' });
      }
    }
    return data;
  }, [rulerWidth, lineNumberWidth]);

  const renderedTicks = useMemo(
    () =>
      tickData.map((tick, i) => {
        if (tick.type === 'major') {
          return (
            <div
              key={i}
              className="indent-ruler-tick indent-ruler-tick-major"
              style={{ left: tick.px }}
            >
              <span className="indent-ruler-tick-label">{tick.label}</span>
            </div>
          );
        }
        return (
          <div
            key={i}
            className={`indent-ruler-tick indent-ruler-tick-${tick.type}`}
            style={{ left: tick.px }}
          />
        );
      }),
    [tickData]
  );

  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  }, []);

  if (!rulerVisible) return null;

  const leftMarginPx = cmToPixels(settings.leftMargin) + lineNumberWidth;
  const firstLineIndentPx =
    cmToPixels(settings.leftMargin + settings.firstLineIndent) + lineNumberWidth;
  const hangingIndentPx =
    cmToPixels(settings.leftMargin + settings.hangingIndent) + lineNumberWidth;
  const rightMarginPx = cmToPixels(settings.rightMargin);

  return (
    <>
      <div
        ref={rulerRef}
        className={cn('indent-ruler', isDragging && 'indent-ruler-dragging', className)}
        onClick={handleRulerClick}
        onContextMenu={handleContextMenu}
        role="toolbar"
        aria-label={t('indent.ruler')}
      >
        <div className="indent-ruler-margin-area" style={{ width: lineNumberWidth }} />

        <div className="indent-ruler-content">
          {renderedTicks}

          <div
            className="indent-ruler-text-area"
            style={{
              left: leftMarginPx,
              right: rightMarginPx,
            }}
          />

          <IndentHandle
            variant="firstLine"
            position={firstLineIndentPx - HANDLE_SIZE / 2}
            onDragStart={(e) => handleMouseDown('firstLine', e)}
            onKeyDown={(e) => handleKeyDown('firstLine', e)}
            label={t('indent.firstLineIndent')}
            value={Math.round(settings.firstLineIndent * 10)}
          />

          <IndentHandle
            variant="hanging"
            position={hangingIndentPx - HANDLE_SIZE / 2}
            onDragStart={(e) => handleMouseDown('hanging', e)}
            onKeyDown={(e) => handleKeyDown('hanging', e)}
            label={t('indent.hangingIndent')}
            value={Math.round(settings.hangingIndent * 10)}
          />

          <IndentHandle
            variant="leftMargin"
            position={leftMarginPx - HANDLE_SIZE / 2}
            onDragStart={(e) => handleMouseDown('leftMargin', e)}
            onKeyDown={(e) => handleKeyDown('leftMargin', e)}
            label={t('indent.leftMargin')}
            value={Math.round(settings.leftMargin * 10)}
          />

          <IndentHandle
            variant="rightMargin"
            position={rightMarginPx - HANDLE_SIZE / 2}
            onDragStart={(e) => handleMouseDown('rightMargin', e)}
            onKeyDown={(e) => handleKeyDown('rightMargin', e)}
            label={t('indent.rightMargin')}
            value={Math.round(settings.rightMargin * 10)}
          />

          {settings.tabStops.map((tabStop, index) => (
            <IndentHandle
              key={`tab-${index}`}
              variant="tabStop"
              position={cmToPixels(tabStop) + lineNumberWidth - 3}
              onDragStart={(e) => handleMouseDown('tabStop', e, index)}
              onKeyDown={(e) => handleKeyDown('tabStop', e, index)}
              onRemove={() => handleRemoveTabStop(tabStop)}
              label={`${t('indent.tabStop')}: ${tabStop.toFixed(2)}cm`}
              value={Math.round(tabStop * 10)}
            />
          ))}
        </div>

        {isDragging && (
          <div className="indent-ruler-drag-guide" style={{ left: dragOffset + lineNumberWidth }} />
        )}
      </div>

      <DropdownMenu open={contextMenuOpen} onOpenChange={setContextMenuOpen}>
        <DropdownMenuTrigger asChild>
          <div
            style={{
              position: 'fixed',
              left: contextMenuPosition.x,
              top: contextMenuPosition.y,
              width: 1,
              height: 1,
              pointerEvents: 'none',
            }}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onClick={() => {
              clearTabStops();
              setContextMenuOpen(false);
            }}
          >
            {t('indent.clearTabStops')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              resetSettings();
              setContextMenuOpen(false);
            }}
          >
            {t('indent.resetIndent')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
});

IndentRuler.displayName = 'IndentRuler';
