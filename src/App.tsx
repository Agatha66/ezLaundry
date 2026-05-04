import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from '@/sections/Navbar';
import { Hero } from '@/sections/Hero';
import { HowItWorks } from '@/sections/HowItWorks';
import { Services } from '@/sections/Services';
import { Pricing } from '@/sections/Pricing';
import { CoverageAreas } from '@/sections/CoverageAreas';
import { WhyChooseUs } from '@/sections/WhyChooseUs';
import { Testimonials } from '@/sections/Testimonials';
import { FAQ } from '@/sections/FAQ';
import { CTA } from '@/sections/CTA';
import { Footer } from '@/sections/Footer';
import { Login } from '@/pages/Login';
import { Register } from '@/pages/Register';
import { Profile } from '@/pages/Profile';
import { CustomerHome } from '@/pages/CustomerHome';
import { Orders } from '@/pages/Orders';
import { RiderHome } from '@/pages/RiderHome';
import { RiderJobs } from '@/pages/RiderJobs';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { AdminUsers } from '@/pages/AdminUsers';
import { AdminReports } from '@/pages/AdminReports';
import { UserDetail } from '@/pages/UserDetail';
import { ChatList, ChatPage } from '@/pages/Chat';
import { OrderDetail } from '@/pages/OrderDetail';
import { MainLayout } from '@/components/MainLayout';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

// Landing Page Component
function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Services />
        <Pricing />
        <CoverageAreas />
        <WhyChooseUs />
        <Testimonials />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

// Protected Route Component
function ProtectedRoute({ 
  children, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  allowedRoles: UserRole[];
}) {
  const { currentUser, userData, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#1188E9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (userData && !allowedRoles.includes(userData.role)) {
    switch (userData.role) {
      case 'admin':
        return <Navigate to="/dashboard" replace />;
      case 'rider':
        return <Navigate to="/dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}

// Customer Dashboard Layout with Bottom Nav
function CustomerDashboardLayout() {
  return (
    <MainLayout userRole="customer">
      <CustomerHome />
    </MainLayout>
  );
}

// Customer Orders Page with Bottom Nav
function CustomerOrdersPage() {
  return (
    <MainLayout userRole="customer">
      <Orders />
    </MainLayout>
  );
}

// Customer Chats Page with Bottom Nav
function CustomerChatsPage() {
  return (
    <MainLayout userRole="customer">
      <ChatList />
    </MainLayout>
  );
}

// Customer Chat Detail Page — NO bottom nav (has its own fixed input)
function CustomerChatPage() {
  return <ChatPage />;
}

// Customer Profile Page with Bottom Nav
function CustomerProfilePage() {
  return (
    <MainLayout userRole="customer">
      <Profile />
    </MainLayout>
  );
}

// Rider Dashboard Layout with Bottom Nav
function RiderDashboardLayout() {
  return (
    <MainLayout userRole="rider">
      <RiderHome />
    </MainLayout>
  );
}

// Rider Jobs Page with Bottom Nav
function RiderJobsPage() {
  return (
    <MainLayout userRole="rider">
      <RiderJobs />
    </MainLayout>
  );
}

// Rider Chats Page with Bottom Nav
function RiderChatsPage() {
  return (
    <MainLayout userRole="rider">
      <ChatList />
    </MainLayout>
  );
}

// Rider Chat Detail Page — NO bottom nav (has its own fixed input)
function RiderChatPage() {
  return <ChatPage />;
}

// Rider Profile Page with Bottom Nav
function RiderProfilePage() {
  return (
    <MainLayout userRole="rider">
      <Profile />
    </MainLayout>
  );
}

// Customer Order Detail Page with Bottom Nav
function CustomerOrderDetailPage() {
  return (
    <MainLayout userRole="customer">
      <OrderDetail />
    </MainLayout>
  );
}

// Rider Order Detail Page with Bottom Nav
function RiderOrderDetailPage() {
  return (
    <MainLayout userRole="rider">
      <OrderDetail />
    </MainLayout>
  );
}

// Admin Home Page with Bottom Nav
function AdminHomePage() {
  return (
    <MainLayout userRole="admin">
      <AdminDashboard />
    </MainLayout>
  );
}

// Admin Users Page with Bottom Nav
function AdminUsersPage() {
  return (
    <MainLayout userRole="admin">
      <AdminUsers />
    </MainLayout>
  );
}

// Admin Reports Page with Bottom Nav
function AdminReportsPage() {
  return (
    <MainLayout userRole="admin">
      <AdminReports />
    </MainLayout>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboard - Role-based redirect */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['customer', 'rider', 'admin']}>
            <RoleBasedDashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Customer Routes */}
      <Route
        path="/orders"
        element={
          <ProtectedRoute allowedRoles={['customer']}>
            <CustomerOrdersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chats"
        element={
          <ProtectedRoute allowedRoles={['customer', 'rider']}>
            <RoleBasedChats />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat/:orderId"
        element={
          <ProtectedRoute allowedRoles={['customer', 'rider']}>
            <RoleBasedChat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute allowedRoles={['customer', 'rider', 'admin']}>
            <RoleBasedProfile />
          </ProtectedRoute>
        }
      />

      {/* Rider Routes */}
      <Route
        path="/jobs"
        element={
          <ProtectedRoute allowedRoles={['rider']}>
            <RiderJobsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/order/:orderId"
        element={
          <ProtectedRoute allowedRoles={['customer', 'rider']}>
            <RoleBasedOrderDetail />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/user/:userId"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminUserDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminReportsPage />
          </ProtectedRoute>
        }
      />

      {/* Legacy Routes - Redirect to new routes */}
      <Route path="/customer" element={<Navigate to="/dashboard" replace />} />
      <Route path="/rider" element={<Navigate to="/dashboard" replace />} />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Admin Profile Page with Bottom Nav
function AdminProfilePage() {
  return (
    <MainLayout userRole="admin">
      <Profile />
    </MainLayout>
  );
}

// Admin User Detail Page with Bottom Nav
function AdminUserDetailPage() {
  return (
    <MainLayout userRole="admin">
      <UserDetail />
    </MainLayout>
  );
}

// Role-based dashboard component
function RoleBasedDashboard() {
  const { userData } = useAuth();
  
  if (userData?.role === 'customer') {
    return <CustomerDashboardLayout />;
  }
  
  if (userData?.role === 'rider') {
    return <RiderDashboardLayout />;
  }
  
  if (userData?.role === 'admin') {
    return <AdminHomePage />;
  }
  
  return <Navigate to="/login" replace />;
}

// Role-based chats list component
function RoleBasedChats() {
  const { userData } = useAuth();
  
  if (userData?.role === 'customer') {
    return <CustomerChatsPage />;
  }
  
  if (userData?.role === 'rider') {
    return <RiderChatsPage />;
  }
  
  return <Navigate to="/dashboard" replace />;
}

// Role-based chat page component
function RoleBasedChat() {
  const { userData } = useAuth();
  
  if (userData?.role === 'customer') {
    return <CustomerChatPage />;
  }
  
  if (userData?.role === 'rider') {
    return <RiderChatPage />;
  }
  
  return <Navigate to="/dashboard" replace />;
}

// Role-based profile component
function RoleBasedProfile() {
  const { userData } = useAuth();
  
  if (userData?.role === 'customer') {
    return <CustomerProfilePage />;
  }
  
  if (userData?.role === 'rider') {
    return <RiderProfilePage />;
  }
  
  if (userData?.role === 'admin') {
    return <AdminProfilePage />;
  }
  
  return <Navigate to="/dashboard" replace />;
}

// Role-based order detail component
function RoleBasedOrderDetail() {
  const { userData } = useAuth();
  
  if (userData?.role === 'customer') {
    return <CustomerOrderDetailPage />;
  }
  
  if (userData?.role === 'rider') {
    return <RiderOrderDetailPage />;
  }
  
  return <Navigate to="/dashboard" replace />;
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
