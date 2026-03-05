'use client';

import { memo } from 'react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { HANDLE_CONFIGS } from './indent-handle-config';
import type { IndentHandleProps } from './types';

export const IndentHandle = memo(
  ({ variant, position, onDragStart, onKeyDown, label, value, onRemove }: IndentHandleProps) => {
    const config = HANDLE_CONFIGS[variant];

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`indent-handle ${config.className}`}
            style={{ [config.positionProp]: position }}
            onMouseDown={onDragStart}
            onKeyDown={onKeyDown}
            onDoubleClick={onRemove}
            role="slider"
            aria-label={label}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={value}
            tabIndex={0}
          >
            {config.svg}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    );
  }
);
IndentHandle.displayName = 'IndentHandle';
