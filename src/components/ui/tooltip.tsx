import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '../../lib/utils';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  align?: 'center' | 'start' | 'end';
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children, side = 'top', align = 'center' }) => {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content
            side={side}
            align={align}
            className={cn(
              'z-50 rounded bg-black px-2 py-1 text-xs text-white shadow-lg',
              'data-[state=delayed-open]:data-[side=top]:animate-slideDownAndFade',
              'data-[state=delayed-open]:data-[side=right]:animate-slideLeftAndFade',
              'data-[state=delayed-open]:data-[side=left]:animate-slideRightAndFade',
              'data-[state=delayed-open]:data-[side=bottom]:animate-slideUpAndFade'
            )}
          >
            {content}
            <TooltipPrimitive.Arrow className="fill-black" />
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}; 