import { create } from 'zustand';

// Mock user data
const mockUser = {
  uid: 'mock-user-123',
  email: 'test@example.com',
  displayName: 'John Doe',
  phoneNumber: '+1234567890',
  photoURL: null,
  emailVerified: true
};

const mockUserData = {
  uid: 'mock-user-123',
  displayName: 'John Doe',
  email: 'test@example.com',
  phoneNumber: '+1234567890',
  photoURL: null,
  bio: 'Software Developer passionate about building amazing user experiences',
  location: 'San Francisco, CA',
  memberSince: new Date('2024-12-15').toISOString(),
  contacts: [],
  pendingRequests: [],
  deviceTokens: [],
  settings: {
    notifications: {
      messages: true,
      groups: true,
      email: true,
      push: true,
      sound: true,
      vibration: true
    },
    privacy: {
      profileVisibility: 'contacts',
      readReceipts: true,
      lastSeen: true
    },
    chat: {
      enterToSend: true,
      darkMode: false,
      language: 'en'
    }
  }
};

const useAuthStore = create((set, get) => ({
  // State
  user: mockUser,
  userData: mockUserData,
  isLoading: false,
  isInitialized: true,

  // Actions
  initialize: () => {
    return Promise.resolve();
  },

  setUser: (user) => set({ user }),
  
  setUserData: async (userData) => {
    set({ userData });
  },

  updateUserData: async (updates) => {
    const { userData } = get();
    set({ userData: { ...userData, ...updates } });
  },

  signOut: async () => {
    // Don't actually sign out in demo mode
    console.log('Sign out clicked - demo mode');
  }
}));

export default useAuthStore;