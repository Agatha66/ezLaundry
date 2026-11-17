import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { EASE_OUT } from '@/components/motion';
import { toDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { Order, OrderStatus } from '@/types';
import { TRACK_STEPS, trackIndex } from './orderMeta';

function stepTime(order: Order, status: OrderStatus): Date | null {
  const history = Array.isArray(order.statusHistory) ? order.statusHistory : [];
  const aliases: OrderStatus[] = status === 'at-laundry' ? ['to-laundry', 'at-laundry'] : status === 'delivered' ? ['delivered', 'completed'] : [status];
  const hit = history.find(h => aliases.includes(h.status));
  return hit ? toDate(hit.timestamp) : null;
}

const fmt = (d: Date | null) =>
  d ? d.toLocaleString('en-MY', { hour: 'numeric', minute: '2-digit', day: 'numeric', month: 'short' }) : '';

/** Vertical animated tracker: done steps fill in, the current one pulses. */
export function OrderTimeline({ order }: { order: Order }) {
  if (order.status === 'cancelled') {
    const at = stepTime(order, 'cancelled');
    return (
      <div className="flex items-center gap-3 rounded-2xl bg-destructive/10 p-4 text-destructive">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-destructive text-white"><X className="h-5 w-5" /></span>
        <div>
          <p className="font-semibold">Order cancelled</p>
          {at && <p className="text-xs opacity-80">{fmt(at)}</p>}
        </div>
      </div>
    );
  }

  const current = trackIndex(order.status);
  const finished = order.status === 'delivered' || order.status === 'completed';

  return (
    <ol className="relative">
      {TRACK_STEPS.map((step, i) => {
        const done = i < current || (finished && i === current);
        const isCurrent = i === current && !finished;
        const last = i === TRACK_STEPS.length - 1;
        const at = i <= current ? stepTime(order, step.status) : null;
        return (
          <li key={step.status} className={cn('relative flex gap-4', !last && 'pb-6')}>
            {!last && (
              <span className="absolute left-[15px] top-8 bottom-0 w-0.5 overflow-hidden rounded bg-border">
                <motion.span
                  className="block w-full bg-primary"
                  initial={{ height: 0 }}
                  animate={{ height: i < current ? '100%' : 0 }}
                  transition={{ duration: 0.5, delay: 0.15 + i * 0.08, ease: EASE_OUT }}
                />
              </span>
            )}
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22, delay: i * 0.06 }}
              className={cn(
                'relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-sm transition-colors',
                done && 'border-primary bg-primary text-white',
                isCurrent && 'border-primary bg-card',
                !done && !isCurrent && 'border-border bg-muted text-muted-foreground'
              )}
            >
              {isCurrent && <span className="absolute inset-0 animate-ping rounded-full bg-primary/30" />}
              {done ? <Check className="h-4 w-4" strokeWidth={3} /> : <span className="relative">{step.icon}</span>}
            </motion.span>
            <div className="pt-1">
              <p className={cn('text-sm font-semibold', !done && !isCurrent && 'font-medium text-muted-foreground')}>{step.label}</p>
              <p className="text-xs text-muted-foreground">{isCurrent && !at ? 'In progress' : at ? fmt(at) : 'Pending'}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
