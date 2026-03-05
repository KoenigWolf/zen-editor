'use client';

import { forwardRef, type ElementRef, type ComponentPropsWithoutRef, type ReactNode } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';
import { useMounted } from '@/hooks/core/use-mounted';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = ({
  children,
  ...props
}: ComponentPropsWithoutRef<typeof TooltipPrimitive.Root> & { children: ReactNode }) => {
  const mounted = useMounted();
  if (!mounted) return <>{children}</>;
  return <TooltipPrimitive.Root {...props}>{children}</TooltipPrimitive.Root>;
};

const TooltipTrigger = ({
  children,
  ...props
}: ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger> & { children: ReactNode }) => {
  const mounted = useMounted();
  if (!mounted) return <>{children}</>;
  return <TooltipPrimitive.Trigger {...props}>{children}</TooltipPrimitive.Trigger>;
};

const TooltipContent = forwardRef<
  ElementRef<typeof TooltipPrimitive.Content>,
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  const mounted = useMounted();
  if (!mounted) return null;
  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  );
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
