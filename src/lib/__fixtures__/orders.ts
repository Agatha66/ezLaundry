import type { Order } from '@/types';

/** Build an Order with sensible defaults for tests. Accepts loose overrides (legacy data shapes). */
export function makeOrder(overrides: Record<string, unknown> = {}): Order {
  return {
    id: 'EZL-TEST',
    customerId: 'c1',
    customerName: 'Aina',
    customerPhone: '0123456789',
    customerAddress: { street: '1 Jln A', building: 'Vista', area: 'Ampang', city: 'KL', postcode: '50450' },
    serviceType: 'wash-fold',
    status: 'pending',
    declaredItemCount: 5,
    pickupDate: new Date('2026-11-17T09:00:00Z'),
    preferredTimeSlot: 'morning',
    estimatedPrice: 24,
    estimatedWeight: 3,
    deliveryFee: 5,
    totalAmount: 29,
    paymentStatus: 'pending',
    createdAt: new Date('2026-11-17T08:00:00Z'),
    updatedAt: new Date('2026-11-17T08:00:00Z'),
    statusHistory: [],
    ...overrides,
  } as Order;
}
