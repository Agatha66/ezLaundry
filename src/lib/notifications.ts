import type { Order } from '@/types';
import { statusLabels } from './orderStatus';
import { toDate } from './dates';

export interface AppNotification {
  id: string;
  orderId: string;
  title: string;
  icon: string;
  at: Date;
  unread: boolean;
}

const MAX_ITEMS = 20;

/** One notification per order status change, newest first. */
export function buildNotifications(orders: Order[], lastSeen: number): AppNotification[] {
  const items: AppNotification[] = [];
  for (const order of orders) {
    const history = Array.isArray(order.statusHistory) ? order.statusHistory : [];
    history.forEach((h, i) => {
      const at = toDate(h.timestamp);
      if (!at) return;
      const meta = statusLabels[h.status];
      items.push({
        id: `${order.id}-${i}`,
        orderId: order.id,
        title: `${meta?.label ?? h.status} · ${order.id}`,
        icon: meta?.icon ?? '🔔',
        at,
        unread: at.getTime() > lastSeen,
      });
    });
  }
  return items.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, MAX_ITEMS);
}
