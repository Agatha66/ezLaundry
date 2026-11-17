import { useCallback, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomerOrders, useRiderOrders } from '@/hooks/useOrders';
import { buildNotifications, type AppNotification } from '@/lib/notifications';

const key = (uid: string) => `ezl:notif-seen:${uid}`;

function readSeen(uid: string | undefined): number {
  if (!uid) return 0;
  try {
    return Number(localStorage.getItem(key(uid))) || 0;
  } catch {
    return 0;
  }
}

/** Order status updates for the signed-in customer or rider. */
export function useNotifications(): { items: AppNotification[]; unreadCount: number; markAllRead: () => void } {
  const { userData } = useAuth();
  const uid = userData?.uid;
  const role = userData?.role;
  const { orders: customerOrders } = useCustomerOrders(role === 'customer' ? uid : undefined);
  const rider = useRiderOrders(role === 'rider' ? uid : undefined);
  const [seen, setSeen] = useState(() => readSeen(uid));

  const riderOrders = useMemo(
    () => [...rider.activeOrders, ...rider.completedOrders, ...rider.cancelledOrders],
    [rider.activeOrders, rider.completedOrders, rider.cancelledOrders]
  );
  const orders = role === 'rider' ? riderOrders : customerOrders;
  const items = useMemo(() => buildNotifications(orders, seen), [orders, seen]);
  const unreadCount = items.filter(i => i.unread).length;

  const markAllRead = useCallback(() => {
    const now = Date.now();
    setSeen(now);
    if (!uid) return;
    try {
      localStorage.setItem(key(uid), String(now));
    } catch {
      /* storage unavailable */
    }
  }, [uid]);

  return { items, unreadCount, markAllRead };
}
