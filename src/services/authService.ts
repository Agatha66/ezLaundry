import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, getDocs, deleteDoc, collection, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { mockAuth, mockFirestore, type MockUser } from '@/lib/mockAuth';
import type { User, UserRole } from '@/types';

// Check if we're using demo credentials
const isDemoMode = import.meta.env.VITE_FIREBASE_API_KEY === 'demo-key' || 
                   !import.meta.env.VITE_FIREBASE_API_KEY;

export const authService = {
  // Register new user with role
  async register(
    email: string, 
    password: string, 
    displayName: string, 
    role: UserRole = 'customer',
    additionalData?: Partial<User>
  ): Promise<User> {
    if (isDemoMode) {
      // Use mock auth - creates user but doesn't notify yet
      const mockUser = await mockAuth.createUserWithEmailAndPassword(
        email,
        password,
        displayName,
        role,
        additionalData?.phone,
        additionalData?.address
      );

      // Store in mock firestore FIRST
      const userDataToStore = {
        email,
        displayName,
        role,
        phone: additionalData?.phone,
        address: additionalData?.address,
        createdAt: new Date(),
      };
      await mockFirestore.setDoc('users', mockUser.uid, userDataToStore);
      console.log('[Mock] User registered with data:', userDataToStore);

      // NOW set current user and notify listeners
      mockAuth.setCurrentUser(mockUser);

      return {
        uid: mockUser.uid,
        email,
        displayName,
        role,
        phone: additionalData?.phone,
        address: additionalData?.address,
        createdAt: new Date(),
      };
    }

    console.log('Firebase API Key:', import.meta.env.VITE_FIREBASE_API_KEY ? 'Set (Real Mode)' : 'Not Set (Mock Mode)');
    console.log('isDemoMode:', isDemoMode);

    // Use real Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Update profile
    await updateProfile(firebaseUser, { displayName });

    // Create user document in Firestore
    const userData: Omit<User, 'uid'> = {
      email,
      displayName,
      role,
      createdAt: new Date(),
      ...additionalData,
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), {
      ...userData,
      createdAt: serverTimestamp(),
    });

    return {
      uid: firebaseUser.uid,
      ...userData,
    };
  },

  // Login user
  async login(email: string, password: string): Promise<FirebaseUser | MockUser> {
    if (isDemoMode) {
      const mockUser = await mockAuth.signInWithEmailAndPassword(email, password);
      return mockUser as any;
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  // Logout user
  async logout(): Promise<void> {
    if (isDemoMode) {
      await mockAuth.signOut();
      return;
    }
    await signOut(auth);
  },

  // Get current user data from Firestore
  async getUserData(uid: string): Promise<User | null> {
    if (isDemoMode) {
      const data = await mockFirestore.getDoc('users', uid);
      if (data) {
        return {
          uid,
          email: data.email,
          displayName: data.displayName,
          role: data.role || 'customer',
          phone: data.phone,
          address: data.address,
          createdAt: data.createdAt,
        };
      }
      return null;
    }

    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { uid, ...docSnap.data() } as User;
    }
    return null;
  },

  // Subscribe to auth state changes
  onAuthStateChanged(callback: (user: FirebaseUser | MockUser | null) => void) {
    if (isDemoMode) {
      return mockAuth.onAuthStateChanged((user) => {
        callback(user as any);
      });
    }
    return onAuthStateChanged(auth, callback);
  },

  // Update user data
  async updateUserData(uid: string, updates: Partial<User>): Promise<void> {
    if (isDemoMode) {
      // Get current user data
      const currentData = await mockFirestore.getDoc('users', uid);
      if (!currentData) throw new Error('User not found');

      // Merge updates
      const updatedData = { ...currentData, ...updates, updatedAt: new Date() };
      await mockFirestore.setDoc('users', uid, updatedData);
      
      // Also update mock auth user if displayName changed
      if (updates.displayName) {
        await mockAuth.updateUserProfile(uid, updates.displayName);
      }
      
      console.log('[Mock] User data updated:', uid, updates);
      return;
    }

    // Update Firestore document
    const userRef = doc(db, 'users', uid);
    await setDoc(userRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // Update Firebase Auth profile if displayName changed
    if (updates.displayName && auth.currentUser) {
      await updateProfile(auth.currentUser, { displayName: updates.displayName });
    }
  },

  // Get all users (for admin)
  async getAllUsers(): Promise<User[]> {
    if (isDemoMode) {
      // Get all users from mock firestore
      const allDocs = await mockFirestore.getAllDocs('users');
      return allDocs.map(([uid, data]) => ({
        uid,
        email: data.email,
        displayName: data.displayName,
        role: data.role || 'customer',
        phone: data.phone,
        address: data.address,
        createdAt: data.createdAt,
      }));
    }

    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }) as User);
  },

  // Delete user (for admin)
  async deleteUser(uid: string): Promise<void> {
    if (isDemoMode) {
      // Delete from mock auth
      mockAuth.deleteUser(uid);
      // Delete from mock firestore
      await mockFirestore.deleteDoc('users', uid);
      console.log('[Mock] User deleted:', uid);
      return;
    }

    // Delete from Firestore
    await deleteDoc(doc(db, 'users', uid));
    
    // Note: Deleting from Firebase Auth requires Admin SDK or the user to be signed in
    // For now, we just delete from Firestore. The auth user will remain but won't be accessible.
    console.log('[Auth] User data deleted from Firestore:', uid);
  },
};
