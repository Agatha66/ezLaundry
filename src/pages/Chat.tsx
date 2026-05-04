import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Send, 
  Package, 
  Phone,
  Check,
  CheckCheck,
  Loader2,
  AlertCircle,
  Info,
  Bell,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services/chatService';
import { orderService, statusLabels } from '@/services/orderService';
import type { Chat, ChatMessage, Order } from '@/types';

/* ─── helpers ─── */
const toDate = (value: any): Date | null => {
  if (!value) return null;
  if (typeof value.toDate === 'function') return value.toDate();
  if (value instanceof Date) return value;
  return new Date(value);
};

const formatTime = (value: any): string => {
  const date = toDate(value);
  if (!date || isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth()  === b.getMonth()  &&
  a.getDate()   === b.getDate();

const formatDayDivider = (value: any): string => {
  const d = toDate(value);
  if (!d || isNaN(d.getTime())) return '';
  const now = new Date();
  if (isSameDay(d, now)) return 'Today';
  const y = new Date(); y.setDate(y.getDate() - 1);
  if (isSameDay(d, y)) return 'Yesterday';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
};

export function ChatList() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData) return;
    const unsubscribe =
      userData.role === 'customer'
        ? chatService.subscribeToCustomerChats(userData.uid, (c) => { setChats(c); setLoading(false); })
        : chatService.subscribeToRiderChats(userData.uid, (c) => { setChats(c); setLoading(false); });
    return () => unsubscribe();
  }, [userData]);

  const otherName = (c: Chat) => (userData?.role === 'customer' ? c.riderName : c.customerName) || 'User';
  const unread = (c: Chat) => (userData?.role === 'customer' ? c.unreadCountCustomer : c.unreadCountRider) || 0;

  if (loading) return (
    <div className="min-h-screen bg-[#F5F7F9] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#1188E9]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F5F7F9]">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-[#092635]">Messages</h1>
          <span className="text-sm text-[#4A6375]">{chats.length} conversations</span>
        </div>
      </header>
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-24">
        {chats.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-[#E6F4FF] rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-[#1188E9]" />
            </div>
            <h3 className="text-lg font-semibold text-[#092635]">No messages yet</h3>
            <p className="text-[#4A6375]">
              {userData?.role === 'customer'
                ? "Once a rider accepts your order, you can chat with them here."
                : "Once you accept an order, you can chat with the customer here."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => navigate(`/chat/${c.orderId}`)}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 bg-[#1188E9]">
                    <AvatarFallback className="bg-[#1188E9] text-white">
                      {otherName(c).charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-[#092635]">{otherName(c)}</h3>
                      {c.lastMessageAt && (
                        <span className="text-xs text-[#4A6375]">{formatTime(c.lastMessageAt)}</span>
                      )}
                    </div>
                    <p className="text-sm text-[#4A6375] truncate">Order #{c.orderId.slice(-4)}</p>
                    {c.lastMessage && (
                      <p className="text-sm text-[#4A6375] truncate mt-1">{c.lastMessage}</p>
                    )}
                  </div>
                  {unread(c) > 0 && (
                    <span className="bg-[#1188E9] text-white text-xs rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">
                      {unread(c)}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

/* ═════════════════════════════
   ChatPage
   ═════════════════════════════ */
export function ChatPage() {
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const { userData } = useAuth();

  const [chat, setChat]     = useState<Chat | null>(null);
  const [order, setOrder]   = useState<Order | null>(null);
  const [messages, setMsg]  = useState<ChatMessage[]>([]);
  const [text, setText]     = useState('');
  const [loading, setLoad]  = useState(true);
  const [sending, setSend]  = useState(false);
  const [error, setErr]     = useState<string | null>(null);
  const [justNavigated, setJustNavigated] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef   = useRef<HTMLDivElement>(null);
  const prevLenRef     = useRef(0);
  const unreadIdxRef   = useRef<number>(-1); // index of first unread msg

  /* ── load chat & order ── */
  useEffect(() => {
    if (!orderId || !userData) return;
    (async () => {
      try {
        setLoad(true); setErr(null);
        let c = await chatService.getChatByOrderId(orderId);
        const o = await orderService.getOrder(orderId);
        setOrder(o);

        if (!c && o?.riderId) {
          c = await chatService.createChat(orderId, o.customerId, o.customerName, o.riderId, o.riderName || 'Rider');
        }
        setChat(c || null);
      } catch (e) { setErr('Failed to load chat'); }
      finally { setLoad(false); }
    })();
  }, [orderId, userData]);

  /* ── subscribe to messages ── */
  useEffect(() => {
    if (!chat) return;
    if (userData) chatService.markAsRead(chat.id, userData.role, userData.uid).catch(() => {});
    const unsub = chatService.subscribeToMessages(chat.id, (m) => setMsg(m));
    return () => unsub();
  }, [chat, userData]);

  /* ── subscribe to order updates (LOCAL STATE ONLY — no system messages) ── */
  useEffect(() => {
    if (!orderId) return;
    const unsub = orderService.subscribeToOrder(orderId, (o) => {
      if (!o) return;
      setOrder(o);
    });
    return () => unsub();
  }, [orderId]);

  /* ── scroll behaviour ── */
  useEffect(() => {
    if (messages.length === 0) return;
    const isFirst   = prevLenRef.current === 0;
    const newCount  = messages.length - prevLenRef.current;
    const lastMine  = messages[messages.length - 1]?.senderId === userData?.uid;
    const container = containerRef.current;
    const nearBot   = container
      ? container.scrollHeight - container.scrollTop - container.clientHeight < 200
      : true;

    if (isFirst || lastMine || (nearBot && newCount > 0)) {
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: isFirst ? 'auto' : 'smooth' }), 50);
    }
    prevLenRef.current = messages.length;
  }, [messages, userData?.uid]);

  /* ── find first unread index ── */
  useEffect(() => {
    if (!userData) return;
    const idx = messages.findIndex(m => m.senderId !== userData.uid && !m.read);
    unreadIdxRef.current = idx;
  }, [messages, userData]);

  /* ── clear "just navigated" after first scroll ── */
  useEffect(() => {
    if (!loading && justNavigated) {
      const t = setTimeout(() => setJustNavigated(false), 1000);
      return () => clearTimeout(t);
    }
  }, [loading, justNavigated]);

  /* ── derived ── */
  const otherName = chat
    ? (userData?.role === 'customer' ? chat.riderName : chat.customerName) || 'User'
    : '';
  const otherPhone = order
    ? (userData?.role === 'customer' ? order.riderPhone : order.customerPhone)
    : '';

  /* ── send handler ── */
  const handleSend = async () => {
    if (!chat || !userData || !text.trim()) return;
    const content = text.trim();
    setText('');
    setSend(true);
    try {
      await chatService.sendMessage(chat.id, userData.uid, userData.displayName || 'User', userData.role, content);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    } catch (e) { setErr('Failed to send message'); }
    finally { setSend(false); }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  /* ── grouped messages for date dividers ── */
  const grouped = useMemo(() => {
    const groups: { type: 'day' | 'msg'; value?: string; message?: ChatMessage; isUnread?: boolean }[] = [];
    let lastDay = '';
    messages.forEach((m, i) => {
      const day = formatDayDivider(m.createdAt);
      if (day && day !== lastDay) {
        groups.push({ type: 'day', value: day });
        lastDay = day;
      }
      // Mark first unread message with a flag
      const isFirstUnread = i === unreadIdxRef.current && i >= 0 && m.senderId !== userData?.uid && !justNavigated;
      groups.push({ type: 'msg', message: m, isUnread: isFirstUnread });
    });
    return groups;
  }, [messages, userData?.uid, justNavigated]);

  if (loading) return (
    <div className="min-h-screen bg-[#F5F7F9] flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-[#1188E9]" />
    </div>
  );

  if (error || !chat) return (
    <div className="min-h-screen bg-[#F5F7F9] flex items-center justify-center">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-[#4A6375] mb-4">{error || 'Chat not available'}</p>
        <Button onClick={() => navigate('/chats')} className="bg-[#1188E9]">Back to Chats</Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#E8EDF2] flex flex-col">
      {/* ══ Header ══ */}
      <header className="bg-white shadow-sm sticky top-0 z-50 h-16 flex-shrink-0">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/chats')} className="text-[#4A6375]">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Avatar className="w-10 h-10 bg-[#1188E9]">
              <AvatarFallback className="bg-[#1188E9] text-white">{otherName.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="font-semibold text-[#092635] leading-tight">{otherName}</h1>
              <p className="text-xs text-[#4A6375]">Order #{orderId?.slice(-4)}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {otherPhone && (
              <a href={`tel:${otherPhone}`}>
                <Button variant="ghost" size="icon" className="text-[#1188E9]"><Phone className="w-5 h-5" /></Button>
              </a>
            )}
            {order && (
              <Button variant="ghost" size="sm" onClick={() => navigate(`/order/${orderId}`)} className="text-[#1188E9]">
                View Order
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* ══ Sticky Order Status Banner ══ */}
      {order && (
        <div className="bg-white border-b border-[#D8E5EF] sticky top-16 z-40">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2.5 h-2.5 rounded-full ${order.status === 'completed' ? 'bg-green-500' : order.status === 'cancelled' ? 'bg-red-500' : 'bg-[#1188E9]'}`} />
              <Package className="w-4 h-4 text-[#4A6375]" />
              <span className="text-sm text-[#092635] font-medium">
                {order.status === 'completed' ? 'Order Completed' :
                 order.status === 'delivered' ? 'Delivered — waiting for confirmation' :
                 order.status === 'cancelled' ? 'Order Cancelled' :
                 statusLabels[order.status]?.label || order.status}
              </span>
            </div>
            <span className="text-xs text-[#4A6375] bg-[#F5F7F9] px-2 py-1 rounded-md">#{order.id.slice(-6)}</span>
          </div>
        </div>
      )}

      {/* ══ Messages (darker background) ══ */}
      <main ref={containerRef} className="flex-1 overflow-y-auto bg-[#E8EDF2]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-36">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#D8E5EF] rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="w-8 h-8 text-[#1188E9]" />
              </div>
              <h3 className="text-lg font-semibold text-[#092635] mb-2">Start a conversation</h3>
              <p className="text-[#4A6375]">Send a message to {otherName}</p>
            </div>
          ) : (
            <div className="space-y-1">
              {grouped.map((item, idx) => {
                if (item.type === 'day') {
                  return (
                    <div key={`day-${idx}`} className="flex items-center gap-3 my-4">
                      <div className="flex-1 h-px bg-[#CBD5E1]" />
                      <span className="text-xs text-[#64748B] font-medium">{item.value}</span>
                      <div className="flex-1 h-px bg-[#CBD5E1]" />
                    </div>
                  );
                }
                const m = item.message!;
                const isMine = m.senderId === userData?.uid;

                /* ── system status message (text-only) ── */
                if (m.senderRole === 'system' && !m.imageUrl) {
                  return (
                    <div key={m.id} className="flex justify-center my-3">
                      <div className="flex items-center gap-2 bg-[#CBD5E1]/60 px-4 py-2 rounded-full">
                        <Info className="w-3.5 h-3.5 text-[#475569]" />
                        <span className="text-xs text-[#475569] font-medium">{m.content}</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={m.id}>
                    {/* ── unread divider ── */}
                    {item.isUnread && (
                      <div className="flex items-center gap-3 my-3">
                        <div className="flex-1 h-px bg-[#1188E9]" />
                        <span className="text-xs text-[#1188E9] font-semibold flex items-center gap-1">
                          <Bell className="w-3 h-3" /> New Messages
                        </span>
                        <div className="flex-1 h-px bg-[#1188E9]" />
                      </div>
                    )}

                    {/* ── message bubble ── */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${isMine ? 'justify-end' : 'justify-start'} py-0.5`}
                    >
                      <div className={`flex items-end gap-2 max-w-[80%] ${isMine ? 'flex-row-reverse' : ''}`}>
                        {/* Avatar (other party only, show on first of group) */}
                        {!isMine && (
                          <Avatar className="w-7 h-7 bg-[#1188E9] flex-shrink-0 mb-1">
                            <AvatarFallback className="bg-[#1188E9] text-white text-[10px]">
                              {m.senderName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div className={`px-3.5 py-2 rounded-2xl ${
                          isMine
                            ? 'bg-[#1188E9] text-white rounded-br-md'
                            : 'bg-white text-[#092635] rounded-bl-md shadow-sm border border-[#E2E8F0]'
                        }`}>
                          {/* ── image message ── */}
                          {m.imageUrl && (
                            <div className="mb-1.5">
                              <p className="text-xs mb-1.5 opacity-80">{m.content}</p>
                              <img
                                src={m.imageUrl}
                                alt="Delivery photo"
                                className="max-w-full rounded-xl cursor-pointer hover:opacity-90 transition-opacity"
                                style={{ maxHeight: '200px' }}
                                onClick={() => m.imageUrl && setPreviewImage(m.imageUrl)}
                              />
                            </div>
                          )}
                          {/* ── text message ── */}
                          {!m.imageUrl && (
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{m.content}</p>
                          )}
                          <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : ''}`}>
                            <span className={`text-[11px] ${isMine ? 'text-white/60' : 'text-[#94A3B8]'}`}>
                              {formatTime(m.createdAt)}
                            </span>
                            {/* ── read / sent indicator ── */}
                            {isMine && (
                              m.read
                                ? <CheckCheck className="w-3.5 h-3.5 text-white/70" />
                                : <Check className="w-3.5 h-3.5 text-white/50" />
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </main>

      {/* ══ Input ══ */}
      <footer className="bg-white border-t border-[#D8E5EF] fixed bottom-0 left-0 right-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder={`Message ${otherName}...`}
              className="flex-1 h-12 rounded-full border-[#D8E5EF] focus:border-[#1188E9] px-5 bg-[#F5F7F9] focus:bg-white"
              disabled={sending}
            />
            <Button
              onClick={handleSend}
              disabled={!text.trim() || sending}
              className="w-12 h-12 rounded-full bg-[#1188E9] hover:bg-[#092635] p-0 flex items-center justify-center disabled:opacity-50"
            >
              {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </footer>

      {/* ══ Image Preview Modal ══ */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-[101]"
            onClick={() => setPreviewImage(null)}
          >
            <X className="w-6 h-6" />
          </Button>
          <img
            src={previewImage}
            alt="Full size"
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
