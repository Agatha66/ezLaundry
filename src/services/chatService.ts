import { collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, updateDoc, serverTimestamp, onSnapshot, increment, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Chat, ChatMessage, UserRole } from '@/types';

const isDemoMode = import.meta.env.VITE_FIREBASE_API_KEY === 'demo-key' || 
                   !import.meta.env.VITE_FIREBASE_API_KEY;

const CHATS_COLLECTION = 'chats';
const MESSAGES_COLLECTION = 'messages';

// Mock chat storage for demo mode
const mockChatsStore = new Map<string, Chat>();
const mockMessagesStore = new Map<string, ChatMessage[]>();

export const chatService = {
  // Create a chat for an order
  async createChat(orderId: string, customerId: string, customerName: string, riderId: string, riderName: string): Promise<Chat> {
    const chatId = `chat_${orderId}`;
    const now = new Date();
    
    const chat: Chat = {
      id: chatId,
      orderId,
      customerId,
      customerName,
      riderId,
      riderName,
      createdAt: now,
      updatedAt: now,
      unreadCountCustomer: 0,
      unreadCountRider: 0,
    };

    if (isDemoMode) {
      mockChatsStore.set(chatId, chat);
      mockMessagesStore.set(chatId, []);
      console.log('[Mock] Chat created:', chatId);
    } else {
      await setDoc(doc(db, CHATS_COLLECTION, chatId), {
        ...chat,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return chat;
  },

  // Get chat by order ID
  async getChatByOrderId(orderId: string): Promise<Chat | null> {
    const chatId = `chat_${orderId}`;
    
    if (isDemoMode) {
      return mockChatsStore.get(chatId) || null;
    }

    const docRef = doc(db, CHATS_COLLECTION, chatId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Chat;
    }
    return null;
  },

  // Get or create chat for an order
  async getOrCreateChat(orderId: string, customerId: string, customerName: string, riderId: string, riderName: string): Promise<Chat> {
    const existingChat = await this.getChatByOrderId(orderId);
    if (existingChat) return existingChat;
    return this.createChat(orderId, customerId, customerName, riderId, riderName);
  },

  // Get all chats for a customer
  async getCustomerChats(customerId: string): Promise<Chat[]> {
    if (isDemoMode) {
      return Array.from(mockChatsStore.values())
        .filter(chat => chat.customerId === customerId)
        .sort((a, b) => (b.lastMessageAt?.getTime() || 0) - (a.lastMessageAt?.getTime() || 0));
    }

    const q = query(
      collection(db, CHATS_COLLECTION),
      where('customerId', '==', customerId),
      orderBy('lastMessageAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Chat);
  },

  // Get all chats for a rider
  async getRiderChats(riderId: string): Promise<Chat[]> {
    if (isDemoMode) {
      return Array.from(mockChatsStore.values())
        .filter(chat => chat.riderId === riderId)
        .sort((a, b) => (b.lastMessageAt?.getTime() || 0) - (a.lastMessageAt?.getTime() || 0));
    }

    const q = query(
      collection(db, CHATS_COLLECTION),
      where('riderId', '==', riderId),
      orderBy('lastMessageAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Chat);
  },

  // Send a message
  async sendMessage(
    chatId: string,
    senderId: string,
    senderName: string,
    senderRole: UserRole,
    content: string
  ): Promise<ChatMessage> {
    const now = new Date();
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const message: ChatMessage = {
      id: messageId,
      chatId,
      senderId,
      senderName,
      senderRole,
      content,
      createdAt: now,
      read: false,
    };

    if (isDemoMode) {
      // Add message
      const messages = mockMessagesStore.get(chatId) || [];
      messages.push(message);
      mockMessagesStore.set(chatId, messages);
      
      // Update chat
      const chat = mockChatsStore.get(chatId);
      if (chat) {
        chat.lastMessage = content;
        chat.lastMessageAt = now;
        chat.updatedAt = now;
        if (senderRole === 'customer') {
          chat.unreadCountRider = (chat.unreadCountRider || 0) + 1;
        } else {
          chat.unreadCountCustomer = (chat.unreadCountCustomer || 0) + 1;
        }
        mockChatsStore.set(chatId, chat);
      }
      
      // console.log('[Mock] Message sent:', messageId);
    } else {
      // Add message
      await setDoc(doc(db, MESSAGES_COLLECTION, messageId), {
        ...message,
        createdAt: serverTimestamp(),
      });

      // Update chat
      const chatRef = doc(db, CHATS_COLLECTION, chatId);
      const isCustomer = senderRole === 'customer';
      await updateDoc(chatRef, {
        lastMessage: content,
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        [isCustomer ? 'unreadCountRider' : 'unreadCountCustomer']: increment(1),
      });
    }

    return message;
  },

  // Send an image message (for delivery photos)
  async sendImageMessage(chatId: string, imageUrl: string, senderId: string, senderName: string, senderRole: UserRole): Promise<ChatMessage> {
    const now = new Date();
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const message: ChatMessage = {
      id: messageId,
      chatId,
      senderId,
      senderName,
      senderRole,
      content: 'Delivery photo:',
      imageUrl,
      createdAt: now,
      read: true,
    };

    if (isDemoMode) {
      const messages = mockMessagesStore.get(chatId) || [];
      messages.push(message);
      mockMessagesStore.set(chatId, messages);

      const chat = mockChatsStore.get(chatId);
      if (chat) {
        chat.lastMessage = '📷 Photo';
        chat.lastMessageAt = now;
        chat.updatedAt = now;
        mockChatsStore.set(chatId, chat);
      }
    } else {
      await setDoc(doc(db, MESSAGES_COLLECTION, messageId), {
        ...message,
        createdAt: serverTimestamp(),
      });

      const chatRef = doc(db, CHATS_COLLECTION, chatId);
      await updateDoc(chatRef, {
        lastMessage: '📷 Photo',
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return message;
  },

  async sendSystemMessage(chatId: string, content: string): Promise<ChatMessage> {
    const now = new Date();
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const message: ChatMessage = {
      id: messageId,
      chatId,
      senderId: 'system',
      senderName: 'System',
      senderRole: 'system',
      content,
      createdAt: now,
      read: true,
    };

    if (isDemoMode) {
      const messages = mockMessagesStore.get(chatId) || [];
      messages.push(message);
      mockMessagesStore.set(chatId, messages);
      
      const chat = mockChatsStore.get(chatId);
      if (chat) {
        chat.lastMessage = content;
        chat.lastMessageAt = now;
        chat.updatedAt = now;
        mockChatsStore.set(chatId, chat);
      }
    } else {
      await setDoc(doc(db, MESSAGES_COLLECTION, messageId), {
        ...message,
        createdAt: serverTimestamp(),
      });

      const chatRef = doc(db, CHATS_COLLECTION, chatId);
      await updateDoc(chatRef, {
        lastMessage: content,
        lastMessageAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }

    return message;
  },

  // Get messages for a chat
  async getMessages(chatId: string): Promise<ChatMessage[]> {
    if (isDemoMode) {
      return mockMessagesStore.get(chatId) || [];
    }

    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ChatMessage);
  },

  // Mark messages as read
  async markAsRead(chatId: string, userRole: UserRole, userId: string): Promise<void> {
    if (isDemoMode) {
      const chat = mockChatsStore.get(chatId);
      if (chat) {
        if (userRole === 'customer') {
          chat.unreadCountCustomer = 0;
        } else {
          chat.unreadCountRider = 0;
        }
        mockChatsStore.set(chatId, chat);
        
        // Mark messages as read
        const messages = mockMessagesStore.get(chatId) || [];
        messages.forEach(msg => {
          if (msg.senderId !== userId && msg.senderRole !== 'system') {
            msg.read = true;
          }
        });
      }
      return;
    }

    const chatRef = doc(db, CHATS_COLLECTION, chatId);
    const isCustomer = userRole === 'customer';
    await updateDoc(chatRef, {
      [isCustomer ? 'unreadCountCustomer' : 'unreadCountRider']: 0,
    });

    // Mark messages as read (from other party)
    try {
      const q = query(
        collection(db, MESSAGES_COLLECTION),
        where('chatId', '==', chatId),
        where('read', '==', false),
        where('senderId', '!=', userId)
      );
      const snapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      snapshot.docs.forEach(d => {
        batch.update(doc(db, MESSAGES_COLLECTION, d.id), { read: true });
      });
      await batch.commit();
    } catch (e) {
      console.log('Could not mark messages as read (need index):', e);
    }
  },

  // Subscribe to chat updates
  subscribeToChat(chatId: string, callback: (chat: Chat | null) => void) {
    if (isDemoMode) {
      const interval = setInterval(async () => {
        const chat = mockChatsStore.get(chatId) || null;
        callback(chat);
      }, 1000);
      
      return () => clearInterval(interval);
    }

    return onSnapshot(doc(db, CHATS_COLLECTION, chatId), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as Chat);
      } else {
        callback(null);
      }
    });
  },

  // Subscribe to messages
  subscribeToMessages(chatId: string, callback: (messages: ChatMessage[]) => void) {
    if (isDemoMode) {
      const interval = setInterval(async () => {
        const messages = mockMessagesStore.get(chatId) || [];
        callback([...messages]);
      }, 1000);
      
      return () => clearInterval(interval);
    }

    const q = query(
      collection(db, MESSAGES_COLLECTION),
      where('chatId', '==', chatId),
      orderBy('createdAt', 'asc')
    );

    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ChatMessage);
      callback(messages);
    });
  },

  // Subscribe to customer's chats
  subscribeToCustomerChats(customerId: string, callback: (chats: Chat[]) => void) {
    if (isDemoMode) {
      const interval = setInterval(async () => {
        const chats = Array.from(mockChatsStore.values())
          .filter(chat => chat.customerId === customerId)
          .sort((a, b) => (b.lastMessageAt?.getTime() || 0) - (a.lastMessageAt?.getTime() || 0));
        callback(chats);
      }, 1000);
      
      return () => clearInterval(interval);
    }

    const q = query(
      collection(db, CHATS_COLLECTION),
      where('customerId', '==', customerId),
      orderBy('lastMessageAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Chat);
      callback(chats);
    });
  },

  // Subscribe to rider's chats
  subscribeToRiderChats(riderId: string, callback: (chats: Chat[]) => void) {
    if (isDemoMode) {
      const interval = setInterval(async () => {
        const chats = Array.from(mockChatsStore.values())
          .filter(chat => chat.riderId === riderId)
          .sort((a, b) => (b.lastMessageAt?.getTime() || 0) - (a.lastMessageAt?.getTime() || 0));
        callback(chats);
      }, 1000);
      
      return () => clearInterval(interval);
    }

    const q = query(
      collection(db, CHATS_COLLECTION),
      where('riderId', '==', riderId),
      orderBy('lastMessageAt', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const chats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Chat);
      callback(chats);
    });
  },
};
