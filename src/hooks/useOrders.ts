import { useState, useEffect, useCallback, useRef } from 'react';
import { orderService } from '@/services/orderService';
import type { Order } from '@/types';

// Hook for customer orders
export function useCustomerOrders(customerId: string | undefined) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isFirstLoad = useRef(true);

  const fetchOrders = useCallback(async () => {
    if (!customerId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      // Only show loading on first fetch
      if (isFirstLoad.current) {
        setLoading(true);
      }
      const data = await orderService.getCustomerOrders(customerId);
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch customer orders:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
      isFirstLoad.current = false; // Mark first load complete
    }
  }, [customerId]);

  useEffect(() => {
    fetchOrders();
    
    // Poll for updates every 3 seconds
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const refresh = () => fetchOrders();

  return { orders, loading, error, refresh };
}

// Hook for rider orders
export function useRiderOrders(riderId: string | undefined) {
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [completedOrders, setCompletedOrders] = useState<Order[]>([]);
  const [cancelledOrders, setCancelledOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!riderId) {
      setActiveOrders([]);
      setCompletedOrders([]);
      setCancelledOrders([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const allOrders = await orderService.getRiderOrders(riderId);
      
      const active = allOrders.filter(o => 
        ['accepted', 'picking-up', 'picked-up', 'to-laundry', 'at-laundry', 'washing', 'washed', 'delivering'].includes(o.status)
      );
      
      // Fixed: Only completed + delivered count as done. Cancelled is separate.
      const completed = allOrders.filter(o => 
        ['completed', 'delivered'].includes(o.status)
      );
      
      const cancelled = allOrders.filter(o => o.status === 'cancelled');
      
      setActiveOrders(active);
      setCompletedOrders(completed);
      setCancelledOrders(cancelled);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch rider orders:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [riderId]);

  useEffect(() => {
    fetchOrders();
    
    // Poll for updates every 2 seconds for live stats
    const interval = setInterval(fetchOrders, 2000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  const refresh = () => fetchOrders();

  return { activeOrders, completedOrders, cancelledOrders, loading, error, refresh };
}

// Hook for pending orders (available for riders)
export function usePendingOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orderService.getPendingOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch pending orders:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    
    // Subscribe to real-time updates
    const unsubscribe = orderService.subscribeToPendingOrders((updatedOrders) => {
      setOrders(updatedOrders);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchOrders]);

  return { orders, loading, error, refresh: fetchOrders };
}

// Hook for single order
export function useOrder(orderId: string | undefined) {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!orderId) {
      setOrder(null);
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await orderService.getOrder(orderId);
        setOrder(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch order:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();

    const unsubscribe = orderService.subscribeToOrder(orderId, (updatedOrder) => {
      setOrder(updatedOrder);
    });

    return () => unsubscribe();
  }, [orderId]);

  return { order, loading, error };
}

// Hook for all orders (admin)
export function useAllOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await orderService.getAllOrders();
      setOrders(data);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch all orders:', err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
    
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, [fetchOrders]);

  return { orders, loading, error, refresh: fetchOrders };
}