import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { authService } from '@/services/authService';
import type { User, UserRole, Address } from '@/types';

// Mock user type from mockAuth
interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
}

type AuthUser = FirebaseUser | MockUser;

interface AuthContextType {
  currentUser: AuthUser | null;
  userData: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string, role?: UserRole, additionalData?: { phone?: string; address?: Address }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    
    try {
      unsubscribe = authService.onAuthStateChanged(async (user) => {
        setCurrentUser(user as AuthUser);

        if (user) {
          // Retry getUserData up to 3 times (Firestore may lag after registration)
          let data = null;
          for (let attempt = 1; attempt <= 3; attempt++) {
            try {
              data = await authService.getUserData(user.uid);
              if (data) break;
            } catch (err) {
              console.log(`[Auth] getUserData attempt ${attempt} failed, retrying...`);
            }
            if (attempt < 3) await new Promise(r => setTimeout(r, 500));
          }
          // Only set if we got data (register() may have already set it)
          if (data) setUserData(data);
        } else {
          setUserData(null);
        }

        setLoading(false);
      });
    } catch (err) {
      console.error('Error setting up auth listener:', err);
      setLoading(false);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    await authService.login(email, password);
  };

  const register = async (email: string, password: string, displayName: string, role: UserRole = 'customer', additionalData?: { phone?: string; address?: Address }) => {
    const newUser = await authService.register(email, password, displayName, role, additionalData);
    // Immediately set userData so ProtectedRoute doesn't redirect to login
    // while waiting for the auth state listener to catch up
    setUserData(newUser);
  };

  const logout = async () => {
    await authService.logout();
  };

  const value = {
    currentUser,
    userData,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
