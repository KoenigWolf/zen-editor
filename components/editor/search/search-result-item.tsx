'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import type { SearchMatch } from '@/lib/store/search-store';

interface SearchResultItemProps {
  match: SearchMatch;
  isActive: boolean;
  onClick: () => void;
}

export const SearchResultItem = memo(({ match, isActive, onClick }: SearchResultItemProps) => (
  <button
    type="button"
    className={cn(
      'w-full text-left text-sm px-2.5 py-2 rounded-md transition-all',
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
));
SearchResultItem.displayName = 'SearchResultItem';
