'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';

interface SearchOptionButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
  shortcut?: string;
}

export const SearchOptionButton = memo(
  ({ active, onClick, icon: Icon, label, shortcut }: SearchOptionButtonProps) => (
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
SearchOptionButton.displayName = 'SearchOptionButton';
