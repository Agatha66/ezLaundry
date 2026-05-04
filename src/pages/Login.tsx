import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shirt, ArrowLeft, User, Bike, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authService } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

const roleOptions: { value: UserRole; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'customer', label: 'Customer', icon: User, description: 'Book laundry services' },
  { value: 'rider', label: 'Rider', icon: Bike, description: 'Pickup & deliver laundry' },
  { value: 'admin', label: 'Admin', icon: Shield, description: 'Manage operations' },
];

export function Login() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await authService.login(email, password);
      
      // Get user data to check actual role
      const userData = await authService.getUserData(user.uid);
      
      if (!userData) {
        setError('User data not found. Please contact support.');
        await logout();
        setLoading(false);
        return;
      }
      
      // Validate that selected role matches actual role
      if (userData.role !== selectedRole) {
        setError(`This account is registered as a ${userData.role}. Please select the correct role.`);
        await logout();
        setLoading(false);
        return;
      }
      
      // Redirect based on role
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F4FF] via-white to-[#E6F4FF] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[#4A6375] hover:text-[#1188E9] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#1188E9] rounded-full flex items-center justify-center mx-auto mb-4">
              <Shirt className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-[#092635] font-['Poppins']">
              Welcome Back
            </h1>
            <p className="text-[#4A6375] mt-1">Sign in to your ezLaundry account</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <Label className="text-[#092635] font-medium mb-3 block">I am a:</Label>
            <div className="grid grid-cols-3 gap-2">
              {roleOptions.map((role) => (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setSelectedRole(role.value)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 ${
                    selectedRole === role.value
                      ? 'border-[#1188E9] bg-[#E6F4FF]'
                      : 'border-[#D8E5EF] hover:border-[#1188E9]/50'
                  }`}
                >
                  <role.icon
                    className={`w-5 h-5 ${
                      selectedRole === role.value ? 'text-[#1188E9]' : 'text-[#4A6375]'
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      selectedRole === role.value ? 'text-[#1188E9]' : 'text-[#4A6375]'
                    }`}
                  >
                    {role.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-[#092635] font-medium">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 h-12 rounded-xl border-[#D8E5EF] focus:border-[#1188E9] focus:ring-[#1188E9]"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-[#092635] font-medium">
                Password
              </Label>
              <div className="relative mt-1.5">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 rounded-xl border-[#D8E5EF] focus:border-[#1188E9] focus:ring-[#1188E9] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#4A6375] hover:text-[#1188E9] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm"
              >
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-[#1188E9] hover:bg-[#092635] text-white rounded-full font-medium transition-all duration-300"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#D8E5EF]" />
            <span className="text-sm text-[#4A6375]">or</span>
            <div className="flex-1 h-px bg-[#D8E5EF]" />
          </div>

          {/* Register Link */}
          <p className="text-center text-[#4A6375]">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-[#1188E9] hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
