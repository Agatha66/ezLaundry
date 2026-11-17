import { useId } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface Segment<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedTabsProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  items: Segment<T>[];
  className?: string;
}

/** Pill-style tabs with a sliding highlight. */
export function SegmentedTabs<T extends string>({ value, onChange, items, className }: SegmentedTabsProps<T>) {
  const id = useId();
  return (
    <div role="tablist" className={cn('inline-flex w-full rounded-2xl border border-border bg-muted/60 p-1 sm:w-auto', className)}>
      {items.map(item => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              'relative flex-1 whitespace-nowrap rounded-xl px-4 py-2 text-sm font-medium transition-colors sm:flex-none',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-xl bg-card shadow-sm"
                transition={{ type: 'spring', stiffness: 450, damping: 34 }}
              />
            )}
            <span className="relative">
              {item.label}
              {item.count !== undefined && (
                <span className={cn('ml-1.5 rounded-full px-1.5 text-xs', active ? 'bg-primary/10 text-primary' : 'bg-border/60')}>{item.count}</span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
