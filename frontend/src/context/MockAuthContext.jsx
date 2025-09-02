import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock user data
const mockUser = {
  uid: 'mock-user-123',
  email: 'test@example.com',
  displayName: 'John Doe',
  phoneNumber: '+1234567890',
  photoURL: null,
  emailVerified: true
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(mockUser);
  const [loading, setLoading] = useState(false);

  // Mock authentication functions
  const signInWithEmailAndPassword = async (email, password) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser(mockUser);
    setLoading(false);
    return { user: mockUser };
  };

  const createUserWithEmailAndPassword = async (email, password) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setUser(mockUser);
    setLoading(false);
    return { user: mockUser };
  };

  const signInWithPhoneNumber = async (phoneNumber) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return {
      confirm: async (verificationCode) => {
        setUser(mockUser);
        setLoading(false);
        return { user: mockUser };
      }
    };
  };

  const signOut = async () => {
    setUser(null);
  };

  const updateProfile = async (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  const updateDisplayName = async (displayName) => {
    setUser(prev => ({ ...prev, displayName }));
  };

  const value = {
    user,
    loading,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPhoneNumber,
    signOut,
    updateProfile,
    updateDisplayName
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};