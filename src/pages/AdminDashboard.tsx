import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Shirt, 
  LogOut, 
  Package, 
  Users, 
  Bike, 
  DollarSign, 
  CheckCircle2,
  BarChart3,
  Settings,
  Clock,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useAllOrders } from '@/hooks/useOrders';
import { statusLabels } from '@/services/orderService';
import type { Order } from '@/types';

export function AdminDashboard() {
  const navigate = useNavigate();
  const { userData, logout } = useAuth();
  const { orders, loading } = useAllOrders();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Calculate stats
  const pendingOrders = orders.filter(o => o.status === 'pending');
  const activeOrders = orders.filter(o => 
    !['completed', 'cancelled', 'delivered'].includes(o.status)
  );
  const completedOrders = orders.filter(o => 
    ['completed', 'delivered'].includes(o.status)
  );
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + (o.finalPrice || o.estimatedPrice), 0);

  // Mock rider and customer stats
  const activeRiders = new Set(activeOrders.map(o => o.riderId).filter(Boolean)).size;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card shadow-sm sticky top-0 z-50">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <Shirt className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-foreground font-['Poppins']">ezLaundry</span>
            </Link>

            <div className="flex items-center gap-2">
              <Link to="/profile">
                <Button variant="ghost" className="text-muted-foreground hover:text-primary hover:bg-primary/10">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Button>
              </Link>
              <Badge className="bg-navy text-white ml-2">
                <Settings className="w-3 h-3 mr-1" />
                Admin
              </Badge>
              <Avatar className="w-9 h-9 bg-navy">
                <AvatarFallback className="bg-navy text-white text-sm font-medium">
                  {userData?.displayName?.split(' ').map(n => n[0]).join('') || 'A'}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-muted-foreground hover:text-red-500 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground font-['Poppins']">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Overview of ezLaundry operations
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <Card className="border-none shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Orders</p>
                    <p className="text-2xl font-semibold text-foreground">{orders.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="text-2xl font-semibold text-foreground">{pendingOrders.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-50 rounded-xl flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-semibold text-foreground">{activeOrders.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                    <Bike className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-semibold text-foreground">{completedOrders.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Revenue</p>
                    <p className="text-2xl font-semibold text-foreground">RM{totalRevenue}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Riders</p>
                    <p className="text-2xl font-semibold text-foreground">{activeRiders}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            <Button className="h-auto py-4 bg-primary hover:bg-navy rounded-xl flex flex-col items-center gap-2">
              <Package className="w-6 h-6" />
              <span className="text-sm">Manage Orders</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 rounded-xl flex flex-col items-center gap-2 border-border">
              <Users className="w-6 h-6" />
              <span className="text-sm">Customers</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 rounded-xl flex flex-col items-center gap-2 border-border">
              <Bike className="w-6 h-6" />
              <span className="text-sm">Riders</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 rounded-xl flex flex-col items-center gap-2 border-border">
              <BarChart3 className="w-6 h-6" />
              <span className="text-sm">Reports</span>
            </Button>
          </div>

          {/* Orders Tabs */}
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-6">
              <TabsTrigger value="pending">
                Pending ({pendingOrders.length})
              </TabsTrigger>
              <TabsTrigger value="active">
                Active ({activeOrders.length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({completedOrders.length})
              </TabsTrigger>
              <TabsTrigger value="all">
                All ({orders.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pending">
              <OrdersList orders={pendingOrders} loading={loading} />
            </TabsContent>

            <TabsContent value="active">
              <OrdersList orders={activeOrders} loading={loading} />
            </TabsContent>

            <TabsContent value="completed">
              <OrdersList orders={completedOrders} loading={loading} />
            </TabsContent>

            <TabsContent value="all">
              <OrdersList orders={orders} loading={loading} />
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
}

// Orders List Component
function OrdersList({ orders, loading }: { orders: Order[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-24 bg-card rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-xl">
        <Package className="w-12 h-12 text-border mx-auto mb-4" />
        <p className="text-muted-foreground">No orders in this category</p>
      </div>
    );
  }

  const serviceNames: Record<string, string> = {
    'wash-fold': 'Wash & Fold',
    'wash-iron': 'Wash & Iron',
    'dry-clean': 'Dry Clean',
  };

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-xl p-5 shadow-sm"
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge className={statusLabels[order.status].color}>
                  <span className="mr-1">{statusLabels[order.status].icon}</span>
                  {statusLabels[order.status].label}
                </Badge>
                {order.riderName && (
                  <Badge variant="outline" className="border-border">
                    <Bike className="w-3 h-3 mr-1" />
                    {order.riderName}
                  </Badge>
                )}
              </div>
              <p className="font-semibold text-foreground mt-2">
                {order.customerName} • {serviceNames[order.serviceType]}
              </p>
              <p className="text-sm text-muted-foreground">
                {order.customerAddress.building}, {order.customerAddress.area}
              </p>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {new Date(order.pickupDate).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  {order.weight || order.estimatedWeight} kg
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-foreground">
                RM{order.finalPrice || order.estimatedPrice}
              </p>
              <p className="text-xs text-muted-foreground">#{order.id}</p>
              <Badge 
                variant={order.paymentStatus === 'paid' ? 'default' : 'secondary'}
                className="mt-2"
              >
                {order.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
              </Badge>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
