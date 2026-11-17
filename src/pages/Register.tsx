import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Shirt, ArrowLeft, User, Bike, Shield, Check, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole, Address } from '@/types';

const roleOptions: { value: UserRole; label: string; icon: React.ElementType; description: string }[] = [
  { value: 'customer', label: 'Customer', icon: User, description: 'Book laundry services' },
  { value: 'rider', label: 'Rider', icon: Bike, description: 'Pickup & deliver laundry' },
  { value: 'admin', label: 'Admin', icon: Shield, description: 'Manage operations' },
];

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [address, setAddress] = useState<Address>({
    street: '',
    unit: '',
    building: '',
    area: 'Damansara Perdana',
    city: 'Petaling Jaya',
    postcode: '',
  });
  const [selectedRole, setSelectedRole] = useState<UserRole>('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.name]: e.target.value });
  };

  const validateStep1 = () => {
    if (!formData.fullName || !formData.email || !formData.phone) {
      setError('Please fill in all required fields');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }
    return true;
  };

  const validateAddress = () => {
    if (!address.street || !address.building || !address.postcode) {
      setError('Please fill in all required address fields');
      return false;
    }
    return true;
  };

  const handleNext = () => {
    setError('');
    if (selectedRole === 'customer') {
      if (step === 1 && validateStep1()) {
        setStep(2);
      } else if (step === 2 && validateAddress()) {
        setStep(3);
      }
    } else {
      if (validateStep1()) {
        setStep(2);
      }
    }
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!agreedToTerms) {
      setError('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      const additionalData: any = { phone: formData.phone };
      
      // Add address for customers
      if (selectedRole === 'customer') {
        additionalData.address = address;
      }

      await register(
        formData.email,
        formData.password,
        formData.fullName,
        selectedRole,
        additionalData
      );

      // Registration successful — go to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already registered. Please sign in instead.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-4">
      {/* Role Selection */}
      <div className="mb-6">
        <Label className="text-foreground font-medium mb-3 block">I want to register as:</Label>
        <div className="grid grid-cols-3 gap-2">
          {roleOptions.map((role) => (
            <button
              key={role.value}
              type="button"
              onClick={() => setSelectedRole(role.value)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-300 ${
                selectedRole === role.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              <role.icon
                className={`w-5 h-5 ${
                  selectedRole === role.value ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`text-xs font-medium ${
                  selectedRole === role.value ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {role.label}
              </span>
            </button>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-2">
          {roleOptions.find(r => r.value === selectedRole)?.description}
        </p>
      </div>

      <div>
        <Label htmlFor="fullName" className="text-foreground font-medium">
          Full Name *
        </Label>
        <Input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="John Doe"
          value={formData.fullName}
          onChange={handleChange}
          required
          className="mt-1.5 h-12 rounded-xl border-border focus:border-primary focus:ring-primary"
        />
      </div>

      <div>
        <Label htmlFor="email" className="text-foreground font-medium">
          Email Address *
        </Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={handleChange}
          required
          className="mt-1.5 h-12 rounded-xl border-border focus:border-primary focus:ring-primary"
        />
      </div>

      <div>
        <Label htmlFor="phone" className="text-foreground font-medium">
          Phone Number *
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          placeholder="+60 12-345-6789"
          value={formData.phone}
          onChange={handleChange}
          required
          className="mt-1.5 h-12 rounded-xl border-border focus:border-primary focus:ring-primary"
        />
      </div>

      <div>
        <Label htmlFor="password" className="text-foreground font-medium">
          Password *
        </Label>
        <div className="relative mt-1.5">
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            className="h-12 rounded-xl border-border focus:border-primary focus:ring-primary pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <div>
        <Label htmlFor="confirmPassword" className="text-foreground font-medium">
          Confirm Password *
        </Label>
        <div className="relative mt-1.5">
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="h-12 rounded-xl border-border focus:border-primary focus:ring-primary pr-10"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <Button
        type="button"
        onClick={handleNext}
        className="w-full h-12 bg-primary hover:bg-navy text-white rounded-full font-medium"
      >
        {selectedRole === 'customer' ? 'Next: Add Address' : 'Next: Review'}
      </Button>
    </div>
  );

  const renderAddressStep = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <MapPin className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Your Address</h3>
      </div>
      <p className="text-sm text-muted-foreground">This will be your default pickup address</p>

      <div>
        <Label htmlFor="street" className="text-foreground font-medium">
          Street Address *
        </Label>
        <Input
          id="street"
          name="street"
          type="text"
          placeholder="e.g., Jalan PJU 8/1"
          value={address.street}
          onChange={handleAddressChange}
          required
          className="mt-1.5 h-12 rounded-xl border-border focus:border-primary focus:ring-primary"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="unit" className="text-foreground font-medium">
            Unit/Floor
          </Label>
          <Input
            id="unit"
            name="unit"
            type="text"
            placeholder="e.g., Unit 5-2"
            value={address.unit}
            onChange={handleAddressChange}
            className="mt-1.5 h-12 rounded-xl border-border focus:border-primary focus:ring-primary"
          />
        </div>
        <div>
          <Label htmlFor="building" className="text-foreground font-medium">
            Building/Block *
          </Label>
          <Input
            id="building"
            name="building"
            type="text"
            placeholder="e.g., Perdana Exclusive"
            value={address.building}
            onChange={handleAddressChange}
            required
            className="mt-1.5 h-12 rounded-xl border-border focus:border-primary focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="area" className="text-foreground font-medium">
            Area
          </Label>
          <Input
            id="area"
            name="area"
            type="text"
            value={address.area}
            onChange={handleAddressChange}
            className="mt-1.5 h-12 rounded-xl border-border focus:border-primary focus:ring-primary"
          />
        </div>
        <div>
          <Label htmlFor="postcode" className="text-foreground font-medium">
            Postcode *
          </Label>
          <Input
            id="postcode"
            name="postcode"
            type="text"
            placeholder="e.g., 47820"
            value={address.postcode}
            onChange={handleAddressChange}
            required
            className="mt-1.5 h-12 rounded-xl border-border focus:border-primary focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="city" className="text-foreground font-medium">
          City
        </Label>
        <Input
          id="city"
          name="city"
          type="text"
          value={address.city}
          onChange={handleAddressChange}
          className="mt-1.5 h-12 rounded-xl border-border focus:border-primary focus:ring-primary"
        />
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          className="flex-1 h-12 rounded-full border-border"
        >
          Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          className="flex-1 h-12 bg-primary hover:bg-navy text-white rounded-full font-medium"
        >
          Next: Review
        </Button>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">Review Your Information</h3>
      
      <div className="bg-background rounded-xl p-4 space-y-3">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Name</span>
          <span className="text-foreground font-medium">{formData.fullName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Email</span>
          <span className="text-foreground">{formData.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Phone</span>
          <span className="text-foreground">{formData.phone}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Role</span>
          <span className="text-foreground capitalize">{selectedRole}</span>
        </div>
        
        {selectedRole === 'customer' && (
          <>
            <div className="border-t border-border pt-3 mt-3">
              <p className="text-sm font-medium text-foreground mb-2">Default Address:</p>
              <p className="text-sm text-muted-foreground">{address.building}</p>
              <p className="text-sm text-muted-foreground">{address.street}</p>
              {address.unit && <p className="text-sm text-muted-foreground">{address.unit}</p>}
              <p className="text-sm text-muted-foreground">{address.area}, {address.city} {address.postcode}</p>
            </div>
          </>
        )}
      </div>

      {/* Terms Checkbox */}
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={() => setAgreedToTerms(!agreedToTerms)}
          className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
            agreedToTerms
              ? 'bg-primary border-primary'
              : 'border-border hover:border-primary'
          }`}
        >
          {agreedToTerms && <Check className="w-3 h-3 text-white" />}
        </button>
        <p className="text-sm text-muted-foreground">
          I agree to the{' '}
          <Link to="#" className="text-primary hover:underline">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link to="#" className="text-primary hover:underline">
            Privacy Policy
          </Link>
        </p>
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

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          className="flex-1 h-12 rounded-full border-border"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="flex-1 h-12 bg-primary hover:bg-navy text-white rounded-full font-medium"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </div>
    </div>
  );

  const getStepTitle = () => {
    if (selectedRole === 'customer') {
      return ['Account Info', 'Address', 'Review'][step - 1];
    }
    return ['Account Info', 'Review'][step - 1];
  };

  const totalSteps = selectedRole === 'customer' ? 3 : 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6F4FF] via-white to-[#E6F4FF] flex items-center justify-center p-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        {/* Card */}
        <div className="bg-card rounded-3xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Shirt className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground font-['Poppins']">
              Create Account
            </h1>
            <p className="text-muted-foreground mt-1">Step {step} of {totalSteps}: {getStepTitle()}</p>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2 mb-6">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full ${
                  i + 1 <= step ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && selectedRole === 'customer' && renderAddressStep()}
            {step === 2 && selectedRole !== 'customer' && renderReviewStep()}
            {step === 3 && renderReviewStep()}
          </form>

          {/* Login Link */}
          <p className="text-center text-muted-foreground mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
