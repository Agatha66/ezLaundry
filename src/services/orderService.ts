import { collection, doc, setDoc, getDoc, getDocs, query, where, updateDoc, serverTimestamp, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { mockOrdersStore } from '@/lib/mockFirestore';
import { chatService } from './chatService';
import type { Order, OrderStatus, StatusHistoryItem } from '@/types';

const isDemoMode = import.meta.env.VITE_FIREBASE_API_KEY === 'demo-key' || 
                   !import.meta.env.VITE_FIREBASE_API_KEY;

const ORDERS_COLLECTION = 'orders';

// Helper: Convert Firestore Timestamp to ISO string
export const convertTimestamp = (value: any): string => {
  if (!value) return '';
  if (value instanceof Timestamp) return value.toDate().toISOString();
  if (value.toDate) return value.toDate().toISOString();
  if (typeof value === 'string') return value;
  return new Date(value).toISOString();
};

// Helper: Clean undefined values from object (Firestore rejects undefined)
const cleanUndefined = (obj: Record<string, any>): Record<string, any> => {
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = value;
    }
  }
  return cleaned;
};

async function notifyStatusChange(orderId: string, newStatus: OrderStatus, note?: string) {
  try {
    const chat = await chatService.getChatByOrderId(orderId);
    if (!chat) return;
    const label = statusLabels[newStatus]?.label || newStatus;
    const msg = note ? `${label} — ${note}` : `Order status updated to: ${label}`;
    await chatService.sendSystemMessage(chat.id, msg);
  } catch (e) {
    console.error('[Order] Failed to send status system message:', e);
  }
}

// Generate unique order ID
const generateOrderId = () => {
  const date = new Date();
  const prefix = 'EZL';
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  const timestamp = date.getTime().toString(36).substring(0, 4).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

// Status flow definition - defines which statuses can transition to which
export const statusFlow: Record<OrderStatus, OrderStatus[]> = {
  'pending': ['accepted', 'cancelled'],
  'accepted': ['picking-up', 'cancelled'],
  'picking-up': ['picked-up'],
  'picked-up': ['to-laundry'],
  'to-laundry': ['at-laundry'],
  'at-laundry': ['washing'],
  'washing': ['washed'],
  'washed': ['delivering'],
  'delivering': ['delivered'],
  'delivered': ['completed'],
  'completed': [],
  'cancelled': [],
};

// Status labels for display
export const statusLabels: Record<OrderStatus, { label: string; color: string; icon: string }> = {
  'pending': { label: 'Looking for Rider', color: 'bg-yellow-100 text-yellow-700', icon: '⏳' },
  'accepted': { label: 'Rider Assigned', color: 'bg-blue-100 text-blue-700', icon: '👤' },
  'picking-up': { label: 'Rider On The Way', color: 'bg-blue-100 text-blue-700', icon: '🛵' },
  'picked-up': { label: 'Collected', color: 'bg-green-100 text-green-700', icon: '✅' },
  'to-laundry': { label: 'To Laundry Facility', color: 'bg-purple-100 text-purple-700', icon: '🏭' },
  'at-laundry': { label: 'At Laundry', color: 'bg-gray-100 text-gray-700', icon: '📍' },
  'washing': { label: 'Washing In Progress', color: 'bg-cyan-100 text-cyan-700', icon: '🫧' },
  'washed': { label: 'Washing Complete', color: 'bg-teal-100 text-teal-700', icon: '✨' },
  'delivering': { label: 'Delivering To You', color: 'bg-indigo-100 text-indigo-700', icon: '📦' },
  'delivered': { label: 'Delivered', color: 'bg-green-100 text-green-700', icon: '🎉' },
  'completed': { label: 'Completed', color: 'bg-green-100 text-green-700', icon: '⭐' },
  'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: '❌' },
};

export const orderService = {
  // Create a new order
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'statusHistory'>): Promise<Order> {
    const orderId = generateOrderId();
    const now = new Date();
    
    const initialStatus: StatusHistoryItem = {
      status: 'pending',
      timestamp: now,
      note: 'Order created successfully',
      updatedBy: orderData.customerId,
    };

    const order: Order = {
      ...orderData,
      id: orderId,
      status: 'pending',
      statusHistory: [initialStatus],
      createdAt: now,
      updatedAt: now,
    };

    if (isDemoMode) {
      await mockOrdersStore.add(order);
      console.log('[Mock] Order created:', orderId, order);
    } else {
      await setDoc(doc(db, ORDERS_COLLECTION, orderId), {
        ...order,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return order;
  },

  // Get order by ID
  async getOrder(orderId: string): Promise<Order | null> {
    if (isDemoMode) {
      return await mockOrdersStore.get(orderId);
    }

    const docRef = doc(db, ORDERS_COLLECTION, orderId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) return null;
    
    const data = docSnap.data() as any;
    return {
      id: docSnap.id,
      ...data,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
      pickupDate: convertTimestamp(data.pickupDate),
      completedAt: data.completedAt ? convertTimestamp(data.completedAt) : undefined,
      statusHistory: Array.isArray(data.statusHistory) 
        ? data.statusHistory.map((item: any) => ({
            ...item,
            timestamp: convertTimestamp(item.timestamp),
          }))
        : data.statusHistory,
    } as Order;
  },

  // Get orders for a customer
  async getCustomerOrders(customerId: string): Promise<Order[]> {
    if (isDemoMode) {
      return await mockOrdersStore.getByCustomer(customerId);
    }

    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('customerId', '==', customerId)
    );
    
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        pickupDate: convertTimestamp(data.pickupDate),
        completedAt: data.completedAt ? convertTimestamp(data.completedAt) : undefined,
      } as Order;
    });
    
    // Sort client-side (newest first)
    return orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // Get orders assigned to a rider
  async getRiderOrders(riderId: string): Promise<Order[]> {
    if (isDemoMode) {
      return await mockOrdersStore.getByRider(riderId);
    }

    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('riderId', '==', riderId)
    );
    
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        pickupDate: convertTimestamp(data.pickupDate),
        completedAt: data.completedAt ? convertTimestamp(data.completedAt) : undefined,
      } as Order;
    });
    
    return orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // Get all pending orders (for riders to accept)
  async getPendingOrders(): Promise<Order[]> {
    if (isDemoMode) {
      return await mockOrdersStore.getByStatus('pending');
    }

    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('status', '==', 'pending')
    );
    
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        pickupDate: convertTimestamp(data.pickupDate),
      } as Order;
    });
    
    return orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // Get all active orders for a rider
  async getRiderActiveOrders(riderId: string): Promise<Order[]> {
    const allOrders = await this.getRiderOrders(riderId);
    const activeStatuses: OrderStatus[] = ['accepted', 'picking-up', 'picked-up', 'to-laundry', 'at-laundry', 'washing', 'washed', 'delivering'];
    return allOrders.filter(order => activeStatuses.includes(order.status));
  },

  // Accept order (for riders)
  async acceptOrder(orderId: string, riderId: string, riderName: string, riderPhone: string): Promise<void> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error('Order not found');
    if (order.status !== 'pending') throw new Error('Order is no longer available');

    const now = new Date();
    const statusUpdate: StatusHistoryItem = {
      status: 'accepted',
      timestamp: now,
      note: `Order accepted by ${riderName}`,
      updatedBy: riderId,
    };

    const updates = {
      riderId,
      riderName,
      riderPhone,
      status: 'accepted' as OrderStatus,
      statusHistory: [...order.statusHistory, statusUpdate],
      updatedAt: now,
    };

    if (isDemoMode) {
      const updatedOrder = { ...order, ...updates };
      await mockOrdersStore.add(updatedOrder);
      console.log('[Mock] Order accepted:', orderId);
    } else {
      await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    }

    // Create chat for this order
    try {
      await chatService.getOrCreateChat(
        orderId,
        order.customerId,
        order.customerName,
        riderId,
        riderName
      );
      console.log('[Order] Chat created for order:', orderId);
    } catch (error) {
      console.error('Failed to create chat:', error);
      // Don't throw - chat creation failure shouldn't break order acceptance
    }

    await notifyStatusChange(orderId, 'accepted', `Rider ${riderName} assigned`);
  },

  // Update order status
  async updateStatus(
    orderId: string, 
    newStatus: OrderStatus, 
    updatedBy: string, 
    note?: string
  ): Promise<void> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error('Order not found');

    const allowedTransitions = statusFlow[order.status];
    if (!allowedTransitions.includes(newStatus)) {
      throw new Error(`Cannot transition from ${order.status} to ${newStatus}`);
    }

    const now = new Date();
    const statusUpdate: StatusHistoryItem = {
      status: newStatus,
      timestamp: now,
      note: note || `Status updated to ${statusLabels[newStatus].label}`,
      updatedBy,
    };

    const updates: any = {
      status: newStatus,
      statusHistory: [...order.statusHistory, statusUpdate],
      updatedAt: now,
    };

    if (newStatus === 'completed') {
      updates.completedAt = now;
    }

    if (isDemoMode) {
      const updatedOrder = { ...order, ...updates };
      await mockOrdersStore.add(updatedOrder);
      console.log('[Mock] Order status updated:', orderId, newStatus);
    } else {
      await updateDoc(doc(db, ORDERS_COLLECTION, orderId), cleanUndefined({
        ...updates,
        updatedAt: serverTimestamp(),
      }));
    }

    await notifyStatusChange(orderId, newStatus, note);
  },

  // Cancel order (customer only, before pickup)
  async cancelOrder(orderId: string, customerId: string, reason?: string): Promise<void> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error('Order not found');
    if (order.customerId !== customerId) throw new Error('Unauthorized');
    
    // Can only cancel if not yet picked up
    const cancellableStatuses: OrderStatus[] = ['pending', 'accepted', 'picking-up'];
    if (!cancellableStatuses.includes(order.status)) {
      throw new Error('Cannot cancel order at this stage');
    }

    await this.updateStatus(orderId, 'cancelled', customerId, reason || 'Cancelled by customer');
  },

  // Update order price (admin or after weighing)
  async updatePrice(orderId: string, finalPrice: number, weight?: number): Promise<void> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error('Order not found');

    const updates: Partial<Order> = {
      finalPrice,
      totalAmount: finalPrice + order.deliveryFee,
      updatedAt: new Date(),
    };

    if (weight) updates.weight = weight;

    if (isDemoMode) {
      const updatedOrder = { ...order, ...updates };
      await mockOrdersStore.add(updatedOrder);
    } else {
      await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    }
  },

  // Get all orders (for admin)
  async getAllOrders(): Promise<Order[]> {
    if (isDemoMode) {
      return await mockOrdersStore.getAll();
    }

    const snapshot = await getDocs(collection(db, ORDERS_COLLECTION));
    const orders = snapshot.docs.map(doc => {
      const data = doc.data() as any;
      return {
        id: doc.id,
        ...data,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
        pickupDate: convertTimestamp(data.pickupDate),
        completedAt: data.completedAt ? convertTimestamp(data.completedAt) : undefined,
      } as Order;
    });
    
    return orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  // Subscribe to order updates (real-time)
  subscribeToOrder(orderId: string, callback: (order: Order | null) => void) {
    if (isDemoMode) {
      // Poll for changes in demo mode
      const interval = setInterval(async () => {
        const order = await this.getOrder(orderId);
        callback(order);
      }, 2000);
      
      return () => clearInterval(interval);
    }

    return onSnapshot(doc(db, ORDERS_COLLECTION, orderId), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as Order);
      } else {
        callback(null);
      }
    });
  },

  // Subscribe to pending orders (for riders)
  subscribeToPendingOrders(callback: (orders: Order[]) => void) {
    if (isDemoMode) {
      return mockOrdersStore.subscribeByStatus('pending', callback);
    }

    const q = query(
      collection(db, ORDERS_COLLECTION),
      where('status', '==', 'pending')
    );

    return onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => {
        const data = doc.data() as any;
        return {
          id: doc.id,
          ...data,
          createdAt: convertTimestamp(data.createdAt),
          updatedAt: convertTimestamp(data.updatedAt),
          pickupDate: convertTimestamp(data.pickupDate),
        } as Order;
      });
      callback(orders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    }, (error) => {
      console.error('Pending orders subscription error:', error);
    });
  },

  // Record pickup with actual item count and notes
  async recordPickup(
    orderId: string,
    riderId: string,
    actualItemCount: number,
    pickupNotes?: string
  ): Promise<void> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error('Order not found');

    const now = new Date();
    const statusUpdate: StatusHistoryItem = {
      status: 'picked-up',
      timestamp: now,
      note: `Picked up ${actualItemCount} items. ${pickupNotes || ''}`.trim(),
      updatedBy: riderId,
    };

    // Build updates object conditionally to avoid undefined values
    const updates: any = {
      status: 'picked-up',
      actualItemCount,
      statusHistory: [...order.statusHistory, statusUpdate],
      updatedAt: now,
    };

    // Only add pickupNotes if it has a value (Firestore rejects undefined)
    if (pickupNotes && pickupNotes.trim() !== '') {
      updates.pickupNotes = pickupNotes;
    }

    if (isDemoMode) {
      const updatedOrder = { ...order, ...updates };
      await mockOrdersStore.add(updatedOrder);
      console.log('[Mock] Pickup recorded:', orderId, { actualItemCount, pickupNotes });
    } else {
      await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    }

    await notifyStatusChange(orderId, 'picked-up', `${actualItemCount} items verified`);
  },

  // Record delivery with optional photo
  async recordDelivery(
    orderId: string,
    riderId: string,
    deliveryPhoto?: string
  ): Promise<void> {
    const order = await this.getOrder(orderId);
    if (!order) throw new Error('Order not found');

    const now = new Date();
    const statusUpdate: StatusHistoryItem = {
      status: 'delivered',
      timestamp: now,
      note: deliveryPhoto ? 'Delivered with photo proof' : 'Delivered to customer',
      updatedBy: riderId,
    };

    // Build updates object without undefined values
    const updates: any = {
      status: 'delivered',
      statusHistory: [...order.statusHistory, statusUpdate],
      updatedAt: now,
    };

    // Only add deliveryPhoto if it exists (avoid undefined)
    if (deliveryPhoto && deliveryPhoto.trim() !== '') {
      updates.deliveryPhoto = deliveryPhoto;
    }

    if (isDemoMode) {
      const updatedOrder = { ...order, ...updates };
      await mockOrdersStore.add(updatedOrder);
      console.log('[Mock] Delivery recorded:', orderId, { hasPhoto: !!deliveryPhoto });
    } else {
      await updateDoc(doc(db, ORDERS_COLLECTION, orderId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    }

    await notifyStatusChange(
      orderId, 
      'delivered', 
      deliveryPhoto ? 'Delivery photo attached' : undefined
    );

    // Send delivery photo as chat message if exists
    if (deliveryPhoto && deliveryPhoto.trim() !== '') {
      try {
        const chat = await chatService.getChatByOrderId(orderId);
        if (chat) {
          await chatService.sendImageMessage(
            chat.id,
            deliveryPhoto,
            riderId,
            order.riderName || 'Rider',
            'rider'
          );
        }
      } catch (e) {
        console.error('[Order] Failed to send delivery photo message:', e);
      }
    }
  },
};
