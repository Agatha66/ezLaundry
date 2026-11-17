import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  DollarSign,
  Star,
  CheckCircle2,
  TrendingUp,
  Bike,
  MapPin,
  Clock,
  ChevronRight,
  MessageCircle,
  Hash,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useRiderOrders, usePendingOrders } from '@/hooks/useOrders';
import { orderService, statusLabels } from '@/services/orderService';
import type { Order } from '@/types';

export function RiderHome() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { activeOrders, completedOrders, refresh: refreshRiderOrders } = useRiderOrders(userData?.uid);
  const { orders: pendingOrders, refresh: refreshPendingOrders } = usePendingOrders();
  const [acceptingOrder, setAcceptingOrder] = useState<string | null>(null);

  const today = new Date();
  const todayStr = today.toDateString();

  // Calculate stats
  const todayEarnings = completedOrders
    .filter(o => {
      if (!o.completedAt) return false;
      try {
        return new Date(o.completedAt).toDateString() === todayStr;
      } catch {
        return false;
      }
    })
    .reduce((sum, o) => sum + (o.deliveryFee || 0), 0);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const weeklyCompleted = completedOrders.filter(o => {
    if (!o.completedAt) return false;
    try {
      return new Date(o.completedAt) >= weekAgo;
    } catch {
      return false;
    }
  }).length;

  const handleAcceptOrder = async (order: Order) => {
    if (!userData) return;
    
    setAcceptingOrder(order.id);
    
    try {
      await orderService.acceptOrder(
        order.id,
        userData.uid,
        userData.displayName || 'Rider',
        userData.phone || ''
      );
      
      await refreshPendingOrders();
      await refreshRiderOrders();
      navigate('/jobs');
    } catch (err: any) {
      console.error('Failed to accept order:', err);
    } finally {
      setAcceptingOrder(null);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-teal rounded-full flex items-center justify-center">
                <Bike className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-foreground font-['Poppins']">ezLaundry</span>
            </Link>

            {/* User Info & Logout */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3">
                <Avatar className="w-9 h-9 bg-teal">
                  <AvatarFallback className="bg-teal text-white text-sm font-medium">
                    {userData?.displayName?.split(' ').map(n => n[0]).join('') || 'R'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{userData?.displayName}</p>
                  <p className="text-xs text-muted-foreground capitalize">rider</p>
                </div>
              </div>
              {/* <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-red-500 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
              </Button> */}
            </div>
          </div>
        </div>
      </header>

      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="visible"
        className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        {/* Welcome Section */}
        <motion.div variants={itemVariants} className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground font-['Poppins']">
            Good day, {userData?.displayName?.split(' ')[0] || 'Rider'}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            Ready to pick up some laundry today?
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-none shadow-sm bg-gradient-to-br from-[#1A7A7E] to-[#092635]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Active Jobs</p>
                  <p className="text-2xl font-semibold text-white">{activeOrders.length}</p>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Package className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Available</p>
                  <p className="text-2xl font-semibold text-foreground">{pendingOrders.length}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Today&apos;s Earnings</p>
                  <p className="text-2xl font-semibold text-foreground">RM{todayEarnings}</p>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Weekly Done</p>
                  <p className="text-2xl font-semibold text-foreground">{weeklyCompleted}</p>
                </div>
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/jobs', { state: { activeTab: 'active' } })}
              className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Bike className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground">My Jobs</span>
            </button>
            
            <button
              onClick={() => navigate('/chats')}
              className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-teal rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground">Messages</span>
            </button>
            
            <button
              onClick={() => navigate('/profile')}
              className="flex flex-col items-center gap-2 p-4 bg-card rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-navy rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-foreground">Profile</span>
            </button>
          </div>
        </motion.div>

        {/* Available Orders */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Available Orders</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/jobs', { state: { activeTab: 'available' } })}
              className="text-primary"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {pendingOrders.length > 0 ? (
            <div className="space-y-3">
              {pendingOrders.slice(0, 2).map((order) => (
                <AvailableOrderCard 
                  key={order.id} 
                  order={order}
                  onAccept={() => handleAcceptOrder(order)}
                  accepting={acceptingOrder === order.id}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl p-8 text-center">
              <AlertCircle className="w-12 h-12 text-border mx-auto mb-3" />
              <p className="text-muted-foreground">No available orders right now.</p>
              <p className="text-sm text-muted-foreground mt-1">Check back soon!</p>
            </div>
          )}
        </motion.div>

        {/* Active Jobs */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Your Active Jobs</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/jobs', { state: { activeTab: 'active' } })}
              className="text-primary"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {activeOrders.length > 0 ? (
            <div className="space-y-3">
              {activeOrders.slice(0, 2).map((order) => (
                <ActiveJobCard 
                  key={order.id} 
                  order={order}
                  onClick={() => navigate('/jobs', { state: { activeTab: 'active' } })}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card rounded-xl p-8 text-center">
              <Package className="w-12 h-12 text-border mx-auto mb-3" />
              <p className="text-muted-foreground">No active jobs right now.</p>
              <p className="text-sm text-muted-foreground mt-1">Accept an order to get started!</p>
            </div>
          )}
        </motion.div>

        {/* Performance Banner */}
        <motion.div variants={itemVariants} className="mt-6">
          <div className="bg-gradient-to-r from-[#1188E9] to-[#1A7A7E] rounded-xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Your Rating</p>
                <div className="flex items-center gap-2 mt-1">
                  <Star className="w-5 h-5 text-yellow-300 fill-yellow-300" />
                  <h3 className="text-2xl font-semibold">4.9</h3>
                </div>
                <p className="text-sm text-white/80 mt-1">Keep up the great work!</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

// Available Order Card
function AvailableOrderCard({ 
  order, 
  onAccept,
  accepting 
}: { 
  order: Order; 
  onAccept: () => void;
  accepting: boolean;
}) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(`/order/${order.id}`)}
      className="bg-card rounded-xl p-4 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Badge className="bg-yellow-100 text-yellow-700">
            ⏳ Looking for Rider
          </Badge>
          <p className="font-semibold text-foreground mt-2">
            {order.customerAddress.building}, {order.customerAddress.area}
          </p>
          <p className="text-sm text-muted-foreground">{order.customerAddress.street}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {new Date(order.pickupDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Hash className="w-4 h-4" />
              {order.declaredItemCount} items
            </span>
          </div>
        </div>
        <div className="text-right ml-4">
          <p className="text-lg font-semibold text-primary">
            RM{order.deliveryFee}
          </p>
          <p className="text-xs text-muted-foreground">Delivery fee</p>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation(); 
              onAccept();
            }}
            disabled={accepting}
            className="mt-3 bg-primary hover:bg-navy"
          >
            {accepting ? 'Accepting...' : 'Accept'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// Active Job Card
function ActiveJobCard({ 
  order
}: { 
  order: Order; 
  onClick: () => void;
}) {
  const navigate = useNavigate();
  const statusInfo = statusLabels[order.status];
  const canChat = order.riderId && ['accepted', 'picking-up', 'picked-up', 'to-laundry', 'at-laundry', 'washing', 'washed', 'delivering', 'delivered', 'completed'].includes(order.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => navigate(`/order/${order.id}`)}
      className="bg-card rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Badge className={statusInfo.color}>
            <span className="mr-1">{statusInfo.icon}</span>
            {statusInfo.label}
          </Badge>
          <p className="font-semibold text-foreground mt-2">{order.customerName}</p>
          <p className="text-sm text-muted-foreground">{order.customerAddress.building}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Hash className="w-4 h-4" />
              {order.declaredItemCount} items
              {order.actualItemCount !== undefined && (
                <span className="text-green-600 ml-1">(✓ {order.actualItemCount})</span>
              )}
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-primary">
            RM{order.deliveryFee}
          </p>
          <p className="text-xs text-muted-foreground">#{order.id.slice(-4)}</p>
          {canChat && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/chat/${order.id}`);
              }}
              className="mt-2 text-primary hover:bg-primary/10"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Chat
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
