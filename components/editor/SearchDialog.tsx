'use client';

import { useCallback, useEffect, useRef, useState, memo } from 'react';
import { useMobileDetection } from '@/hooks/use-mobile-detection';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useSearchStore, type SearchMatch } from '@/lib/store/search-store';
import { cn } from '@/lib/utils';
import { safeLocalStorageGet, safeLocalStorageSet } from '@/lib/storage-utils';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { useSearchLogic, type SearchOptions } from '@/hooks/use-search-logic';
import { useDialogDrag } from '@/hooks/use-dialog-drag';
import { useGlobalKeydown } from '@/hooks/use-global-keydown';
import {
  X,
  ChevronDown,
  ChevronUp,
  Regex,
  CaseSensitive,
  WholeWord,
  Search,
  ChevronRight,
} from 'lucide-react';

const browserDocument = typeof document === 'undefined' ? undefined : document;
const SEARCH_HISTORY_KEY = 'zen-editor-search-history';
const MAX_SEARCH_HISTORY = 20;

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (query: string, options: SearchOptions) => void;
  onReplace?: (query: string, replacement: string, options: SearchOptions) => void;
}

const SearchResultItem = memo(
  ({
    match,
    isActive,
    onClick,
  }: {
    match: SearchMatch;
    isActive: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      className={cn(
        'w-full text-left text-[13px] px-2.5 py-2 rounded-md transition-all',
        'hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset',
        isActive && 'bg-accent text-accent-foreground'
      )}
      onClick={onClick}
    >
      <span className="font-mono text-muted-foreground mr-2 tabular-nums">L{match.lineNumber}</span>
      <span className="truncate">
        {match.text.substring(0, 60)}
        {match.text.length > 60 ? '…' : ''}
      </span>
    </button>
  )
);
SearchResultItem.displayName = 'SearchResultItem';

const OptionButton = memo(
  ({
    active,
    onClick,
    icon: Icon,
    label,
    shortcut,
  }: {
    active: boolean;
    onClick: () => void;
    icon: React.ElementType;
    label: string;
    shortcut?: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}${shortcut ? ` (${shortcut})` : ''}`}
      aria-pressed={active}
      className={cn(
        'h-8 w-8 rounded-md flex items-center justify-center transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        active
          ? 'bg-primary/15 text-primary shadow-sm'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      <Icon className="h-icon-md w-icon-md" strokeWidth={1.5} />
    </button>
  )
);
OptionButton.displayName = 'OptionButton';

export const SearchDialog = memo(
  ({ open, onOpenChange, onSearch, onReplace }: SearchDialogProps) => {
    const { t } = useTranslation();
    const { searchTerm } = useSearchStore();

    const {
      matches,
      currentMatchIndex,
      isRegex,
      isCaseSensitive,
      isWholeWord,
      setIsRegex,
      setIsCaseSensitive,
      setIsWholeWord,
      performSearch,
      handleNextMatch,
      handlePreviousMatch,
      handleReplace,
      handleReplaceAll,
      goToMatch,
      cleanup,
      resetState,
    } = useSearchLogic(onSearch, onReplace);

    const searchInputRef = useRef<HTMLInputElement>(null);
    const replaceInputRef = useRef<HTMLInputElement>(null);
    const historyDraftRef = useRef('');
    const focusTrapRef = useFocusTrap<HTMLDivElement>({
      enabled: open,
      initialFocusRef: searchInputRef as React.RefObject<HTMLElement>,
    });

    const [query, setQuery] = useState(searchTerm);
    const [replacement, setReplacement] = useState('');
    const [showReplace, setShowReplace] = useState(true);
    const [showResults, setShowResults] = useState(true);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState(false);
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const { isMobile } = useMobileDetection();
    const { isDragging, startDrag } = useDialogDrag({
      enabled: !isMobile,
      position,
      onPositionChange: setPosition,
      clamp: (next) => ({
        x: Math.max(0, Math.min(window.innerWidth - 400, next.x)),
        y: Math.max(0, Math.min(window.innerHeight - 200, next.y)),
      }),
    });

    useEffect(() => {
      if (open) {
        if (isMobile) {
          setPosition({ x: 0, y: 0 });
        } else {
          const x = window.innerWidth - 420;
          setPosition({ x: Math.max(10, x), y: 60 });
        }
        requestAnimationFrame(() => setIsVisible(true));
        setTimeout(() => {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }, 50);
      } else {
        setIsVisible(false);
      }
    }, [open, isMobile]);

    useEffect(() => {
      if (open && searchTerm) {
        if (searchTerm !== query) {
          setQuery(searchTerm);
        }
        performSearch(searchTerm, true);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, searchTerm]);

    const handleQueryChange = useCallback(
      (value: string) => {
        setQuery(value);
        setHistoryIndex(-1);
        performSearch(value);
      },
      [performSearch]
    );

    useEffect(() => {
      const rawHistory = safeLocalStorageGet(SEARCH_HISTORY_KEY);
      if (!rawHistory) return;
      try {
        const parsed = JSON.parse(rawHistory);
        if (Array.isArray(parsed)) {
          setSearchHistory(parsed.filter((item): item is string => typeof item === 'string'));
        }
      } catch {
        setSearchHistory([]);
      }
    }, []);

    const saveQueryToHistory = useCallback((input: string) => {
      const normalized = input.trim();
      if (!normalized) return;

      setSearchHistory((prev) => {
        const next = [normalized, ...prev.filter((item) => item !== normalized)].slice(
          0,
          MAX_SEARCH_HISTORY
        );
        safeLocalStorageSet(SEARCH_HISTORY_KEY, JSON.stringify(next));
        return next;
      });
      setHistoryIndex(-1);
    }, []);

    const navigateSearchHistory = useCallback(
      (direction: 'prev' | 'next') => {
        if (searchHistory.length === 0) return;

        if (direction === 'prev') {
          if (historyIndex === -1) {
            historyDraftRef.current = query;
          }
          const nextIndex = Math.min(historyIndex + 1, searchHistory.length - 1);
          const nextQuery = searchHistory[nextIndex];
          setHistoryIndex(nextIndex);
          setQuery(nextQuery);
          performSearch(nextQuery, true);
          return;
        }

        if (historyIndex <= -1) return;
        const nextIndex = historyIndex - 1;
        if (nextIndex >= 0) {
          const nextQuery = searchHistory[nextIndex];
          setHistoryIndex(nextIndex);
          setQuery(nextQuery);
          performSearch(nextQuery, true);
          return;
        }

        setHistoryIndex(-1);
        setQuery(historyDraftRef.current);
        performSearch(historyDraftRef.current, true);
      },
      [historyIndex, searchHistory, query, performSearch]
    );

    const onNextMatch = useCallback(() => {
      saveQueryToHistory(query);
      handleNextMatch(query);
    }, [saveQueryToHistory, handleNextMatch, query]);
    const onPreviousMatch = useCallback(() => {
      saveQueryToHistory(query);
      handlePreviousMatch(query);
    }, [saveQueryToHistory, handlePreviousMatch, query]);
    const onReplaceClick = useCallback(() => {
      saveQueryToHistory(query);
      handleReplace(query, replacement);
    }, [saveQueryToHistory, handleReplace, query, replacement]);
    const onReplaceAllClick = useCallback(() => {
      saveQueryToHistory(query);
      handleReplaceAll(query, replacement);
    }, [saveQueryToHistory, handleReplaceAll, query, replacement]);
    const canReplace = query.length > 0 && matches.length > 0;
    const canReplaceAll = canReplace;

    const handleKeyDown = useCallback(
      (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          onOpenChange(false);
          return;
        }

        if (
          e.key === 'Enter' &&
          showReplace &&
          browserDocument?.activeElement === replaceInputRef.current
        ) {
          e.preventDefault();
          if (e.metaKey || e.ctrlKey) {
            if (canReplaceAll) onReplaceAllClick();
          } else {
            if (canReplace) onReplaceClick();
          }
          return;
        }

        if (e.key === 'Enter') {
          e.preventDefault();
          if (e.shiftKey) onPreviousMatch();
          else onNextMatch();
          return;
        }

        if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
          e.preventDefault();
          setShowReplace((prev) => !prev);
          return;
        }

        if (e.altKey && e.key === 'ArrowUp') {
          e.preventDefault();
          navigateSearchHistory('prev');
          return;
        }

        if (e.altKey && e.key === 'ArrowDown') {
          e.preventDefault();
          navigateSearchHistory('next');
          return;
        }

        if (e.key === 'F3') {
          e.preventDefault();
          if (e.shiftKey) onPreviousMatch();
          else onNextMatch();
          return;
        }

        if (e.altKey && e.key === 'c') {
          e.preventDefault();
          setIsCaseSensitive(!isCaseSensitive);
          return;
        }

        if (e.altKey && e.key === 'r') {
          e.preventDefault();
          setIsRegex(!isRegex);
          return;
        }

        if (e.altKey && e.key === 'w') {
          e.preventDefault();
          setIsWholeWord(!isWholeWord);
          return;
        }
      },
      [
        onOpenChange,
        showReplace,
        canReplace,
        canReplaceAll,
        onReplaceClick,
        onReplaceAllClick,
        onNextMatch,
        onPreviousMatch,
        isCaseSensitive,
        isRegex,
        isWholeWord,
        setIsCaseSensitive,
        setIsRegex,
        setIsWholeWord,
        navigateSearchHistory,
      ]
    );

    useGlobalKeydown({ enabled: open, handler: handleKeyDown });

    const handleDragStart = useCallback(
      (e: React.MouseEvent) => {
        if (isMobile) return;
        if ((e.target as HTMLElement).closest('input, button')) return;
        startDrag(e);
      },
      [isMobile, startDrag]
    );

    useEffect(() => {
      if (!open) resetState();
    }, [open, resetState]);

    useEffect(() => {
      return () => cleanup();
    }, [cleanup]);

    useEffect(() => {
      if (open && query) {
        performSearch(query, true);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCaseSensitive, isRegex, isWholeWord]);

    if (!open) return null;

    const mobileStyles = isMobile
      ? {
          position: 'fixed' as const,
          bottom: 0,
          left: 0,
          right: 0,
          top: 'auto',
          width: '100%',
          maxWidth: '100%',
          maxHeight: '85vh',
        }
      : { position: 'fixed' as const, left: position.x, top: position.y, width: 420 };

    return (
      <>
        {isMobile && (
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => onOpenChange(false)} />
        )}

        <div
          ref={focusTrapRef}
          role="dialog"
          aria-label={t('search.title')}
          aria-modal="true"
          className={cn(
            'z-50 bg-background border shadow-lg flex flex-col',
            'transition-opacity duration-150',
            isVisible ? 'opacity-100' : 'opacity-0',
            isMobile ? 'rounded-t-xl' : 'rounded-lg',
            !isVisible && isMobile && 'translate-y-full',
            isDragging && 'cursor-grabbing select-none'
          )}
          style={mobileStyles}
        >
          {/* Header */}
          <div
            className={cn(
              'flex items-center justify-between px-3 py-2 border-b bg-muted/30',
              !isMobile && 'cursor-grab rounded-t-lg'
            )}
            onMouseDown={handleDragStart}
          >
            {isMobile && (
              <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-8 h-1 bg-muted-foreground/20 rounded-full" />
            )}

            <div className="flex items-center gap-2">
              <Search className="h-icon-md w-icon-md text-muted-foreground" strokeWidth={1.5} />
              <span className="text-sm font-medium">{t('search.title')}</span>
              {matches.length > 0 && (
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {currentMatchIndex + 1}/{matches.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onPreviousMatch}
                disabled={matches.length === 0}
                className={cn(
                  'h-8 w-8 rounded-md flex items-center justify-center transition-all',
                  'text-muted-foreground hover:text-foreground hover:bg-muted',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'disabled:opacity-40 disabled:pointer-events-none'
                )}
                aria-label={`${t('search.actions.previous')} (Shift+Enter)`}
              >
                <ChevronUp className="h-icon-lg w-icon-lg" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={onNextMatch}
                disabled={matches.length === 0}
                className={cn(
                  'h-8 w-8 rounded-md flex items-center justify-center transition-all',
                  'text-muted-foreground hover:text-foreground hover:bg-muted',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'disabled:opacity-40 disabled:pointer-events-none'
                )}
                aria-label={`${t('search.actions.next')} (Enter)`}
              >
                <ChevronDown className="h-icon-lg w-icon-lg" strokeWidth={1.5} />
              </button>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className={cn(
                  'h-8 w-8 rounded-md flex items-center justify-center transition-all ml-1',
                  'text-muted-foreground hover:text-foreground hover:bg-muted',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                )}
                aria-label={`${t('search.close')} (Esc)`}
              >
                <X className="h-icon-lg w-icon-lg" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Search Content */}
          <div className="p-3 space-y-2">
            <div className="relative">
              <Input
                ref={searchInputRef}
                value={query}
                onChange={(e) => handleQueryChange(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Tab' && !e.shiftKey) {
                    e.preventDefault();
                    if (!showReplace) {
                      setShowReplace(true);
                      setTimeout(() => replaceInputRef.current?.focus(), 0);
                    } else {
                      replaceInputRef.current?.focus();
                    }
                  }
                  if (e.altKey && e.key === 'ArrowUp') {
                    e.preventDefault();
                    navigateSearchHistory('prev');
                  }
                  if (e.altKey && e.key === 'ArrowDown') {
                    e.preventDefault();
                    navigateSearchHistory('next');
                  }
                }}
                placeholder={t('search.placeholder')}
                className="h-9 text-sm pr-[104px]"
                autoComplete="off"
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                aria-label={`${t('search.searchInput')} (${t('search.previousHistory')}: Alt+↑, ${t('search.nextHistory')}: Alt+↓)`}
              />
              <div className="absolute right-1.5 top-1/2 -translate-y-1/2 flex gap-1">
                <OptionButton
                  active={isCaseSensitive}
                  onClick={() => setIsCaseSensitive(!isCaseSensitive)}
                  icon={CaseSensitive}
                  label={t('search.options.caseSensitive')}
                  shortcut="Alt+C"
                />
                <OptionButton
                  active={isWholeWord}
                  onClick={() => setIsWholeWord(!isWholeWord)}
                  icon={WholeWord}
                  label={t('search.options.wholeWord')}
                  shortcut="Alt+W"
                />
                <OptionButton
                  active={isRegex}
                  onClick={() => setIsRegex(!isRegex)}
                  icon={Regex}
                  label={t('search.options.useRegex')}
                  shortcut="Alt+R"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowReplace((prev) => !prev)}
                className={cn(
                  'text-[13px] px-2.5 py-1.5 rounded-md transition-all',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  showReplace
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {showReplace ? t('search.hideReplace') : t('search.showReplace')}
              </button>
              {query && matches.length === 0 && (
                <span className="text-[13px] text-muted-foreground">
                  {t('search.results.empty')}
                </span>
              )}
            </div>

            {showReplace && (
              <div className="space-y-2 pt-2 border-t">
                <Input
                  ref={replaceInputRef}
                  value={replacement}
                  onChange={(e) => setReplacement(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab' && e.shiftKey) {
                      e.preventDefault();
                      searchInputRef.current?.focus();
                    }
                  }}
                  placeholder={t('search.replacePlaceholder')}
                  className="h-9 text-sm"
                  autoComplete="off"
                  spellCheck={false}
                />
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onReplaceClick}
                    disabled={!canReplace}
                    className="h-9 flex-1 text-sm font-medium"
                  >
                    {t('search.actions.replace')}
                  </Button>
                  <Button
                    size="sm"
                    onClick={onReplaceAllClick}
                    disabled={!canReplaceAll}
                    className="h-9 flex-1 text-sm font-medium"
                  >
                    {canReplaceAll
                      ? t('search.actions.replaceAllWithCount', { count: matches.length })
                      : t('search.actions.replaceAll')}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Results Section */}
          {matches.length > 0 && (
            <div className="border-t">
              <button
                type="button"
                onClick={() => setShowResults((prev) => !prev)}
                className={cn(
                  'flex items-center justify-between w-full px-3 py-2.5 text-[13px] text-muted-foreground',
                  'hover:bg-muted/50 transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset'
                )}
              >
                <span>{t('search.results.found', { count: matches.length })}</span>
                <ChevronRight
                  className={cn(
                    'h-icon-md w-icon-md transition-transform',
                    showResults && 'rotate-90'
                  )}
                  strokeWidth={1.5}
                />
              </button>

              {showResults && (
                <div
                  className={cn('overflow-y-auto px-1 pb-1', isMobile ? 'max-h-32' : 'max-h-40')}
                >
                  {matches.slice(0, 50).map((match, index) => (
                    <SearchResultItem
                      key={`${match.lineNumber}-${match.startIndex}`}
                      match={match}
                      isActive={index === currentMatchIndex}
                      onClick={() => goToMatch(index)}
                    />
                  ))}
                  {matches.length > 50 && (
                    <div className="text-xs text-muted-foreground text-center py-2">
                      +{matches.length - 50} {t('search.moreResults')}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {isMobile && <div className="h-safe-area-inset-bottom" />}
        </div>
      </>
    );
  }
);
SearchDialog.displayName = 'SearchDialog';
