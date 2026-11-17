// Mock Authentication Service for Demo
// This simulates Firebase auth without requiring real Firebase credentials

import type { UserRole, Address } from '@/types';
import { loadMap, saveMap } from './mockFirestore';

const USERS_KEY = 'ezl-demo-auth-users';
const SESSION_KEY = 'ezl-demo-auth-session';
const USERDATA_KEY = 'ezl-demo-users';

export interface MockUser {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  address?: Address;
}

// Store mock users in memory
const mockUsers: Map<string, MockUser> = loadMap(USERS_KEY);
const persistUsers = () => saveMap(USERS_KEY, mockUsers);
const persistSession = (uid: string | null) => {
  try {
    if (uid) localStorage.setItem(SESSION_KEY, uid); else localStorage.removeItem(SESSION_KEY);
  } catch { /* ignore */ }
};
const restoreSession = (): MockUser | null => {
  try {
    const uid = localStorage.getItem(SESSION_KEY);
    return uid ? mockUsers.get(uid) ?? null : null;
  } catch {
    return null;
  }
};

// Generate a random UID
const generateUID = () => {
  return 'mock-' + Math.random().toString(36).substring(2, 15);
};

// Mock Firebase Auth class
class MockAuth {
  private currentUser: MockUser | null = restoreSession();
  private listeners: ((user: MockUser | null) => void)[] = [];

  // Sign up new user
  async createUserWithEmailAndPassword(
    email: string,
    _password: string,
    displayName: string,
    role: UserRole = 'customer',
    phone?: string,
    address?: Address
  ): Promise<MockUser> {
    // Check if user already exists
    for (const user of mockUsers.values()) {
      if (user.email === email) {
        const error = new Error('Email already in use');
        (error as any).code = 'auth/email-already-in-use';
        throw error;
      }
    }

    const newUser: MockUser = {
      uid: generateUID(),
      email,
      displayName,
      role,
      phone,
      address,
    };

    // Store user first, but DON'T notify listeners yet
    mockUsers.set(newUser.uid, newUser);
    persistUsers();
    
    // Return the user without notifying - the caller will handle Firestore and then notify
    return newUser;
  }

  // Sign in existing user
  async signInWithEmailAndPassword(email: string, _password: string): Promise<MockUser> {
    for (const user of mockUsers.values()) {
      if (user.email === email) {
        this.currentUser = user;
        persistSession(user.uid);
        this.notifyListeners();
        return user;
      }
    }

    const error = new Error('Invalid email or password');
    (error as any).code = 'auth/invalid-credential';
    throw error;
  }

  // Sign out
  async signOut(): Promise<void> {
    this.currentUser = null;
    persistSession(null);
    this.notifyListeners();
  }

  // Get current user
  getCurrentUser(): MockUser | null {
    return this.currentUser;
  }

  // Subscribe to auth state changes
  onAuthStateChanged(callback: (user: MockUser | null) => void): () => void {
    this.listeners.push(callback);
    // Immediately call with current state
    callback(this.currentUser);

    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners() {
    this.listeners.forEach((callback) => callback(this.currentUser));
  }

  // Update user profile
  async updateUserProfile(uid: string, displayName: string): Promise<void> {
    const user = mockUsers.get(uid);
    if (user) {
      user.displayName = displayName;
      if (this.currentUser?.uid === uid) {
        this.currentUser.displayName = displayName;
      }
      this.notifyListeners();
    }
  }

  // Set current user and notify listeners (called after Firestore is ready)
  setCurrentUser(user: MockUser): void {
    this.currentUser = user;
    persistSession(user.uid);
    this.notifyListeners();
  }

  // Delete user
  deleteUser(uid: string): void {
    mockUsers.delete(uid);
    persistUsers();
    if (this.currentUser?.uid === uid) {
      this.currentUser = null;
      persistSession(null);
      this.notifyListeners();
    }
  }
}

// Create singleton instance
export const mockAuth = new MockAuth();

// Mock Firestore for user data
class MockFirestore {
  private data: Map<string, any> = loadMap(USERDATA_KEY);

  async setDoc(collection: string, docId: string, data: any): Promise<void> {
    const key = `${collection}/${docId}`;
    this.data.set(key, JSON.parse(JSON.stringify({ ...data, id: docId })));
    saveMap(USERDATA_KEY, this.data);
  }

  async getDoc(collection: string, docId: string): Promise<any | null> {
    const key = `${collection}/${docId}`;
    return this.data.get(key) || null;
  }

  async getAllDocs(collection: string): Promise<[string, any][]> {
    const results: [string, any][] = [];
    const prefix = `${collection}/`;
    
    for (const [key, value] of this.data.entries()) {
      if (key.startsWith(prefix)) {
        const docId = key.replace(prefix, '');
        results.push([docId, value]);
      }
    }
    
    return results;
  }

  async deleteDoc(collection: string, docId: string): Promise<void> {
    const key = `${collection}/${docId}`;
    this.data.delete(key);
    saveMap(USERDATA_KEY, this.data);
  }
}

export const mockFirestore = new MockFirestore();
