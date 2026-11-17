import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
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
import { AppShell } from '@/components/shell/AppShell';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ConfirmProvider } from '@/components/ConfirmDialog';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

const named = <K extends string>(loader: () => Promise<Record<K, React.ComponentType>>, name: K) =>
  lazy(() => loader().then(m => ({ default: m[name] })));

const Login = named(() => import('@/pages/Login'), 'Login');
const Register = named(() => import('@/pages/Register'), 'Register');
const Profile = named(() => import('@/pages/Profile'), 'Profile');
const CustomerHome = named(() => import('@/pages/CustomerHome'), 'CustomerHome');
const Orders = named(() => import('@/pages/Orders'), 'Orders');
const OrderDetail = named(() => import('@/pages/OrderDetail'), 'OrderDetail');
const RiderHome = named(() => import('@/pages/RiderHome'), 'RiderHome');
const RiderJobs = named(() => import('@/pages/RiderJobs'), 'RiderJobs');
const AdminDashboard = named(() => import('@/pages/AdminDashboard'), 'AdminDashboard');
const AdminUsers = named(() => import('@/pages/AdminUsers'), 'AdminUsers');
const AdminReports = named(() => import('@/pages/AdminReports'), 'AdminReports');
const UserDetail = named(() => import('@/pages/UserDetail'), 'UserDetail');
const ChatList = named(() => import('@/pages/Chat'), 'ChatList');
const ChatPage = named(() => import('@/pages/Chat'), 'ChatPage');

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

function FullScreenSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

/** Requires a signed-in user. */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  if (loading) return <FullScreenSpinner />;
  if (!currentUser) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

/** Restricts a route to some roles; others are sent to their dashboard. */
function RoleOnly({ roles, children }: { roles: UserRole[]; children: React.ReactNode }) {
  const { userData } = useAuth();
  if (!userData) return <FullScreenSpinner />;
  if (!roles.includes(userData.role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function RoleDashboard() {
  const { userData } = useAuth();
  switch (userData?.role) {
    case 'customer': return <CustomerHome />;
    case 'rider': return <RiderHome />;
    case 'admin': return <AdminDashboard />;
    default: return userData ? <Navigate to="/login" replace /> : <FullScreenSpinner />;
  }
}

function AppRoutes() {
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Full-screen chat (own header and composer) */}
        <Route
          path="/chat/:orderId"
          element={
            <ProtectedRoute>
              <RoleOnly roles={['customer', 'rider']}><ChatPage /></RoleOnly>
            </ProtectedRoute>
          }
        />

        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/dashboard" element={<RoleDashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<RoleOnly roles={['customer']}><Orders /></RoleOnly>} />
          <Route path="/chats" element={<RoleOnly roles={['customer', 'rider']}><ChatList /></RoleOnly>} />
          <Route path="/order/:orderId" element={<RoleOnly roles={['customer', 'rider', 'admin']}><OrderDetail /></RoleOnly>} />
          <Route path="/jobs" element={<RoleOnly roles={['rider']}><RiderJobs /></RoleOnly>} />
          <Route path="/users" element={<RoleOnly roles={['admin']}><AdminUsers /></RoleOnly>} />
          <Route path="/user/:userId" element={<RoleOnly roles={['admin']}><UserDetail /></RoleOnly>} />
          <Route path="/reports" element={<RoleOnly roles={['admin']}><AdminReports /></RoleOnly>} />
        </Route>

        <Route path="/customer" element={<Navigate to="/dashboard" replace />} />
        <Route path="/rider" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ThemeProvider>
          <MotionConfig reducedMotion="user">
            <ConfirmProvider>
              <AppRoutes />
              <Toaster richColors position="top-center" closeButton />
            </ConfirmProvider>
          </MotionConfig>
        </ThemeProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
