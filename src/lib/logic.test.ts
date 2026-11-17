import { describe, it, expect } from 'vitest';
import { makeOrder } from './__fixtures__/orders';
import { toDate } from './dates';
import { computeLoyalty } from './loyalty';
import { buildNotifications } from './notifications';
import { getSavedAddresses, getDefaultAddress } from './addresses';
import { dailySeries, statusBreakdown, riderAverage, ordersToCsv } from './reports';
import type { User, SavedAddress } from '@/types';

const rating = { stars: 5 as const, tags: [], createdAt: '2026-11-17T10:00:00Z' };

describe('toDate', () => {
  it('parses ISO strings, Firestore-like objects and rejects junk', () => {
    expect(toDate('2026-01-02T00:00:00Z')?.toISOString()).toBe('2026-01-02T00:00:00.000Z');
    expect(toDate({ seconds: 0 })?.getTime()).toBe(0);
    expect(toDate({ toDate: () => new Date(5) })?.getTime()).toBe(5);
    expect(toDate(undefined)).toBeNull();
    expect(toDate('not a date')).toBeNull();
  });
});

describe('computeLoyalty', () => {
  it('sums floor(total) of completed orders plus 5 per review', () => {
    const l = computeLoyalty([
      makeOrder({ status: 'completed', totalAmount: 120.9 }),
      makeOrder({ status: 'completed', totalAmount: 200, rating }),
      makeOrder({ status: 'cancelled', totalAmount: 999 }),
      makeOrder({ status: 'completed', totalAmount: 'abc' }),
    ]);
    expect(l.points).toBe(325);
    expect(l.tier).toBe('Silver');
    expect(l.nextTier).toBe('Gold');
    expect(l.toNext).toBe(475);
    expect(l.progress).toBeCloseTo(25 / 500);
  });

  it('caps at Gold with full progress', () => {
    const l = computeLoyalty([makeOrder({ status: 'delivered', totalAmount: 900 })]);
    expect(l.tier).toBe('Gold');
    expect(l.nextTier).toBeNull();
    expect(l.progress).toBe(1);
  });
});

describe('buildNotifications', () => {
  it('lists history newest first and flags unread after lastSeen', () => {
    const order = makeOrder({
      statusHistory: [
        { status: 'pending', timestamp: '2026-11-17T08:00:00Z', updatedBy: 'c1' },
        { status: 'accepted', timestamp: '2026-11-17T08:10:00Z', updatedBy: 'r1' },
        { status: 'picking-up', timestamp: '2026-11-17T08:20:00Z', updatedBy: 'r1' },
      ],
    });
    const lastSeen = new Date('2026-11-17T08:05:00Z').getTime();
    const items = buildNotifications([order, makeOrder({ id: 'X', statusHistory: undefined })], lastSeen);
    expect(items).toHaveLength(3);
    expect(items.map(i => i.unread)).toEqual([true, true, false]);
    expect(items[0].title).toContain('Rider On The Way');
    expect(items[0].orderId).toBe('EZL-TEST');
  });

  it('caps at 20 items', () => {
    const history = Array.from({ length: 30 }, (_, i) => ({ status: 'washing', timestamp: new Date(i * 1000).toISOString(), updatedBy: 'r' }));
    expect(buildNotifications([makeOrder({ statusHistory: history })], 0)).toHaveLength(20);
  });
});

describe('addresses', () => {
  const legacy = { street: '1 Jln A', building: 'Vista', area: 'Ampang', city: 'KL', postcode: '50450' };
  it('falls back to the legacy address as default Home', () => {
    const list = getSavedAddresses({ address: legacy } as unknown as User);
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ label: 'Home', isDefault: true, street: '1 Jln A' });
  });
  it('prefers saved addresses and finds the default', () => {
    const a: SavedAddress = { ...legacy, id: 'a', label: 'Home', isDefault: false };
    const b: SavedAddress = { ...legacy, id: 'b', label: 'Office', isDefault: true };
    const user = { addresses: [a, b], address: legacy } as unknown as User;
    expect(getSavedAddresses(user)).toEqual([a, b]);
    expect(getDefaultAddress(user)?.id).toBe('b');
  });
  it('handles missing user', () => {
    expect(getSavedAddresses(null)).toEqual([]);
    expect(getDefaultAddress(null)).toBeNull();
  });
});

describe('reports', () => {
  const now = new Date('2026-11-17T12:00:00');
  const orders = [
    makeOrder({ id: 'a', createdAt: '2026-11-17T09:00:00', totalAmount: 30, status: 'completed', riderId: 'r1', rating: { ...rating, stars: 4 } }),
    makeOrder({ id: 'b', createdAt: '2026-11-17T10:00:00', totalAmount: 50, status: 'cancelled' }),
    makeOrder({ id: 'c', createdAt: '2026-11-15T10:00:00', totalAmount: '20', status: 'washing', riderId: 'r1', rating }),
  ];

  it('builds a daily series ending today, excluding cancelled revenue', () => {
    const s = dailySeries(orders, 7, now);
    expect(s).toHaveLength(7);
    expect(s[6].date).toBe('2026-11-17');
    expect(s[6].orders).toBe(2);
    expect(s[6].revenue).toBe(30);
    expect(s[4].revenue).toBe(20);
  });

  it('breaks down statuses with non-zero counts', () => {
    const b = statusBreakdown(orders);
    expect(b.map(x => x.status).sort()).toEqual(['cancelled', 'completed', 'washing']);
    expect(b.every(x => x.count === 1)).toBe(true);
  });

  it('averages rider ratings', () => {
    expect(riderAverage(orders, 'r1')).toEqual({ avg: 4.5, count: 2 });
    expect(riderAverage([], 'r1')).toEqual({ avg: 0, count: 0 });
  });

  it('exports RFC-4180 CSV', () => {
    const csv = ordersToCsv([makeOrder({ customerName: 'Lim, Ah "Boy"' })]);
    const [header, row] = csv.split('\n');
    expect(header).toBe('id,date,customer,rider,service,status,total,payment');
    expect(row).toContain('"Lim, Ah ""Boy"""');
  });
});
