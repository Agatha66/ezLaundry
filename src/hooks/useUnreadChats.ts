import { useState, useEffect } from 'react';
import { chatService } from '@/services/chatService';
import type { Chat } from '@/types';

export function useUnreadChats(userId: string | undefined, userRole: 'customer' | 'rider' | 'admin') {
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (!userId || userRole === 'admin') return;

    const subscribe =
      userRole === 'customer'
        ? chatService.subscribeToCustomerChats
        : chatService.subscribeToRiderChats;

    const unsubscribe = subscribe(userId, (chats: Chat[]) => {
      const count = chats.reduce((sum, chat) => {
        const unreadCount =
          userRole === 'customer'
            ? chat.unreadCountCustomer || 0
            : chat.unreadCountRider || 0;
        return sum + unreadCount;
      }, 0);
      setTotalUnread(count);
    });

    return () => unsubscribe();
  }, [userId, userRole]);

  return totalUnread;
}
