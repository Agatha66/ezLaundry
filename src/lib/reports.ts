import type { Order, OrderStatus } from '@/types';
import { statusLabels } from './orderStatus';
import { dayKey, toDate, toNumber } from './dates';

export interface DayPoint { date: string; label: string; orders: number; revenue: number }

/** Orders and revenue (excluding cancelled) per day for the last `days` days, ending today. */
export function dailySeries(orders: Order[], days: number, now: Date = new Date()): DayPoint[] {
  const points: DayPoint[] = [];
  const index = new Map<string, DayPoint>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const p = { date: dayKey(d), label: d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' }), orders: 0, revenue: 0 };
    points.push(p);
    index.set(p.date, p);
  }
  for (const o of orders) {
    const created = toDate(o.createdAt);
    if (!created) continue;
    const p = index.get(dayKey(created));
    if (!p) continue;
    p.orders += 1;
    if (o.status !== 'cancelled') p.revenue += toNumber(o.totalAmount);
  }
  return points;
}

export function statusBreakdown(orders: Order[]): { status: OrderStatus; label: string; count: number }[] {
  const counts = new Map<OrderStatus, number>();
  for (const o of orders) counts.set(o.status, (counts.get(o.status) ?? 0) + 1);
  return [...counts.entries()].map(([status, count]) => ({ status, label: statusLabels[status]?.label ?? status, count }));
}

/** Average rating over rated orders (optionally for one rider), rounded to 1 decimal. */
export function riderAverage(orders: Order[], riderId?: string): { avg: number; count: number } {
  const rated = orders.filter(o => o.rating && (!riderId || o.riderId === riderId));
  if (rated.length === 0) return { avg: 0, count: 0 };
  const sum = rated.reduce((s, o) => s + (o.rating?.stars ?? 0), 0);
  return { avg: Math.round((sum / rated.length) * 10) / 10, count: rated.length };
}

const csvCell = (v: unknown): string => {
  const s = v == null ? '' : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function ordersToCsv(orders: Order[]): string {
  const header = ['id', 'date', 'customer', 'rider', 'service', 'status', 'total', 'payment'];
  const rows = orders.map(o => [
    o.id,
    toDate(o.createdAt)?.toISOString() ?? '',
    o.customerName,
    o.riderName ?? '',
    o.serviceType,
    o.status,
    toNumber(o.totalAmount).toFixed(2),
    o.paymentStatus,
  ].map(csvCell).join(','));
  return [header.join(','), ...rows].join('\n');
}
