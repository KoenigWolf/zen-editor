'use client';

import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import { Sparkles, Code2, WrapText, FileText, Moon, Sun } from 'lucide-react';
import { getDisplayFileName } from '@/lib/utils';

interface EditorStatusBarProps {
  activeFile?: { name?: string; isDirty?: boolean };
  statusInfo: {
    cursorLine: number;
    cursorColumn: number;
    language: string;
    eol: string;
    lineCount: number;
  };
  resolvedTheme?: string;
  mounted: boolean;
  onOpenCommandPalette: () => void;
  onToggleTheme: () => void;
}

export const EditorStatusBar = memo(function EditorStatusBar({
  activeFile,
  statusInfo,
  resolvedTheme,
  mounted,
  onOpenCommandPalette,
  onToggleTheme,
}: EditorStatusBarProps) {
  const { t } = useTranslation();

  return (
    <div className="mochi-statusbar-modern flex-shrink-0 overflow-x-auto overflow-y-hidden safe-area-bottom hidden sm:flex">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={onOpenCommandPalette}
          className="mochi-statusbar-item mochi-statusbar-item-clickable gap-1.5"
          title={`${t('commandPalette.actions.openSettings')} (⌘P)`}
          aria-label={t('accessibility.openCommandPalette')}
        >
          <Sparkles className="h-icon-xs w-icon-xs" strokeWidth={1.5} />
          <span className="truncate max-w-[180px] flex items-center gap-1.5 text-xs">
            {activeFile?.isDirty && (
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            )}
            {getDisplayFileName(activeFile?.name, t('status.untitled'))}
          </span>
        </button>

        <div className="h-3 w-px bg-border/30 mx-1" />

        <div className="mochi-statusbar-item gap-1">
          <Code2 className="h-icon-xs w-icon-xs text-muted-foreground" strokeWidth={1.5} />
          <span className="mochi-statusbar-badge">{statusInfo.language}</span>
        </div>

        <div className="mochi-statusbar-item gap-1">
          <WrapText className="h-icon-xs w-icon-xs text-muted-foreground" strokeWidth={1.5} />
          <span className="text-xs">{statusInfo.eol}</span>
        </div>

        <div className="mochi-statusbar-item">
          <span className="text-muted-foreground text-xs">{t('status.encoding')}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <div className="mochi-statusbar-item gap-0.5 text-xs font-mono">
          <span className="text-foreground">{statusInfo.cursorLine}</span>
          <span className="text-muted-foreground">:</span>
          <span className="text-foreground">{statusInfo.cursorColumn}</span>
        </div>

        <div className="h-3 w-px bg-border/30 mx-1" />

        <div className="mochi-statusbar-item gap-1">
          <FileText className="h-icon-xs w-icon-xs text-muted-foreground" strokeWidth={1.5} />
          <span className="text-xs">{statusInfo.lineCount}</span>
        </div>

        <div className="h-3 w-px bg-border/30 mx-1" />

        <button
          type="button"
          onClick={onToggleTheme}
          className="mochi-statusbar-item mochi-statusbar-item-clickable gap-1"
          aria-label={t('accessibility.toggleTheme')}
        >
          {mounted && (
            <>
              {resolvedTheme === 'dark' ? (
                <Moon className="h-icon-xs w-icon-xs" strokeWidth={1.5} aria-hidden="true" />
              ) : (
                <Sun className="h-icon-xs w-icon-xs" strokeWidth={1.5} aria-hidden="true" />
              )}
            </>
          )}
        </button>
      </div>
    </div>
  );
});
