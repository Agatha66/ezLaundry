import type { Order } from '@/types';
import { toNumber } from './dates';

export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold';

export interface Loyalty {
  points: number;
  tier: LoyaltyTier;
  nextTier: LoyaltyTier | null;
  toNext: number;
  /** 0–1 progress within the current tier (1 at Gold). */
  progress: number;
}

const TIERS: { name: LoyaltyTier; min: number }[] = [
  { name: 'Bronze', min: 0 },
  { name: 'Silver', min: 300 },
  { name: 'Gold', min: 800 },
];

export const POINTS_PER_REVIEW = 5;

/** 1 point per RM on delivered/completed orders, plus 5 per review. */
export function computeLoyalty(orders: Order[]): Loyalty {
  let points = 0;
  for (const o of orders) {
    if (o.status === 'completed' || o.status === 'delivered') points += Math.floor(toNumber(o.totalAmount));
    if (o.rating) points += POINTS_PER_REVIEW;
  }
  let idx = 0;
  TIERS.forEach((t, i) => { if (points >= t.min) idx = i; });
  const cur = TIERS[idx];
  const next = TIERS[idx + 1] ?? null;
  return {
    points,
    tier: cur.name,
    nextTier: next?.name ?? null,
    toNext: next ? next.min - points : 0,
    progress: next ? (points - cur.min) / (next.min - cur.min) : 1,
  };
}
