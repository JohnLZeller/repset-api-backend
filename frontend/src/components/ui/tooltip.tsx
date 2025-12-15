import * as React from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
  content: string;
  children: React.ReactElement;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [positionAbove, setPositionAbove] = React.useState(true);
  const timeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, 300); // Small delay to prevent flickering
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  React.useEffect(() => {
    if (isVisible && containerRef.current && tooltipRef.current) {
      const containerRect = containerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const spaceAbove = containerRect.top;
      const spaceBelow = window.innerHeight - containerRect.bottom;
      const tooltipHeight = tooltipRect.height;

      // Position above if there's enough space, otherwise position below
      setPositionAbove(spaceAbove >= tooltipHeight + 8 || spaceAbove > spaceBelow);
    }
  }, [isVisible]);

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            'absolute z-50 px-4 py-2.5 text-sm text-white bg-gray-900 dark:bg-gray-800 rounded-md shadow-lg pointer-events-none whitespace-normal min-w-[300px] max-w-xl',
            'left-1/2 transform -translate-x-1/2',
            positionAbove
              ? 'bottom-full mb-2 after:content-[""] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-gray-900 dark:after:border-t-gray-800'
              : 'top-full mt-2 after:content-[""] after:absolute after:bottom-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-b-gray-900 dark:after:border-b-gray-800',
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}

