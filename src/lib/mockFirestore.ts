// Mock Firestore for Demo
// Shared in-memory storage that persists across the same session

import type { Order } from '@/types';

class MockFirestoreDB {
  private data: Map<string, any> = new Map();
  private listeners: Map<string, ((data: any) => void)[]> = new Map();

  async setDoc(collection: string, docId: string, data: any): Promise<void> {
    const key = `${collection}/${docId}`;
    this.data.set(key, { ...data, id: docId });
    this.notifyListeners(collection);
  }

  async getDoc(collection: string, docId: string): Promise<any | null> {
    const key = `${collection}/${docId}`;
    return this.data.get(key) || null;
  }

  async getDocs(collection: string): Promise<any[]> {
    const results: any[] = [];
    for (const [key, value] of this.data.entries()) {
      if (key.startsWith(`${collection}/`)) {
        results.push(value);
      }
    }
    return results;
  }

  async query(collection: string, field: string, operator: string, value: any): Promise<any[]> {
    const allDocs = await this.getDocs(collection);
    return allDocs.filter(doc => {
      const fieldValue = doc[field];
      switch (operator) {
        case '==': return fieldValue === value;
        case '!=': return fieldValue !== value;
        default: return true;
      }
    });
  }

  subscribeToCollection(collection: string, callback: (docs: any[]) => void): () => void {
    const key = `collection:${collection}`;
    const existing = this.listeners.get(key) || [];
    this.listeners.set(key, [...existing, callback]);
    
    // Initial call
    this.getDocs(collection).then(docs => callback(docs));
    
    return () => {
      const listeners = this.listeners.get(key) || [];
      this.listeners.set(key, listeners.filter(l => l !== callback));
    };
  }

  private notifyListeners(collection: string) {
    const key = `collection:${collection}`;
    const listeners = this.listeners.get(key) || [];
    this.getDocs(collection).then(docs => {
      listeners.forEach(callback => callback(docs));
    });
  }

  // Debug method to see all data
  getAllData() {
    return Object.fromEntries(this.data);
  }
}

// Singleton instance - shared across the app
export const mockFirestoreDB = new MockFirestoreDB();

// Orders-specific helpers
export const mockOrdersStore = {
  async add(order: Order): Promise<void> {
    await mockFirestoreDB.setDoc('orders', order.id, order);
  },

  async get(orderId: string): Promise<Order | null> {
    return await mockFirestoreDB.getDoc('orders', orderId);
  },

  async getAll(): Promise<Order[]> {
    const orders = await mockFirestoreDB.getDocs('orders');
    return orders.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async getByStatus(status: string): Promise<Order[]> {
    const all = await this.getAll();
    return all.filter(o => o.status === status);
  },

  async getByCustomer(customerId: string): Promise<Order[]> {
    const all = await this.getAll();
    return all.filter(o => o.customerId === customerId);
  },

  async getByRider(riderId: string): Promise<Order[]> {
    const all = await this.getAll();
    return all.filter(o => o.riderId === riderId);
  },

  subscribe(callback: (orders: Order[]) => void): () => void {
    return mockFirestoreDB.subscribeToCollection('orders', callback);
  },

  subscribeByStatus(status: string, callback: (orders: Order[]) => void): () => void {
    const unsubscribe = mockFirestoreDB.subscribeToCollection('orders', (orders) => {
      callback(orders.filter((o: Order) => o.status === status));
    });
    return unsubscribe;
  }
};
