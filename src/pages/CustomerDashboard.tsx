import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shirt, 
  LogOut, 
  Package, 
  MapPin, 
  CreditCard, 
  Plus,
  Clock3,
  RotateCcw,
  User,
  Hash,
  ChevronRight,
  MessageCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useCustomerOrders } from '@/hooks/useOrders';
import { CreateOrderDialog } from '@/components/CreateOrderDialog';
import { statusLabels } from '@/services/orderService';
import type { Order } from '@/types';

const quickActions = [
  { icon: Plus, label: 'New Order', color: 'bg-[#1188E9]', action: 'create' },
  { icon: Package, label: 'My Orders', color: 'bg-[#1A7A7E]', action: 'orders' },
  { icon: CreditCard, label: 'Payments', color: 'bg-[#092635]', action: 'payments' },
  { icon: MapPin, label: 'Addresses', color: 'bg-[#4A6375]', action: 'addresses' },
];

export function CustomerDashboard() {
  const navigate = useNavigate();
  const { userData, logout } = useAuth();
  const { orders, loading, refresh } = useCustomerOrders(userData?.uid);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleOrderCreated = () => {
    refresh();
    alert('Order created successfully!');
  };

  const activeOrders = orders.filter(o => 
    !['completed', 'cancelled', 'delivered'].includes(o.status)
  );
  const completedOrders = orders.filter(o => 
    ['completed', 'delivered'].includes(o.status)
  );
  const totalSpent = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
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
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#1188E9] rounded-full flex items-center justify-center">
                <Shirt className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-[#092635] font-['Poppins']">ezLaundry</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Button variant="ghost" className="text-[#4A6375] hover:text-[#1188E9] hover:bg-[#E6F4FF]">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Avatar className="w-9 h-9 bg-[#1188E9]">
                <AvatarFallback className="bg-[#1188E9] text-white text-sm font-medium">
                  {userData?.displayName?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-[#4A6375] hover:text-red-500 hover:bg-red-50">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants} className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-[#092635] font-['Poppins']">
              Welcome back, {userData?.displayName?.split(' ')[0] || 'Customer'}!
            </h1>
            <p className="text-[#4A6375] mt-1">Here's what's happening with your laundry</p>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={itemVariants} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="border-none shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-[#4A6375]">Active Orders</p>
                <p className="text-2xl font-semibold text-[#092635]">{activeOrders.length}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-[#4A6375]">Completed</p>
                <p className="text-2xl font-semibold text-[#092635]">{completedOrders.length}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-[#4A6375]">Total Spent</p>
                <p className="text-2xl font-semibold text-[#092635]">RM{totalSpent}</p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-[#4A6375]">Loyalty Points</p>
                <p className="text-2xl font-semibold text-[#092635]">{completedOrders.length * 10}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {quickActions.map((action) => (
              <motion.button
                key={action.label}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => action.action === 'create' && setIsCreateDialogOpen(true)}
                className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all"
              >
                <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                  <action.icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-medium text-[#092635]">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>

          {/* Orders Tabs */}
          <motion.div variants={itemVariants}>
            <Tabs defaultValue="active" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="active">Active ({activeOrders.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedOrders.length})</TabsTrigger>
                <TabsTrigger value="all">All ({orders.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="active">
                <OrdersList orders={activeOrders} loading={loading} emptyMessage="No active orders. Create a new order to get started!" />
              </TabsContent>
              <TabsContent value="completed">
                <OrdersList orders={completedOrders} loading={loading} emptyMessage="No completed orders yet." />
              </TabsContent>
              <TabsContent value="all">
                <OrdersList orders={orders} loading={loading} emptyMessage="No orders yet. Create your first order!" />
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </main>

      <CreateOrderDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onOrderCreated={handleOrderCreated}
      />
    </div>
  );
}

function OrdersList({ orders, loading, emptyMessage }: { orders: Order[], loading: boolean, emptyMessage: string }) {
  if (loading) return <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)}</div>;
  if (orders.length === 0) return <div className="text-center py-12 bg-white rounded-xl"><Package className="w-12 h-12 text-[#D8E5EF] mx-auto mb-4" /><p className="text-[#4A6375]">{emptyMessage}</p></div>;
  
  return (
    <div className="space-y-4">
      {orders.map(order => (
        <OrderCard key={order.id} order={order} />
      ))}
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const navigate = useNavigate();
  const statusInfo = statusLabels[order.status];
  const serviceNames: Record<string, string> = {
    'wash-fold': 'Wash & Fold',
    'wash-iron': 'Wash & Iron',
    'dry-clean': 'Dry Clean',
  };
  const canChat = order.riderId && order.status !== 'pending';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-5 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-[#E6F4FF] rounded-xl flex items-center justify-center flex-shrink-0">
            <Package className="w-6 h-6 text-[#1188E9]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-[#092635]">{serviceNames[order.serviceType]}</p>
              <Badge className={statusInfo.color}>
                <span className="mr-1">{statusInfo.icon}</span>
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-sm text-[#4A6375] mt-1">Order #{order.id.slice(-4)}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-[#4A6375]">
              <span className="flex items-center gap-1"><Clock3 className="w-4 h-4" />{new Date(order.pickupDate).toLocaleDateString()}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{order.customerAddress.area}</span>
              <span className="flex items-center gap-1"><Hash className="w-4 h-4" />{order.declaredItemCount} items</span>
            </div>
            {order.riderName && <p className="text-sm text-[#1188E9] mt-2">Rider: {order.riderName}</p>}
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-[#092635]">RM{order.finalPrice || order.estimatedPrice}</p>
          <p className="text-sm text-[#4A6375]">{order.weight || order.estimatedWeight} kg</p>
          <div className="flex gap-2 mt-2 justify-end">
            {canChat && (
              <Button size="sm" variant="outline" onClick={() => navigate(`/chat/${order.id}`)} className="border-[#1188E9] text-[#1188E9]">
                <MessageCircle className="w-4 h-4 mr-1" /> Chat
              </Button>
            )}
            <Button size="sm" onClick={() => navigate(`/order/${order.id}`)} className="bg-[#1188E9] hover:bg-[#092635]">
              View <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-[#F5F7F9]">
        <OrderStatusProgress status={order.status} />
      </div>
    </motion.div>
  );
}

function OrderStatusProgress({ status }: { status: string }) {
  const statusOrder = ['pending', 'accepted', 'picking-up', 'picked-up', 'to-laundry', 'at-laundry', 'washing', 'washed', 'delivering', 'delivered', 'completed'];
  const currentIndex = statusOrder.indexOf(status);
  if (status === 'cancelled') return <div className="flex items-center gap-2 text-red-600"><RotateCcw className="w-4 h-4" /><span className="text-sm">Order cancelled</span></div>;
  
  const stages = [
    { key: 'pending', label: 'Ordered', icon: '📝' },
    { key: 'picking-up', label: 'Pickup', icon: '🛵' },
    { key: 'washing', label: 'Washing', icon: '🫧' },
    { key: 'delivering', label: 'Delivery', icon: '📦' },
    { key: 'completed', label: 'Done', icon: '✅' },
  ];
  
  const getStageStatus = (stageKey: string) => {
    const stageIndex = statusOrder.indexOf(stageKey);
    return currentIndex >= stageIndex ? 'completed' : 'pending';
  };
  
  return (
    <div className="flex items-center justify-between">
      {stages.map((stage, index) => {
        const stageStatus = getStageStatus(stage.key);
        const isLast = index === stages.length - 1;
        return (
          <div key={stage.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${stageStatus === 'completed' ? 'bg-[#1188E9] text-white' : 'bg-[#F5F7F9] text-[#4A6375]'}`}>
                {stage.icon}
              </div>
              <span className="text-xs text-[#4A6375] mt-1">{stage.label}</span>
            </div>
            {!isLast && <div className={`w-8 h-0.5 mx-1 ${stageStatus === 'completed' ? 'bg-[#1188E9]' : 'bg-[#D8E5EF]'}`} />}
          </div>
        );
      })}
    </div>
  );
}