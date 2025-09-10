import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPhoneNumber, 
  RecaptchaVerifier,
  signOut as firebaseSignOut,
  updateProfile
} from 'firebase/auth';
import { httpsCallable } from 'firebase/functions';
import { auth, functions } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState(null);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Create or update user profile in Firestore
        try {
          const createUserProfile = httpsCallable(functions, 'createUserProfile');
          await createUserProfile({
            displayName: firebaseUser.displayName,
            phoneNumber: firebaseUser.phoneNumber,
            email: firebaseUser.email
          });
          
          setUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            phoneNumber: firebaseUser.phoneNumber,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL
          });
        } catch (error) {
          console.error('Error creating user profile:', error);
          setUser({
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            phoneNumber: firebaseUser.phoneNumber,
            email: firebaseUser.email,
            photoURL: firebaseUser.photoURL
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Initialize reCAPTCHA verifier
  const initRecaptcha = () => {
    if (!recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': () => {
          // reCAPTCHA solved
        }
      });
      setRecaptchaVerifier(verifier);
      return verifier;
    }
    return recaptchaVerifier;
  };

  const sendOTP = async (phoneNumber) => {
    try {
      const verifier = initRecaptcha();
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      return confirmationResult;
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  };

  const verifyOTP = async (confirmationResult, otp) => {
    try {
      const result = await confirmationResult.confirm(otp);
      return result.user;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  };

  const updateUserProfile = async (displayName, photoURL) => {
    try {
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName,
          photoURL
        });
        
        // Update user state
        setUser(prev => ({
          ...prev,
          displayName,
          photoURL
        }));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Update online status before signing out
      if (user) {
        const updateUserStatus = httpsCallable(functions, 'updateUserStatus');
        await updateUserStatus({ isOnline: false });
      }
      
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const isAuthenticated = () => {
    return !!user;
  };

  const value = {
    user,
    loading,
    sendOTP,
    verifyOTP,
    updateUserProfile,
    logout,
    isAuthenticated,
    initRecaptcha
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
      <div id="recaptcha-container"></div>
    </AuthContext.Provider>
  );
};
    user,
    token,
    loading,
    login,
    logout,
    isAuthenticated
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};