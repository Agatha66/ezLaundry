import { useNavigate } from 'react-router-dom';
import { MessageCircle, Star } from 'lucide-react';
import { Pressable } from '@/components/motion';
import { statusLabels } from '@/lib/orderStatus';
import { toDate } from '@/lib/dates';
import { cn } from '@/lib/utils';
import type { Order } from '@/types';
import { CHAT_STATUSES, SERVICE_EMOJI, SERVICE_NAMES, canRate, money } from './orderMeta';

interface OrderCardProps {
  order: Order;
  onRate?: (order: Order) => void;
  /** Show the customer name instead of the service (rider/admin views). */
  showCustomer?: boolean;
  className?: string;
}

export function OrderCard({ order, onRate, showCustomer, className }: OrderCardProps) {
  const navigate = useNavigate();
  const status = statusLabels[order.status];
  const pickup = toDate(order.pickupDate);
  const canChat = !!order.riderId && CHAT_STATUSES.includes(order.status);

  return (
    <Pressable
      onClick={() => navigate(`/order/${order.id}`)}
      className={cn('flex items-center gap-3 rounded-2xl border border-border bg-card p-3.5 shadow-sm transition-shadow hover:shadow-md sm:p-4', className)}
    >
      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-muted text-2xl">{SERVICE_EMOJI[order.serviceType]}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground">{showCustomer ? order.customerName : SERVICE_NAMES[order.serviceType]}</p>
        <p className="truncate text-xs text-muted-foreground sm:text-sm">
          #{order.id.slice(-4)} · {order.declaredItemCount} items{pickup ? ` · ${pickup.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}` : ''}
        </p>
        <span className={cn('mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold', status?.color)}>
          {status?.icon} {status?.label ?? order.status}
        </span>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1.5">
        <p className="font-semibold text-foreground">{money(order.totalAmount)}</p>
        {order.rating ? (
          <span className="inline-flex items-center gap-0.5 text-xs font-medium text-amber-500">
            <Star className="h-3.5 w-3.5 fill-current" /> {order.rating.stars}.0
          </span>
        ) : onRate && canRate(order) ? (
          <button
            onClick={e => { e.stopPropagation(); onRate(order); }}
            className="inline-flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-xs font-semibold text-amber-600 transition-colors hover:bg-amber-400/25 dark:text-amber-300"
          >
            <Star className="h-3.5 w-3.5" /> Rate
          </button>
        ) : canChat ? (
          <button
            onClick={e => { e.stopPropagation(); navigate(`/chat/${order.id}`); }}
            aria-label="Open chat"
            className="grid h-8 w-8 place-items-center rounded-lg text-primary transition-colors hover:bg-primary/10"
          >
            <MessageCircle className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </Pressable>
  );
}
