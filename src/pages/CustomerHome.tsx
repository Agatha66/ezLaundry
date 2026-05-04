import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, 
  MapPin, 
  CreditCard, 
  Plus,
  Star,
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  Hash,
  TrendingUp,
  Calendar,
  Shirt
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomerOrders } from '@/hooks/useOrders';
import { CreateOrderDialog } from '@/components/CreateOrderDialog';
import { statusLabels } from '@/services/orderService';
import type { Order } from '@/types';

export function CustomerHome() {
  const navigate = useNavigate();
  const { userData } = useAuth();
  const { orders, refresh } = useCustomerOrders(userData?.uid);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleOrderCreated = () => {
    refresh();
    setIsCreateDialogOpen(false);
  };

  // Calculate stats
  const activeOrders = orders.filter(o => 
    !['completed', 'cancelled', 'delivered'].includes(o.status)
  );
  const completedOrders = orders.filter(o => 
    ['completed', 'delivered'].includes(o.status)
  );
  const totalSpent = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  // Get recent orders (last 3)
  const recentOrders = orders.slice(0, 3);

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
    <div className="min-h-screen bg-[#F5F7F9]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#1188E9] rounded-full flex items-center justify-center">
                <Shirt className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-[#092635] font-['Poppins']">ezLaundry</span>
            </Link>

            {/* User Info & Logout */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-3">
                <Avatar className="w-9 h-9 bg-[#1188E9]">
                  <AvatarFallback className="bg-[#1188E9] text-white text-sm font-medium">
                    {userData?.displayName?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-right">
                  <p className="text-sm font-medium text-[#092635]">{userData?.displayName}</p>
                  <p className="text-xs text-[#4A6375] capitalize">customer</p>
                </div>
              </div>
              {/* <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-[#4A6375] hover:text-red-500 hover:bg-red-50"
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
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#092635] font-['Poppins']">
            Good day, {userData?.displayName?.split(' ')[0] || 'Customer'}! 👋
          </h1>
          <p className="text-[#4A6375] mt-1">
            Here&apos;s what&apos;s happening with your laundry
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-none shadow-sm bg-gradient-to-br from-[#1188E9] to-[#092635]">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/70">Active Orders</p>
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
                  <p className="text-sm text-[#4A6375]">Completed</p>
                  <p className="text-2xl font-semibold text-[#092635]">{completedOrders.length}</p>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#4A6375]">Total Spent</p>
                  <p className="text-2xl font-semibold text-[#092635]">RM{totalSpent}</p>
                </div>
                <div className="w-10 h-10 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#4A6375]">Loyalty Points</p>
                  <p className="text-2xl font-semibold text-[#092635]">{completedOrders.length * 10}</p>
                </div>
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Star className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => setIsCreateDialogOpen(true)}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-[#1188E9] rounded-xl flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-[#092635]">New Order</span>
            </button>
            
            <button
              onClick={() => navigate('/orders')}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-[#1A7A7E] rounded-xl flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-[#092635]">My Orders</span>
            </button>
            
            <button
              onClick={() => navigate('/chats')}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-[#092635] rounded-xl flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-[#092635]">Messages</span>
            </button>
            
            <button
              onClick={() => navigate('/profile')}
              className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-[#4A6375] rounded-xl flex items-center justify-center">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-[#092635]">Addresses</span>
            </button>
          </div>
        </motion.div>

        {/* Recent Orders */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[#092635]">Recent Orders</h2>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/orders')}
              className="text-[#1188E9]"
            >
              View All
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          {recentOrders.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-xl">
              <Package className="w-12 h-12 text-[#D8E5EF] mx-auto mb-4" />
              <p className="text-[#4A6375]">No orders yet</p>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)}
                className="mt-4 bg-[#1188E9] hover:bg-[#092635]"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Order
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <OrderCard 
                  key={order.id} 
                  order={order} 
                  onClick={() => navigate(`/order/${order.id}`)}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Promotional Banner */}
        <motion.div variants={itemVariants} className="mt-6">
          <div className="bg-gradient-to-r from-[#1A7A7E] to-[#1188E9] rounded-xl p-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Special Offer</p>
                <h3 className="text-lg font-semibold mt-1">Get 10% off your next order!</h3>
                <p className="text-sm text-white/80 mt-1">Use code: EZLAUNDRY10</p>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Create Order Dialog */}
      <CreateOrderDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onOrderCreated={handleOrderCreated}
      />
    </div>
  );
}

// Order Card Component
function OrderCard({ order, onClick }: { order: Order; onClick: () => void }) {
  const navigate = useNavigate();
  const statusInfo = statusLabels[order.status];
  const serviceNames: Record<string, string> = {
    'wash-fold': 'Wash & Fold',
    'wash-iron': 'Wash & Iron',
    'dry-clean': 'Dry Clean',
  };

  const canChat = order.riderId && ['accepted', 'picking-up', 'picked-up', 'to-laundry', 'at-laundry', 'washing', 'washed', 'delivering', 'delivered', 'completed'].includes(order.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onClick}
      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <Badge className={statusInfo.color}>
              <span className="mr-1">{statusInfo.icon}</span>
              {statusInfo.label}
            </Badge>
          </div>
          <p className="font-semibold text-[#092635] mt-2">{serviceNames[order.serviceType]}</p>
          <p className="text-sm text-[#4A6375]">Order #{order.id.slice(-4)}</p>
          <div className="flex items-center gap-4 mt-2 text-sm text-[#4A6375]">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {new Date(order.pickupDate).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Hash className="w-4 h-4" />
              {order.declaredItemCount} items
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-[#092635]">
            RM{order.totalAmount}
          </p>
          <p className="text-sm text-[#4A6375]">{order.weight || order.estimatedWeight} kg</p>
          {canChat && (
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/chat/${order.id}`);
              }}
              className="mt-2 text-[#1188E9] hover:bg-[#E6F4FF]"
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
