import type { Order, OrderStatus } from '@/types';

export const SERVICE_NAMES: Record<Order['serviceType'], string> = {
  'wash-fold': 'Wash & Fold',
  'wash-iron': 'Wash & Iron',
  'dry-clean': 'Dry Clean',
};

export const SERVICE_EMOJI: Record<Order['serviceType'], string> = {
  'wash-fold': '👕',
  'wash-iron': '👔',
  'dry-clean': '🧥',
};

export const ACTIVE_STATUSES: OrderStatus[] = [
  'pending', 'accepted', 'picking-up', 'picked-up', 'to-laundry', 'at-laundry', 'washing', 'washed', 'delivering',
];
export const DONE_STATUSES: OrderStatus[] = ['delivered', 'completed'];
export const CHAT_STATUSES: OrderStatus[] = [
  'accepted', 'picking-up', 'picked-up', 'to-laundry', 'at-laundry', 'washing', 'washed', 'delivering', 'delivered', 'completed',
];

/** Customer-facing tracker steps. */
export const TRACK_STEPS: { status: OrderStatus; label: string; icon: string }[] = [
  { status: 'pending', label: 'Order placed', icon: '🧾' },
  { status: 'accepted', label: 'Rider assigned', icon: '👤' },
  { status: 'picking-up', label: 'Rider on the way', icon: '🛵' },
  { status: 'picked-up', label: 'Laundry collected', icon: '✅' },
  { status: 'at-laundry', label: 'At the laundry', icon: '🏭' },
  { status: 'washing', label: 'Washing', icon: '🫧' },
  { status: 'washed', label: 'Ready for delivery', icon: '✨' },
  { status: 'delivering', label: 'Out for delivery', icon: '📦' },
  { status: 'delivered', label: 'Delivered', icon: '🎉' },
];

/** Index of the current step in TRACK_STEPS (to-laundry maps to at-laundry; completed to delivered). */
export function trackIndex(status: OrderStatus): number {
  const mapped: OrderStatus = status === 'to-laundry' ? 'at-laundry' : status === 'completed' ? 'delivered' : status;
  return Math.max(0, TRACK_STEPS.findIndex(s => s.status === mapped));
}

export const isActive = (o: Order) => ACTIVE_STATUSES.includes(o.status);
export const canRate = (o: Order) => DONE_STATUSES.includes(o.status) && !!o.riderId && !o.rating;
export const money = (v: unknown) => `RM${(Number(v) || 0).toFixed(2).replace(/\.00$/, '')}`;
